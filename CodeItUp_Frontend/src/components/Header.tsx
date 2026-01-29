import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Trophy, Briefcase, Home, User, Menu, X, LogIn, FolderOpen, LogOut } from "lucide-react"
import gauntletLogo from "@/assets/gauntlet.png"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    navigate("/")
  }

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/jobs", label: "Jobs", icon: Briefcase },
    { path: "/ladder", label: "Ladder", icon: Trophy },
  ]

  if (isAuthenticated && user) {
    navItems.push({ path: "/profile", label: "Profile", icon: User })
    if (user.role === "recruiter") {
      navItems.push({ path: "/my-jobs", label: "My Jobs", icon: FolderOpen })
    }
    navItems.push({ path: "/login", label: "Logout", icon: LogOut, isLogout: true })
  } else {
    navItems.push({ path: "/login", label: "Login", icon: LogIn })
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src={gauntletLogo} alt="Gauntlet.io" className="h-8 w-8 flex-shrink-0" />
            <span className="text-xl md:text-2xl font-bold text-black whitespace-nowrap">Gauntlet.io</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isLogout = "isLogout" in item && item.isLogout
              if (isLogout) {
                return (
                  <Button
                    key="logout"
                    variant="ghost"
                    className="text-black"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.label}</span>
                  </Button>
                )
              }
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="text-black"
                    size="sm"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="xl:hidden">{item.label.split(' ')[0]}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isLogout = "isLogout" in item && item.isLogout
                if (isLogout) {
                  return (
                    <Button
                      key="logout"
                      variant="ghost"
                      className="w-full justify-start text-black"
                      onClick={handleLogout}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  )
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start text-black"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

