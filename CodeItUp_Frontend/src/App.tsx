import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Header } from "@/components/Header"
import { Home } from "@/pages/Home"
import { Jobs } from "@/pages/Jobs"
import { Upload } from "@/pages/Upload"
import { Ladder } from "@/pages/Ladder"
import { Profile } from "@/pages/Profile"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/ladder" element={<Ladder />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
