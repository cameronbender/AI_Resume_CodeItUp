import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { FolderOpen, Briefcase, ChevronRight, Users, Plus, Trash2, Info } from "lucide-react"

interface Job {
  job_id: string
  job_title: string
  company_name: string
  description: string
  applicant_count?: number
}

interface ApplicationAnalysis {
  strengths?: string[]
  weaknesses?: string[]
  ai_insult?: string
  analysis?: string
}

interface Applicant {
  username: string
  match_score: number
  current_tier: string
  analysis?: ApplicationAnalysis | null
}

function displayAnalysisText(text: string): string {
  return text.replace(/You used quick apply[^.]*\.?/gi, "Applied before feedback implementation.")
}

interface JobWithApplicants extends Job {
  applicants?: Applicant[]
}

export function MyJobs() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobWithApplicants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [analysisPopupApplicant, setAnalysisPopupApplicant] = useState<Applicant | null>(null)

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
      .then((data: { data: Applicant[] }) => {
        setJobs((prev) =>
          prev.map((j) =>
            j.job_id === jobId ? { ...j, applicants: data.data || [] } : j
          )
        )
      })
      .catch(() => { })
  }

  // Job Creation State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newJob, setNewJob] = useState({ title: "", company: "", description: "" })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJob.title || !newJob.company || !newJob.description) return

    setCreateLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", newJob.title)
      formData.append("company_name", newJob.company)
      formData.append("description", newJob.description)
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "X-User-Id": user?.user_id || ""
        },
        body: formData
      })

      if (!res.ok) throw new Error("Failed to create job")

      const data = await res.json()

      // Add new job to list immediately
      setJobs(prev => [{
        job_id: data.data.job_id,
        job_title: data.data.job_title,
        company_name: data.data.company_name,
        description: data.data.description,
        applicant_count: 0,
        applicants: []
      }, ...prev])

      setIsCreateOpen(false)
      setNewJob({ title: "", company: "", description: "" })
      setSelectedFile(null)
    } catch (err) {
      console.error(err)
    } finally {
      setCreateLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    setSelectedFile(file)

    if (file) {
      // Auto-parse
      const formData = new FormData()
      formData.append("file", file)

      // Add toast at some point in the future
      setCreateLoading(true)
      try {
        const res = await fetch("/api/jobs/parse", {
          method: "POST",
          headers: { "X-User-Id": user?.user_id || "" },
          body: formData
        })
        if (res.ok) {
          const data = await res.json()
          if (data.data) {
            setNewJob(prev => ({
              ...prev,
              title: data.data.title || prev.title,
              company: data.data.company_name || prev.company,
              description: data.data.description || prev.description
            }))
          }
        }
      } catch (err) {
        console.error("Autofill failed", err)
      } finally {
        setCreateLoading(false)
      }
    }
  }

  const handleDeleteJob = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation() // Prevent card expansion
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { "X-User-Id": user?.user_id || "" }
      })

      if (res.ok) {
        setJobs(prev => prev.filter(j => j.job_id !== jobId))
      } else {
        const data = await res.json()
        alert(data.detail || "Failed to delete job")
      }
    } catch (err) {
      console.error("Delete failed", err)
      alert("Failed to delete job")
    }
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

        <div className="flex justify-end mb-6">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Post New Job
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post a New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                <div className="bg-transparent">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.txt,.doc,.docx"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      Autofill from File
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <Input
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    placeholder="e.g. Senior React Developer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <Input
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    placeholder="e.g. TechCorp Inc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    className="w-full min-h-[150px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the role, requirements, and benefits..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading} className="bg-purple-600 hover:bg-purple-700">
                    {createLoading ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteJob(e, job.job_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg gap-2"
                          >
                            <span className="font-medium">{a.username}</span>
                            <span className="text-sm text-gray-600">
                              {a.match_score}% match · {a.current_tier}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary/90 shrink-0"
                              onClick={() => setAnalysisPopupApplicant(a)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              See why
                            </Button>
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

        {/* See why – analysis popup */}
        <Dialog open={!!analysisPopupApplicant} onOpenChange={(open) => !open && setAnalysisPopupApplicant(null)}>
          <DialogContent className="max-w-2xl" onClose={() => setAnalysisPopupApplicant(null)}>
            <DialogHeader>
              <DialogTitle className="text-lg">
                {analysisPopupApplicant?.username} · {analysisPopupApplicant?.match_score}% match
              </DialogTitle>
            </DialogHeader>
            {analysisPopupApplicant && (
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  Tier: <span className="font-medium text-black">{analysisPopupApplicant.current_tier}</span>
                </p>
                {analysisPopupApplicant.analysis && (
                  <>
                    {typeof analysisPopupApplicant.analysis.analysis === "string" ? (
                      <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                        <p className="font-medium text-black mb-2">Analysis</p>
                        <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {displayAnalysisText(analysisPopupApplicant.analysis.analysis)}
                        </pre>
                      </div>
                    ) : (
                      <>
                        {analysisPopupApplicant.analysis.strengths?.length ? (
                          <div>
                            <p className="font-medium text-black mb-1">Strengths</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                              {analysisPopupApplicant.analysis.strengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {analysisPopupApplicant.analysis.weaknesses?.length ? (
                          <div>
                            <p className="font-medium text-black mb-1">Areas to improve</p>
                            <ul className="list-disc list-inside text-gray-700 space-y-0.5">
                              {analysisPopupApplicant.analysis.weaknesses.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {analysisPopupApplicant.analysis.ai_insult && (
                          <p className="text-amber-700 italic border-l-2 border-amber-300 pl-2">
                            {displayAnalysisText(analysisPopupApplicant.analysis.ai_insult)}
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
                {(!analysisPopupApplicant.analysis ||
                  (typeof analysisPopupApplicant.analysis.analysis !== "string" &&
                    !analysisPopupApplicant.analysis.strengths?.length &&
                    !analysisPopupApplicant.analysis.weaknesses?.length &&
                    !analysisPopupApplicant.analysis.ai_insult)) && (
                  <p className="text-gray-500 italic">Detailed feedback will appear here when available.</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}