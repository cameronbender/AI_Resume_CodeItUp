import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, Target } from "lucide-react"
import gauntletLogo from "@/assets/gauntlet.png"
import { RankBadge } from "@/components/RankBadge"

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 relative overflow-hidden">
      {/* Subtle background textures */}
      <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-ladder opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-subtle pointer-events-none" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <img src={gauntletLogo} alt="Gauntlet.io" className="h-24 w-24" />
            </div>
            <h1 className="text-6xl font-bold text-black">
              Gauntlet.io
            </h1>
            <p className="text-2xl text-purple-600 font-semibold">
              If you can't land the job, you can STILL climb the ladder.
            </p>
            
            {/* Rank Badges Showcase */}
            <div className="flex justify-center items-center gap-4 pt-4 pb-2">
              <RankBadge tier="Iron" style="shield" size="sm" />
              <RankBadge tier="Bronze" style="gauntlet" size="sm" />
              <RankBadge tier="Silver" style="shield" size="sm" />
              <RankBadge tier="Gold" style="gauntlet" size="sm" />
              <RankBadge tier="Challenger" style="shield" size="sm" />
            </div>
            
            <div className="flex gap-4 justify-center pt-6">
              <Link to="/jobs">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Browse Jobs
                </Button>
              </Link>
              <Link to="/upload">
                <Button size="lg" variant="outline" className="border-purple-300 text-purple-700">
                  Upload Resume
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-purple-200 relative overflow-hidden">
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-10 w-10 text-primary flex-shrink-0" />
                </div>
                <CardTitle>AI-Powered Matching</CardTitle>
                <CardDescription>
                  Our AI analyzes job descriptions and your resume to calculate your match score
                </CardDescription>
              </CardHeader>
            </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <Trophy className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Competitive Rankings</CardTitle>
              <CardDescription>
                Climb the ladder from Barista to CEO. Rank up based on your performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Streak Bonuses</CardTitle>
              <CardDescription>
                Consistent high rankings earn you application streak bonuses and hot candidate status
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      </div>
    </div>
  )
}

