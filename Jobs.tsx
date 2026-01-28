import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { JobCard } from "@/components/JobCard"
import { JobModal } from "@/components/JobModal"

interface Job {
  job_id: string;
  job_title: string;
  company_name: string;
  description: string;
  match_score?: number;
  applicants?: number;
  location?: string;
}

interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  limit: number;
}

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);

  const [selectedJob, setSelectedJob] = useState<{
    jobId: string
    title: string
    company?: string
    description: string
    matchScore?: number
  } | null>(null)

  useEffect(() => {
    setLoading(true);
    fetch(`/api/jobs?page=${page}&limit=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
      })
      .then((data: JobsResponse) => {
        setJobs(data.data);
        setTotalJobs(data.total);
        setTotalPages(Math.ceil(data.total / limit));
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch jobs:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [page, limit]);

  // Client-side filtering for the current page
  // Note: For full dataset search, backend search implementation is required.
  const filteredJobs = jobs.filter(job =>
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

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
              placeholder="Search jobs on this page..."
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

        {/* Job Listings */}
        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : (
          <div className="space-y-6">
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
                <p className="text-center text-gray-500">No jobs found on this page.</p>
              )}
            </div>

            {/* Pagination Controls */}
            {!error && jobs.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{Math.min((page - 1) * limit + 1, totalJobs)}</span> to{" "}
                  <span className="font-medium">{Math.min(page * limit, totalJobs)}</span> of{" "}
                  <span className="font-medium">{totalJobs}</span> results
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
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
