import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload as UploadIcon, FileText, CheckCircle2 } from "lucide-react"

export function Upload() {
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
      // Simulate upload
      setTimeout(() => {
        setUploaded(true)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Upload Your Resume</h1>
            <p className="text-gray-600">
              Upload your PDF resume to get matched with job opportunities and see your ranking
            </p>
          </div>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle>Resume Upload</CardTitle>
              <CardDescription>
                Select a job listing and upload your resume in PDF format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (PDF)
                </label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-12 w-12 text-primary mx-auto" />
                        <p className="text-sm font-medium text-black">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadIcon className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF only, max 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploaded}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {uploaded ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Resume Uploaded!
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
                    Check your profile to see your match scores and rankings.
                  </p>
                </div>
              )}

              {/* Info Section */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2">How it works:</h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Our AI analyzes the job description requirements</li>
                  <li>Your resume is compared against the job criteria</li>
                  <li>You receive a match score and ranking</li>
                  <li>Climb the ladder by consistently ranking high</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

