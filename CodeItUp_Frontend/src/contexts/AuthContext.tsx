import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  user_id: string
  username: string
  email: string
  role: "candidate" | "recruiter"
  mmr_score: number
  current_tier: string
  streak_count: number
  has_resume: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = "user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)



  const setUser = (u: User | null) => {
    setUserState(u)
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const logout = () => {
    setUserState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const refreshUser = async () => {
    if (!user?.user_id) return
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "X-User-Id": user.user_id }
      })
      if (res.ok) {
        const freshUser = await res.json()
        setUser(freshUser)
      }
    } catch (err) {
      console.error("Failed to refresh user", err)
    }
  }

  // Initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as User
        setUserState(parsed)

        // Background refresh
        fetch("/api/auth/me", {
          headers: { "X-User-Id": parsed.user_id }
        }).then(res => {
          if (res.ok) return res.json()
          if (res.status === 401) throw new Error("Unauthorized")
        }).then(freshUser => {
          if (freshUser) setUser(freshUser)
        }).catch(() => {
          // Optional: logout if unauthorized?
          // logout() 
        })
      }
    } catch {
      setUserState(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        setUser,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
