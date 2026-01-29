import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { JobDescription } from "./JobDescription"
import { Button } from "@/components/ui/button"
import { RankBadge } from "@/components/RankBadge"
import { useAuth } from "@/contexts/AuthContext"
import { Zap, Loader2, CheckCircle2, Users } from "lucide-react"

interface TopApplicant {
  username: string
  match_score: number
  current_tier: string
  rank?: number
}

interface JobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  title: string
  company?: string
  description: string
  matchScore?: number
}

function mapTierToRankBadge(tier?: string): "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger" {
  const tierMap: Record<string, "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"> = {
    Barista: "Iron",
    Intern: "Bronze",
    "Junior Dev": "Silver",
    "Senior Dev": "Gold",
    "Managing Director": "Challenger",
    CEO: "Challenger",
  }
  if (!tier) return "Iron"
  if (["Iron", "Bronze", "Silver", "Gold", "Challenger"].includes(tier)) {
    return tier as "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"
  }
  return tierMap[tier] || "Iron"
}

export function JobModal({
  open,
  onOpenChange,
  jobId,
  title,
  company,
  description,
}: JobModalProps) {
  const { user, isAuthenticated } = useAuth()
  const [topApplicants, setTopApplicants] = useState<TopApplicant[]>([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [quickApplyLoading, setQuickApplyLoading] = useState(false)
  const [quickApplyDone, setQuickApplyDone] = useState(false)
  const [quickApplyError, setQuickApplyError] = useState<string | null>(null)

  useEffect(() => {
    if (open && jobId) {
      setApplicantsLoading(true)
      setQuickApplyError(null)
      setQuickApplyDone(false)
      fetch(`/api/jobs/${jobId}/applicants?limit=5`)
        .then((res) => (res.ok ? res.json() : { data: [] }))
        .then((data: { data: TopApplicant[] }) => {
          setTopApplicants(data.data || [])
        })
        .catch(() => setTopApplicants([]))
        .finally(() => setApplicantsLoading(false))
    }
  }, [open, jobId])

  const handleQuickApply = async () => {
    if (!isAuthenticated || !user) {
      setQuickApplyError("Please log in to Quick Apply.")
      return
    }
    // Check if user has resume on file (from auth context backend data) or if they just uploaded one locally (profileResume)
    // Ideally we should just rely on user.has_resume. 
    // If profileResume exists contextually but not in backend yet, that's an edge case, but we assume upload updates backend.

    // Fallback: if user.has_resume is false, we can't quick apply via backend unless we upload first.
    // Since we simplified: Profile uploads to backend. JobModal just triggers "use stored resume".

    if (!user.has_resume) {
      setQuickApplyError("Upload your resume on your Profile first, then Quick Apply.")
      return
    }

    setQuickApplyError(null)
    setQuickApplyLoading(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          job_id: jobId,
          use_profile_resume: true
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || "Apply failed")

      setQuickApplyDone(true)
      // TODO: Update top applicants list
    } catch (err: unknown) {
      setQuickApplyError(err instanceof Error ? err.message : "Quick Apply failed")
    } finally {
      setQuickApplyLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">
            {title}
            {company && <span className="text-lg text-gray-600 font-normal"> – {company}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left: Job description (fixed height area) */}
          <div className="space-y-4">
            <div className="max-h-[280px] overflow-y-auto border border-purple-200 rounded-lg">
              <JobDescription descriptionText={description} className="border-0 shadow-none" />
            </div>

            {/* Quick Apply: no upload, just button */}
            <div className="border-t border-gray-200 pt-4">
              <Button
                onClick={handleQuickApply}
                disabled={quickApplyLoading || quickApplyDone || !user?.has_resume}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {quickApplyLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Applying…
                  </>
                ) : quickApplyDone ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Applied!
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Quick Apply
                  </>
                )}
              </Button>
              {quickApplyError && (
                <p className="text-sm text-red-600 mt-2">{quickApplyError}</p>
              )}
              {user && !user.has_resume && (
                <p className="text-sm text-yellow-600 mt-2">
                  Please upload a resume on your Profile page to enable Quick Apply.
                </p>
              )}
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">Log in and add a resume on your Profile to Quick Apply.</p>
              )}
            </div>
          </div>

          {/* Right: Top 5 applicants (same height as job description area) */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top applicants
            </h3>
            <div className="flex-1 min-h-[200px] max-h-[280px] overflow-y-auto border border-purple-200 rounded-lg bg-gray-50/50 p-4">
              {applicantsLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : topApplicants.length === 0 ? (
                <p className="text-sm text-gray-500">No applicants yet.</p>
              ) : (
                <ul className="space-y-3">
                  {topApplicants.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg border border-gray-100"
                    >
                      <span className="w-6 text-sm font-bold text-gray-500">#{i + 1}</span>
                      <RankBadge tier={mapTierToRankBadge(a.current_tier)} size="sm" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-black truncate block">{a.username}</span>
                        <span className="text-xs text-gray-500">{a.match_score}% match</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
