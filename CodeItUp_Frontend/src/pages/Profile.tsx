import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RankBadge } from "@/components/RankBadge"
// TODO: Import Badge, Trophy when implementing backend data display
// import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp } from "lucide-react"
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

/**
 * Maps profile tier names to RankBadge tier names
 * TODO: Backend should return tier in RankBadge format, or use this mapping
 * TODO: Use this function when displaying rank badge: mapTierToRankBadge(profile.currentTier)
 */
// function mapTierToRankBadge(profileTier: string): "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger" {
//   const tierMap: Record<string, "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"> = {
//     "Copper": "Iron",
//     "Barista/McDonalds": "Iron",
//     "Intern": "Bronze",
//     "Silver": "Silver",
//     "Junior Dev": "Silver",
//     "Gold": "Gold",
//     "Senior Dev": "Gold",
//     "Plat": "Gold",
//     "Platinum": "Gold",
//     "Diamond": "Challenger",
//     "WFH Managing Director": "Challenger",
//     "Champ": "Challenger",
//     "CEO": "Challenger",
//   }
//   
//   // If backend returns RankBadge format directly, use it
//   if (["Iron", "Bronze", "Silver", "Gold", "Challenger"].includes(profileTier)) {
//     return profileTier as "Iron" | "Bronze" | "Silver" | "Gold" | "Challenger"
//   }
//   
//   // Otherwise map from profile tier name
//   return tierMap[profileTier] || "Iron"
// }
// interface RecentMatch {
//   jobId: string
//   job: string
//   company: string
//   score: number
//   rank: number
// }

export function Profile() {
  // TODO: Add state management and API call to fetch user profile from backend
  // TODO: Get current user ID from auth context/session

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
                  {/* TODO: Display tier badge from profile.currentTier */}
                  {/* TODO: Use RankBadge component: <RankBadge tier={mapTierToRankBadge(profile.currentTier)} size="lg" /> */}
                  <RankBadge tier="Iron" size="lg" />
                  <div>
                    <CardTitle className="text-3xl text-black">Your Profile</CardTitle>
                    {/* TODO: Display profile.currentTierName */}
                    <CardDescription className="text-lg">Tier Name</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Overall Rank</p>
                  {/* TODO: Display profile.overallRank */}
                  <p className="text-3xl font-bold text-primary">#--</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Match Score</p>
                  {/* TODO: Display profile.matchScore */}
                  <p className="text-4xl font-bold text-primary">--%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Application Streak</p>
                  {/* TODO: Display profile.streak */}
                  <p className="text-4xl font-bold text-purple-600">--</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  {/* TODO: Display profile.totalApplications */}
                  <p className="text-4xl font-bold text-black">--</p>
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

            {/* Recent Matches */}
            {/* TODO: Fetch recent matches from backend (GET /api/profile/recent-matches) */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Recent Matches
                </CardTitle>
                <CardDescription>Your latest job application results</CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Map over recentMatches array from backend */}
                <div className="text-center py-8">
                  <p className="text-gray-500">Recent matches will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
