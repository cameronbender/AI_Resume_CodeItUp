-- CLEANUP
-- DROP TABLE IF EXISTS applications;
-- DROP TABLE IF EXISTS jobs;
-- DROP TABLE IF EXISTS users;
-- DROP TYPE IF EXISTS rank_tier;
-- CREATE CUSTOM TYPES
-- This ensures data integrity for the ranks
CREATE TYPE rank_tier AS ENUM (
    'Barista',
    'Intern',
    'Junior Dev',
    'Senior Dev',
    'Managing Director',
    'CEO'
);
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
-- USERS TABLE (The Players)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'candidate',
    mmr_score INT DEFAULT 0 CHECK (mmr_score >= 0),
    current_tier rank_tier DEFAULT 'Barista',
    streak_count INT DEFAULT 0,
    resume_data BYTEA,
    resume_filename VARCHAR(255),
    last_applied_at TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- JOBS TABLE (The Dungeons)
CREATE TABLE jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    -- Weights were used to help the AI prioritize specific skills
    weights JSONB DEFAULT '{"technical": 50, "experience": 30, "education": 20}',
    is_active BOOLEAN DEFAULT TRUE,
    source_file VARCHAR(255),
    source_file_data BYTEA,
    owner_id UUID REFERENCES users(user_id) ON DELETE
    SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- APPLICATIONS TABLE (The Encounters)
CREATE TABLE applications (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE NOT NULL,
    match_score FLOAT NOT NULL CHECK (
        match_score >= 0
        AND match_score <= 100
    ),
    -- Analysis stores: {"strengths": [], "weaknesses": [], "ai_insult": ""}
    analysis JSONB NOT NULL,
    -- {"skills": ["Java", "SQL"], "years_of_experience": 5, "education": "BS CS", "certifications": []}
    resume_metadata JSONB,
    resume_data BYTEA,
    resume_text TEXT,
    resume_filename VARCHAR(255),
    -- Stores file name, page count, etc.
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Global leaderboard view
CREATE VIEW global_leaderboard AS
SELECT username,
    current_tier,
    mmr_score,
    streak_count,
    RANK() OVER (
        ORDER BY mmr_score DESC
    ) as global_rank
FROM users
WHERE mmr_score > 0
LIMIT 100;
-- Performance & Scaling
-- Speed up leaderboard sorting
CREATE INDEX idx_users_mmr ON users (mmr_score DESC);
-- Speed up finding all applications for a specific user
CREATE INDEX idx_apps_user_id ON applications (user_id);
-- Speed up finding the most relevant jobs
CREATE INDEX idx_jobs_active ON jobs (is_active);
-- "Evil" MMR Update Function
CREATE OR REPLACE FUNCTION update_user_rank() RETURNS TRIGGER AS $$ BEGIN -- Update the User's MMR, Streak, and Tier based on the new application score
UPDATE users
SET -- Streak Logic: If match match_score > 80, increment streak, else reset
    streak_count = CASE
        WHEN NEW.match_score > 80 THEN streak_count + 1
        ELSE 0
    END,
    -- MMR Logic: Add match_score + (streak * 10) bonus
    mmr_score = mmr_score + (NEW.match_score)::INT + (
        CASE
            WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
            ELSE 0
        END
    ),
    -- Tier Logic: Based on new total MMR
    current_tier = CASE
        WHEN (
            mmr_score + (NEW.match_score)::INT + (
                CASE
                    WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
                    ELSE 0
                END
            )
        ) >= 5000 THEN 'CEO'::rank_tier
        WHEN (
            mmr_score + (NEW.match_score)::INT + (
                CASE
                    WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
                    ELSE 0
                END
            )
        ) >= 4000 THEN 'Managing Director'::rank_tier
        WHEN (
            mmr_score + (NEW.match_score)::INT + (
                CASE
                    WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
                    ELSE 0
                END
            )
        ) >= 3000 THEN 'Senior Dev'::rank_tier
        WHEN (
            mmr_score + (NEW.match_score)::INT + (
                CASE
                    WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
                    ELSE 0
                END
            )
        ) >= 2000 THEN 'Junior Dev'::rank_tier
        WHEN (
            mmr_score + (NEW.match_score)::INT + (
                CASE
                    WHEN NEW.match_score > 80 THEN (streak_count + 1) * 10
                    ELSE 0
                END
            )
        ) >= 1000 THEN 'Intern'::rank_tier
        ELSE 'Barista'::rank_tier
    END,
    last_applied_at = NOW()
WHERE user_id = NEW.user_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER after_app_insert
AFTER
INSERT ON applications FOR EACH ROW EXECUTE FUNCTION update_user_rank();