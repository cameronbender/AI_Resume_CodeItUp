import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProfileResumeProvider } from "@/contexts/ProfileResumeContext"
import { Header } from "@/components/Header"
import { Home } from "@/pages/Home"
import { Jobs } from "@/pages/Jobs"
import { Ladder } from "@/pages/Ladder"
import { Profile } from "@/pages/Profile"
import { Auth } from "@/pages/Auth"
import { MyJobs } from "@/pages/MyJobs"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileResumeProvider>
          <div className="min-h-screen bg-white">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/ladder" element={<Ladder />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-jobs" element={<MyJobs />} />
            </Routes>
          </div>
        </ProfileResumeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
