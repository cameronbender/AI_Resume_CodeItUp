import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Trophy, Briefcase, Upload, Home, User } from "lucide-react"
import gauntletLogo from "@/assets/gauntlet.png"

export function Header() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={gauntletLogo} alt="Gauntlet.io" className="h-8 w-8" />
            <span className="text-2xl font-bold text-black">Gauntlet.io</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="text-black"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/jobs">
              <Button
                variant={isActive("/jobs") ? "default" : "ghost"}
                className="text-black"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Jobs
              </Button>
            </Link>
            <Link to="/upload">
              <Button
                variant={isActive("/upload") ? "default" : "ghost"}
                className="text-black"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </Link>
            <Link to="/ladder">
              <Button
                variant={isActive("/ladder") ? "default" : "ghost"}
                className="text-black"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Ladder
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                className="text-black"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

