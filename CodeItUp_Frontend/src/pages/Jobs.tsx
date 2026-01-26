import { useState } from "react"
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
  // TODO: Add state management and API call to fetch jobs from backend
  // Example: const [jobs, setJobs] = useState<Job[]>([])
  // Example: useEffect(() => { fetch('/api/jobs').then(...) }, [])
  // TODO: Implement search functionality that queries backend API
  // Example: const [searchTerm, setSearchTerm] = useState("")

  const [selectedJob, setSelectedJob] = useState<{
    jobId: string
    title: string
    company?: string
    description: string
    matchScore?: number
  } | null>(null)

  // Example job data for demonstration
  const exampleJob = {
    jobId: "1",
    title: "SoC Integration Engineer",
    company: "TechCorp Inc.",
    location: "Remote",
    description: `SoC Integration Engineer
========================

Role Description:
This role supports independent technical contribution in the area of soc integration engineer, combining design, implementation, and evaluation responsibilities. The position requires reasoning about system behavior, performance trade-offs, and experimental outcomes. Depending on the organization, the work may include applied research, prototype development, or deployment-oriented engineering. Collaboration with interdisciplinary teams is expected, along with clear communication of results and design decisions. The role operates across a mix of exploratory development, experimental validation, and production systems. Clear written and verbal communication is required to explain technical concepts and trade-offs to diverse audiences.

Qualifications:
- Background in computer science, engineering, or a closely related discipline
- Experience with modern programming languages, tools, or development environments
- Ability to analyze system behavior, performance, or correctness
- Strong problem-solving and analytical skills
- Experience conducting experiments or empirical evaluations

Salary Range (Canada):
CAD $95,000–$145,000

Track:
Applied / Engineering
Career Level:
Mid`,
    applicants: 45,
    matchScore: 82
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Job Listings</h1>
          <p className="text-gray-600">Find your next opportunity and see how you rank</p>
        </div>

        {/* Search Bar */}
        {/* TODO: Connect search input to backend API */}
        {/* TODO: Implement debounced search or search on submit */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              // TODO: Add value={searchTerm} and onChange handler
              className="pl-10"
            />
          </div>
        </div>

        {/* Job Listings */}
        {/* TODO: Fetch jobs from backend API (GET /api/jobs) */}
        {/* TODO: Backend will return job.description as txt file content (string) */}
        {/* TODO: Map over jobs array and display compact job cards */}
        {/* Example usage: */}
        {/* {jobs.map((job) => (
          <JobCard
            key={job.id}
            jobId={job.id}
            title={job.title}
            company={job.company}
            location={job.location}
            description={job.description}
            applicants={job.applicants}
            matchScore={job.matchScore}
            onClick={() => setSelectedJob({
              jobId: job.id,
              title: job.title,
              company: job.company,
              description: job.description,
              matchScore: job.matchScore
            })}
          />
        ))} */}

        <div className="space-y-4">
          {/* Example job card - remove when backend is connected */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-4 italic">Example: Compact job card (click to view details)</p>
            <JobCard
              jobId={exampleJob.jobId}
              title={exampleJob.title}
              company={exampleJob.company}
              location={exampleJob.location}
              description={exampleJob.description}
              applicants={exampleJob.applicants}
              matchScore={exampleJob.matchScore}
              onClick={() => setSelectedJob({
                jobId: exampleJob.jobId,
                title: exampleJob.title,
                company: exampleJob.company,
                description: exampleJob.description,
                matchScore: exampleJob.matchScore
              })}
            />
          </div>

          <div className="text-center py-8">
            <p className="text-gray-500">More job listings will appear here when backend is connected</p>
          </div>
        </div>

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
