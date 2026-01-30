import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RankBadge } from "@/components/RankBadge"
import { useAuth } from "@/contexts/AuthContext"
import { TrendingUp, Upload as UploadIcon, FileText, CheckCircle2 } from "lucide-react"
// TODO: Import Award, Trophy when implementing backend data display
// import { Award } from "lucide-react"
// import { Trophy } from "lucide-react"

// TODO: Define interfaces based on backend API response
// Backend should return currentTier as one of: "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"
// Or map profile tier names (Copper, Silver, Gold, Plat, Diamond, Champ) to RankBadge tiers
// interface UserProfile {
//   userId: string
//   name: string
//   currentTier: "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger" // TODO: Map from backend tier names
//   currentTierName: string // e.g., "Barista/McDonalds", "Intern", etc.
//   badgeStyle?: "shield" | "gauntlet" // Optional: backend can specify badge style
//   nextTierName: string
//   progressToNext: number
//   matchScore: number
//   overallRank: number
//   streak: number
//   totalApplications: number
// }


// Backend tier order and MMR thresholds (from schema: update_user_rank)
const TIER_ORDER = ["Barista", "Intern", "Junior Dev", "Senior Dev", "Managing Director", "CEO"] as const
const MMR_THRESHOLDS: Record<string, number> = {
  Barista: 0,
  Intern: 1000,
  "Junior Dev": 2000,
  "Senior Dev": 3000,
  "Managing Director": 4000,
  CEO: 5000,
}
// Min avg match score required to rank up to each tier (respectively: 50, 60, 70, 80, 90)
const MIN_MATCH_SCORE_FOR_NEXT_TIER: Record<string, number> = {
  Intern: 50,
  "Junior Dev": 60,
  "Senior Dev": 70,
  "Managing Director": 80,
  CEO: 90,
}

function getTierProgress(mmr: number, currentTier: string): { progressPercent: number; nextTier: string | null; mmrInTier: number; mmrNeededForNext: number } {
  const tierIndex = TIER_ORDER.indexOf(currentTier as typeof TIER_ORDER[number])
  if (tierIndex < 0) {
    return { progressPercent: 0, nextTier: TIER_ORDER[1] ?? null, mmrInTier: mmr, mmrNeededForNext: 1000 }
  }
  if (tierIndex === TIER_ORDER.length - 1) {
    return { progressPercent: 100, nextTier: null, mmrInTier: Math.max(0, mmr - MMR_THRESHOLDS[currentTier]), mmrNeededForNext: 0 }
  }
  const currentMin = MMR_THRESHOLDS[currentTier] ?? 0
  const nextTier = TIER_ORDER[tierIndex + 1]
  const nextMin = MMR_THRESHOLDS[nextTier] ?? 5000
  const range = nextMin - currentMin
  const mmrInTier = Math.max(0, mmr - currentMin)
  const progressPercent = range > 0 ? Math.min(100, Math.round((mmrInTier / range) * 100)) : 100
  return { progressPercent, nextTier: nextTier ?? null, mmrInTier, mmrNeededForNext: nextMin - currentMin }
}

function mapTierToRankBadge(profileTier?: string): "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger" {
  const tierMap: Record<string, "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"> = {
    Barista: "Iron",
    Intern: "Bronze",
    "Junior Dev": "Silver",
    "Senior Dev": "Gold",
    "Managing Director": "Challenger",
    CEO: "Challenger",
  }
  if (!profileTier) return "Iron"
  if (["Iron", "Bronze", "Silver", "Gold", "Challenger"].includes(profileTier)) {
    return profileTier as "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"
  }
  return tierMap[profileTier] || "Iron"
}
// interface RecentMatch {
//   jobId: string
//   job: string
//   company: string
//   score: number
//   rank: number
// }

export function Profile() {
  const { user: authUser, setUser } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploaded, setUploaded] = useState(false)
  const [avgMatchScore, setAvgMatchScore] = useState<number | null>(null)

  useEffect(() => {
    if (!authUser?.user_id) {
      setAvgMatchScore(null)
      return
    }
    fetch(`/api/users/${authUser.user_id}/profile-stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { avg_match_score?: number | null } | null) => {
        setAvgMatchScore(data?.avg_match_score ?? null)
      })
      .catch(() => setAvgMatchScore(null))
  }, [authUser?.user_id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploaded(false)
    }
  }

  const handleUpload = async () => {
    if (selectedFile && authUser) {
      const formData = new FormData()
      formData.append("user_id", authUser.user_id)
      formData.append("file", selectedFile)

      try {
        const res = await fetch("/api/user/resume", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")

        await res.json()
        setUploaded(true)

        // Update user context to reflect resume exists
        if (authUser) {
          setUser({ ...authUser, has_resume: true })
        }
      } catch (err) {
        console.error("Upload error:", err)
        // TODO: Show error toast
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          {/* TODO: Fetch user profile data from backend (GET /api/profile) */}
          <Card className="border-purple-200 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <RankBadge tier={mapTierToRankBadge(authUser?.current_tier)} size="lg" />
                  <div>
                    <CardTitle className="text-3xl text-black">
                      {authUser ? authUser.username : "Your Profile"}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {authUser?.current_tier ?? "Tier"}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Avg Match Score</p>
                  <p className="text-3xl font-bold text-primary">
                    {avgMatchScore != null ? avgMatchScore.toFixed(1) : "--"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">MMR Score</p>
                  <p className="text-4xl font-bold text-primary">{authUser?.mmr_score ?? "--"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                  <p className="text-4xl font-bold text-purple-600">{authUser?.current_tier ?? "--"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Streak</p>
                  <p className="text-4xl font-bold text-black flex items-center gap-1">
                    {authUser?.streak_count != null ? (
                      authUser.streak_count > 0 ? (
                        <>
                          {authUser.streak_count}
                          <span className="text-2xl" title="Applications with 80+ match in a row">🔥</span>
                        </>
                      ) : (
                        "0"
                      )
                    ) : (
                      "--"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resume on file</p>
                  <p className="text-4xl font-bold text-black">{authUser?.has_resume ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress to Next Tier – driven by MMR and backend tier thresholds */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progress to Next Tier
                </CardTitle>
                <CardDescription>
                  {authUser?.current_tier && authUser?.mmr_score !== undefined
                    ? (() => {
                        const { nextTier } = getTierProgress(authUser.mmr_score, authUser.current_tier)
                        if (!nextTier) return "You’re at max tier"
                        const mmrReq = MMR_THRESHOLDS[nextTier] ?? "—"
                        const matchReq = MIN_MATCH_SCORE_FOR_NEXT_TIER[nextTier] ?? "—"
                        return `Rank up to ${nextTier}: ${mmrReq} MMR and ${matchReq}+ avg match score`
                      })()
                    : "Based on your MMR and avg match score"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{authUser?.current_tier ?? "Current Tier"}</span>
                    <span className="text-gray-600">
                      {authUser?.current_tier && authUser?.mmr_score !== undefined
                        ? getTierProgress(authUser.mmr_score, authUser.current_tier).nextTier ?? "Max"
                        : "Next Tier"}
                    </span>
                  </div>
                  <Progress
                    value={
                      authUser?.current_tier && authUser?.mmr_score !== undefined
                        ? getTierProgress(authUser.mmr_score, authUser.current_tier).progressPercent
                        : 0
                    }
                    className="h-3"
                  />
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {authUser?.current_tier && authUser?.mmr_score !== undefined
                      ? (() => {
                          const { progressPercent, nextTier, mmrInTier, mmrNeededForNext } = getTierProgress(
                            authUser.mmr_score,
                            authUser.current_tier
                          )
                          if (!nextTier) return "100% — Max tier"
                          const matchReq = MIN_MATCH_SCORE_FOR_NEXT_TIER[nextTier]
                          const avgMet = avgMatchScore != null && avgMatchScore >= matchReq
                          const matchText =
                            avgMatchScore != null
                              ? `Avg match: ${avgMatchScore.toFixed(1)} (need ${matchReq}+) ${avgMet ? "✓" : ""}`
                              : `Avg match: -- (need ${matchReq}+)`
                          return `${progressPercent}% to next tier · ${mmrInTier} / ${mmrNeededForNext} MMR · ${matchText}`
                        })()
                      : "--% to next tier"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resume Upload – show for applicants and when not logged in (recruiters don't need it) */}
            {authUser?.role !== "recruiter" && (
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UploadIcon className="h-5 w-5 text-primary" />
                    Your Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your PDF resume here. Use Quick Apply on job listings to share it instantly.
                    {!authUser && " Log in as an applicant to save it for Quick Apply."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="profile-resume-upload"
                    />
                    <label htmlFor="profile-resume-upload" className="cursor-pointer">
                      {selectedFile ? (
                        <div className="space-y-2">
                          <FileText className="h-12 w-12 text-primary mx-auto" />
                          <p className="text-sm font-medium text-black">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : authUser?.has_resume ? (
                        <div className="space-y-2">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                          <p className="text-sm font-medium text-black">Resume on file</p>
                          <p className="text-xs text-gray-500">Upload a new file to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <UploadIcon className="h-12 w-12 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">PDF only, max 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploaded}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    {uploaded || authUser?.has_resume ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        {uploaded ? "Resume saved for Quick Apply" : "Resume on file"}
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Upload Resume
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Matches */}
          </div>
        </div>
      </div>
    </div>
  )
}
