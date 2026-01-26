import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { JobDescription } from "./JobDescription"
import { Button } from "@/components/ui/button"
import { Upload as UploadIcon } from "lucide-react"
import { useState } from "react"

interface JobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  title: string
  company?: string
  description: string // txt file content
  matchScore?: number
}

export function JobModal({ 
  open, 
  onOpenChange, 
  jobId, // TODO: Use jobId in API call when backend is connected
  title, 
  company, 
  description
}: JobModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploaded(false)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      // TODO: Replace with actual API call to upload resume
      // Example: POST /api/jobs/{jobId}/upload-resume
      // const formData = new FormData()
      // formData.append('resume', selectedFile)
      // formData.append('jobId', jobId)
      // fetch(`/api/jobs/${jobId}/upload-resume`, { method: 'POST', body: formData })
      void jobId // jobId will be used in API call when backend is connected
      
      setTimeout(() => {
        setUploaded(true)
        setTimeout(() => {
          setUploaded(false)
          setSelectedFile(null)
        }, 2000)
      }, 1000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">
            {title}
            {company && <span className="text-lg text-gray-600 font-normal"> - {company}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Job Description */}
          <JobDescription descriptionText={description} />
          
          {/* Resume Upload Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-black mb-4">Upload Your Resume</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-black">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadIcon className="h-10 w-10 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF only, max 10MB</p>
                    </div>
                  )}
                </label>
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploaded}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {uploaded ? (
                  <>
                    ✓ Resume Uploaded!
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-5 w-5 mr-2" />
                    Upload Resume
                  </>
                )}
              </Button>

              {uploaded && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Your resume has been uploaded successfully! Our AI is analyzing it now.
                    Check your profile to see your match score and ranking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

