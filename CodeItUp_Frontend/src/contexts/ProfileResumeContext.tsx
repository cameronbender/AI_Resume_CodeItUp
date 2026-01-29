import { createContext, useContext, useState, ReactNode } from "react"

interface ProfileResumeContextType {
  /** Last resume file uploaded on profile (in-memory for quick apply). */
  profileResume: File | null
  setProfileResume: (file: File | null) => void
  hasResume: boolean
}

const ProfileResumeContext = createContext<ProfileResumeContextType | null>(null)

export function ProfileResumeProvider({ children }: { children: ReactNode }) {
  const [profileResume, setProfileResume] = useState<File | null>(null)

  return (
    <ProfileResumeContext.Provider
      value={{
        profileResume,
        setProfileResume,
        hasResume: !!profileResume,
      }}
    >
      {children}
    </ProfileResumeContext.Provider>
  )
}

export function useProfileResume() {
  const ctx = useContext(ProfileResumeContext)
  if (!ctx) throw new Error("useProfileResume must be used within ProfileResumeProvider")
  return ctx
}
