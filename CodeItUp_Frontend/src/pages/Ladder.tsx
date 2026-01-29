import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trophy, ChevronLeft, ChevronRight } from "lucide-react"

interface UserRanking {
  username: string
  current_tier: string
  mmr_score: number
  streak_count: number
  global_rank: number
}

interface LeaderboardResponse {
  data: UserRanking[];
  total: number;
  page: number;
  limit: number;
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
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    // Construct query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (debouncedSearch) {
      params.append("search", debouncedSearch);
    }

    fetch(`/api/leaderboard?${params}`)
      .then(res => {
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
      })
      .then((data: LeaderboardResponse) => {
        setRankings(data.data);
        setTotalCount(data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [page, limit, debouncedSearch]);

  const totalPages = Math.ceil(totalCount / limit);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Global Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See who's leading the pack. Top 500 candidates ranked by MMR and activity.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-6 text-lg shadow-sm border-gray-200 focus:ring-2 focus:ring-purple-500 rounded-xl"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
            <strong>Error loading rankings:</strong> {error}
          </div>
        )}

        {/* Rankings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {rankings.map((user) => (
                <Card key={user.username} className="p-4 sm:p-6 hover:shadow-md transition-all duration-200 border-gray-200 hover:border-purple-200 group bg-white rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`
                        flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-lg sm:text-xl shadow-sm
                        ${user.global_rank <= 3 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' : 'bg-gray-100 text-gray-600'}
                      `}>
                        #{user.global_rank}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 group-hover:text-purple-700 transition-colors">
                          {user.username}
                        </h3>
                        <div className="mt-1">
                          <Badge className={`${tierColors[user.current_tier] || 'bg-gray-500'} hover:opacity-90 transition-opacity`}>
                            {user.current_tier}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">MMR</div>
                        <div className="font-mono font-bold text-lg sm:text-xl">{user.mmr_score}</div>
                      </div>
                      <div className="text-right w-16 sm:w-20">
                        <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Streak</div>
                        <div className="font-bold text-lg">
                          {user.streak_count > 0 ? (
                            <span className="text-orange-500 flex items-center justify-end gap-1">
                              {user.streak_count} <span className="text-xl">🔥</span>
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {!error && rankings.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No candidates found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search terms</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!error && rankings.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="rounded-full px-6"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <div className="text-sm font-medium text-gray-500 tabular-nums">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="rounded-full px-6"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
