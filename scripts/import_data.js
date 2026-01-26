const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const pdfLib = require('pdf-parse'); 
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const JOB_INPUT_PATH = process.argv[2];
const RESUME_DIR_PATH = process.argv[3];

if (!JOB_INPUT_PATH || !RESUME_DIR_PATH) {
    console.error("Usage: node import_data.js <jobs_dir_or_file> <resumes_dir>");
    process.exit(1);
}

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        await client.connect();
        console.log("Connected to Database.");

        // Debug pdf-parse import
        // console.log("pdf-parse type:", typeof pdfLib);
        // console.log("pdf-parse value:", pdfLib);

        let pdfParser = pdfLib;
        // Handle potential ES module default export
        if (typeof pdfLib !== 'function' && typeof pdfLib.default === 'function') {
            pdfParser = pdfLib.default;
        }

        // --- STEP 1: Process Resumes (Create Users) ---
        console.log("--- Step 1: Processing Resumes ---");
        const resumeFiles = fs.readdirSync(RESUME_DIR_PATH).filter(f => f.toLowerCase().endsWith('.pdf'));
        const processedResumes = []; // { userId, resumeText, dataBuffer, filename }

        console.log(`Found ${resumeFiles.length} resumes. Import starting...`);

        for (const file of resumeFiles) {
            const filePath = path.join(RESUME_DIR_PATH, file);

            try {
                const dataBuffer = fs.readFileSync(filePath);

                // Parse PDF
                let resumeText = "";
                try {
                    const pdfData = await pdfParser(dataBuffer);
                    resumeText = pdfData.text;
                } catch (pdfErr) {
                    console.error(`PDF Parsing Error for ${file}:`, pdfErr.message);
                    // Skip this file if we can't read text (optional: store with empty text?)
                    // We'll skip to be safe.
                    continue;
                }

                // Simple username sanitization
                const username = path.basename(file, '.pdf').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 48);
                const email = `${username}@example.com`;

                // UPSERT User
                let userId;
                try {
                    // Try to find existing first
                    const existingRes = await client.query('SELECT user_id FROM users WHERE username = $1', [username]);
                    if (existingRes.rows.length > 0) {
                        userId = existingRes.rows[0].user_id;
                    } else {
                        // Insert new
                        const insertRes = await client.query(`
                            INSERT INTO users (username, email, password_hash, role)
                            VALUES ($1, $2, $3, 'candidate')
                            RETURNING user_id;
                        `, [username, email, 'hash_placeholder']);
                        userId = insertRes.rows[0].user_id;
                    }
                } catch (err) {
                    // Handle race condition or unique constraint if parallel (not here, but good practice)
                    if (err.code === '23505') {
                        const existingUser = await client.query('SELECT user_id FROM users WHERE username = $1', [username]);
                        userId = existingUser.rows[0].user_id;
                    } else {
                        console.error(`Error processing user ${username}:`, err.message);
                        continue;
                    }
                }

                processedResumes.push({
                    userId,
                    resumeText,
                    dataBuffer,
                    filename: file
                });

            } catch (err) {
                console.error(`Failed to process resume file ${file}:`, err.message);
            }
        }
        console.log(`Successfully processed ${processedResumes.length} resumes.`);


        // --- STEP 2: Process Jobs & Create Applications ---
        console.log("--- Step 2: Processing Jobs & Linking Applications ---");

        // Determine input jobs (file or dir)
        let jobFiles = [];
        if (fs.statSync(JOB_INPUT_PATH).isDirectory()) {
            jobFiles = fs.readdirSync(JOB_INPUT_PATH)
                .filter(f => f.toLowerCase().endsWith('.txt'))
                .map(f => path.join(JOB_INPUT_PATH, f));
        } else {
            jobFiles = [JOB_INPUT_PATH];
        }

        console.log(`Found ${jobFiles.length} job(s).`);

        for (const jobPath of jobFiles) {
            try {
                const jobContent = fs.readFileSync(jobPath, 'utf-8');
                const jobFilename = path.basename(jobPath);
                const jobTitle = path.basename(jobPath, path.extname(jobPath)).replace(/_/g, ' ');
                // const companyName = "Gauntlet Corp"; // Simplified

                // Parsing company name from filename if possible? 
                // Filenames look like "AI_Systems_Engineer.txt". Company is likely implied matching the job.
                // We'll stick to a default or extract from text if needed. For now, filename title is used.

                // CHECK if job exists to avoid duplicates
                // We'll assume source_file is unique for now
                let jobId;
                const existingJob = await client.query('SELECT job_id FROM jobs WHERE source_file = $1', [jobFilename]);

                if (existingJob.rows.length > 0) {
                    jobId = existingJob.rows[0].job_id;
                    // console.log(`Job already exists: ${jobTitle} (${jobId}). Skipping insert.`);
                } else {
                    const jobRes = await client.query(`
                        INSERT INTO jobs (job_title, company_name, description, source_file, source_file_data)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING job_id;
                    `, [jobTitle, "Gauntlet Corp", jobContent, jobFilename, Buffer.from(jobContent)]);
                    jobId = jobRes.rows[0].job_id;
                    // console.log(`Created Job: ${jobTitle}`);
                }

                // Link ALL processed resumes to this job
                // Use parallel promise.all for speed? No, let's keep it sequential to avoid pool exhaustion
                for (const resume of processedResumes) {
                    await client.query(`
                        INSERT INTO applications (user_id, job_id, resume_data, resume_text, resume_filename, analysis, match_score)
                        VALUES ($1, $2, $3, $4, $5, '{}', 0)
                        ON CONFLICT DO NOTHING;
                    `, [resume.userId, jobId, resume.dataBuffer, resume.resumeText, resume.filename]);
                }
                process.stdout.write('.'); // Progress indicator

            } catch (err) {
                console.error(`Error processing job ${jobPath}:`, err.message);
            }
        }

        console.log("\nImport Complete!");

    } catch (err) {
        console.error("Fatal Error:", err);
    } finally {
        await client.end();
    }
}

main();
