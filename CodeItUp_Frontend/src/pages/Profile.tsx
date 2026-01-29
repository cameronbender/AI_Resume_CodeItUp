import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RankBadge } from "@/components/RankBadge"
import { useAuth } from "@/contexts/AuthContext"
import { useProfileResume } from "@/contexts/ProfileResumeContext"
import { Target, TrendingUp, Upload as UploadIcon, FileText, CheckCircle2 } from "lucide-react"
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
  const { user: authUser } = useAuth()
  const { setProfileResume, hasResume } = useProfileResume()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploaded(false)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      setProfileResume(selectedFile)
      setUploaded(true)
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
                  <p className="text-sm text-gray-600">MMR</p>
                  <p className="text-3xl font-bold text-primary">
                    {authUser?.mmr_score ?? "--"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">MMR Score</p>
                  <p className="text-4xl font-bold text-primary">{authUser?.mmr_score ?? "--"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Tier</p>
                  <p className="text-4xl font-bold text-purple-600">{authUser?.current_tier ?? "--"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resume on file</p>
                  <p className="text-4xl font-bold text-black">{hasResume ? "Yes" : "No"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Progress to Next Tier */}
            {/* TODO: Fetch tier progress from backend */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Progress to Next Tier
                </CardTitle>
                {/* TODO: Display profile.nextTierName */}
                <CardDescription>Next Tier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    {/* TODO: Display current and next tier names */}
                    <span className="text-gray-600">Current Tier</span>
                    <span className="text-gray-600">Next Tier</span>
                  </div>
                  {/* TODO: Display progress bar with profile.progressToNext */}
                  <Progress value={0} className="h-3" />
                  <p className="text-center text-sm text-gray-600 mt-2">
                    --% to next tier
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
                      ) : hasResume ? (
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
                    {uploaded || hasResume ? (
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
