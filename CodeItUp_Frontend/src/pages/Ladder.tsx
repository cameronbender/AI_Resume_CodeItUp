import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UserRanking {
  global_rank: number;
  username: string;
  current_tier: string;
  mmr_score: number;
  streak_count: number;
}

const tierColors: Record<string, string> = {
  CEO: "bg-purple-600",
  "Managing Director": "bg-blue-500",
  "Senior Dev": "bg-teal-500",
  "Junior Dev": "bg-yellow-500",
  Intern: "bg-gray-400",
  Barista: "bg-amber-600",
}

export function Ladder() {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setRankings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLoading(false);
      });
  }, []);

  // Top 3 for visual enhancement
  const topThree = rankings.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Competitive Ladder</h1>
          <p className="text-gray-600">
            See where you rank among other candidates. Climb the ladder to reach the top!
          </p>
        </div>

        {/* Top 3 Podium (Simplified List for now) */}
        {rankings.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {topThree.map((user) => (
              <Card key={user.username} className="border-purple-200 text-center py-4 bg-gray-50">
                <h3 className="text-2xl font-bold">#{user.global_rank}</h3>
                <div className="font-semibold text-lg">{user.username}</div>
                <Badge className={`${tierColors[user.current_tier] || 'bg-gray-500'} mt-2`}>
                  {user.current_tier}
                </Badge>
                <div className="text-sm text-gray-500 mt-1">MMR: {user.mmr_score}</div>
              </Card>
            ))}
          </div>
        )}

        {/* Full Rankings Table */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle>Full Rankings</CardTitle>
            <CardDescription>Complete leaderboard of all candidates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-12">Loading rankings...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Rank</th>
                      <th className="text-left py-2 font-medium">Candidate</th>
                      <th className="text-left py-2 font-medium">Tier</th>
                      <th className="text-right py-2 font-medium">MMR</th>
                      <th className="text-right py-2 font-medium">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((user) => (
                      <tr key={user.username} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-bold">#{user.global_rank}</td>
                        <td className="py-3">{user.username}</td>
                        <td className="py-3">
                          <Badge className={`${tierColors[user.current_tier] || 'bg-gray-500'}`}>
                            {user.current_tier}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">{user.mmr_score}</td>
                        <td className="py-3 text-right">
                          {user.streak_count > 0 && (
                            <span className="text-orange-500 font-bold">🔥 {user.streak_count}</span>
                          )}
                          {user.streak_count === 0 && <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
