import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { JobCard } from "@/components/JobCard"
import { JobModal } from "@/components/JobModal"

// TODO: Define Job interface based on backend API response
// interface Job {
//   id: string
//   title: string
//   company: string
//   location: string
//   salary: string
//   description: string // This will be the txt file content as a string
//   applicants: number
//   matchScore?: number
// }

export function Jobs() {
  interface Job {
    job_id: string;
    job_title: string;
    company_name: string;
    description: string;
    match_score?: number;
    applicants?: number;
    location?: string;
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedJob, setSelectedJob] = useState<{
    jobId: string
    title: string
    company?: string
    description: string
    matchScore?: number
  } | null>(null)

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Job Listings</h1>
          <p className="text-gray-600">Find your next opportunity and see how you rank</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error loading jobs:</strong> {error}
            <p className="text-sm mt-1">Make sure the backend server is running on port 3000.</p>
          </div>
        )}

        {/* Job Listings using Real Data */}
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.job_id}
                jobId={job.job_id}
                title={job.job_title}
                company={job.company_name}
                location={job.location || "Remote"}
                description={job.description}
                applicants={job.applicants || Math.floor(Math.random() * 50) + 1}
                matchScore={job.match_score || 0}
                onClick={() => setSelectedJob({
                  jobId: job.job_id,
                  title: job.job_title,
                  company: job.company_name,
                  description: job.description,
                  matchScore: job.match_score
                })}
              />
            ))}

            {!error && filteredJobs.length === 0 && (
              <p className="text-center text-gray-500">No jobs found matching your search.</p>
            )}
          </div>
        )}

        {/* Job Detail Modal */}
        {selectedJob && (
          <JobModal
            open={!!selectedJob}
            onOpenChange={(open) => !open && setSelectedJob(null)}
            jobId={selectedJob.jobId}
            title={selectedJob.title}
            company={selectedJob.company}
            description={selectedJob.description}
            matchScore={selectedJob.matchScore}
          />
        )}
      </div>
    </div>
  )
}
