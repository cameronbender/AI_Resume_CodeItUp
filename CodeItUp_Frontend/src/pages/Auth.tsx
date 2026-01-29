import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, Briefcase, User } from "lucide-react"

export function Auth() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Basic Validation
    if (isLogin) {
      if (!emailOrUsername || !password) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }
    } else {
      if (!email || !password) {
        setError("Please fill in all required fields")
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
      if (!username) {
        setError("Username is required")
        setLoading(false)
        return
      }
    }

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup"
    const body = isLogin
      ? { email_or_username: emailOrUsername, password }
      : { email, password, username, role }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed")
      }

      setUser(data)

      // Redirect: recruiter -> My Jobs, applicant -> Jobs
      navigate(data.role === "recruiter" ? "/my-jobs" : "/jobs")

    } catch (err: any) {
      console.error("Auth error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-black">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to continue your journey"
              : "Join the competition and start climbing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Toggle between Login and Signup */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 ${isLogin ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => { setIsLogin(true); setError(null); }}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button
              variant={!isLogin ? "default" : "ghost"}
              className={`flex-1 ${!isLogin ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => { setIsLogin(false); setError(null); }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </Button>
          </div>

          {!isLogin && (
            <div className="flex gap-4 mb-6">
              <div
                className={`flex-1 cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'candidate' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setRole("candidate")}
              >
                <User className={`h-6 w-6 ${role === 'candidate' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">Candidate</span>
              </div>
              <div
                className={`flex-1 cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${role === 'recruiter' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setRole("recruiter")}
              >
                <Briefcase className={`h-6 w-6 ${role === 'recruiter' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">Recruiter</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or username</label>
                <Input
                  type="text"
                  placeholder="you@example.com or johndoe"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <Input
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${role === 'recruiter' && !isLogin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-gray-800'}`}
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

