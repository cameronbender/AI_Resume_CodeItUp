import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { FolderOpen, Briefcase, ChevronRight, Users } from "lucide-react"

interface Job {
  job_id: string
  job_title: string
  company_name: string
  description: string
  applicant_count?: number
}

interface JobWithApplicants extends Job {
  applicants?: { username: string; match_score: number; current_tier: string }[]
}

export function MyJobs() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobWithApplicants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "recruiter") {
      navigate("/login")
      return
    }
    setLoading(true)
    fetch("/api/jobs/mine", {
      headers: { "X-User-Id": user.user_id },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Please log in" : "Failed to load jobs")
        return res.json()
      })
      .then((data: { data: JobWithApplicants[] }) => {
        setJobs(data.data || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [isAuthenticated, user?.role, navigate])

  const fetchApplicants = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }
    setExpandedJobId(jobId)
    fetch(`/api/jobs/${jobId}/applicants?limit=20`)
      .then((res) => res.ok ? res.json() : { data: [] })
      .then((data: { data: { username: string; match_score: number; current_tier: string }[] }) => {
        setJobs((prev) =>
          prev.map((j) =>
            j.job_id === jobId ? { ...j, applicants: data.data || [] } : j
          )
        )
      })
      .catch(() => {})
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-full">
            <FolderOpen className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black">My Job Listings</h1>
            <p className="text-gray-600">Jobs you posted and their applicants</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <Card className="border-purple-200">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You haven’t posted any jobs yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.job_id} className="border-purple-200">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors rounded-t-lg"
                  onClick={() => fetchApplicants(job.job_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.job_title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{job.company_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {job.applicant_count !== undefined && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {job.applicant_count} applicants
                        </span>
                      )}
                      <ChevronRight
                        className={`h-5 w-5 transition-transform ${expandedJobId === job.job_id ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>
                </CardHeader>
                {expandedJobId === job.job_id && job.applicants && (
                  <CardContent className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-black mb-3">Applicants</h4>
                    {job.applicants.length === 0 ? (
                      <p className="text-sm text-gray-500">No applicants yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {job.applicants.map((a, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium">{a.username}</span>
                            <span className="text-sm text-gray-600">
                              {a.match_score}% match · {a.current_tier}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
