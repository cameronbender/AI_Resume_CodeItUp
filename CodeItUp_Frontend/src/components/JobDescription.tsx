import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Briefcase, TrendingUp } from "lucide-react"

interface ParsedJobDescription {
  title: string
  roleDescription: string
  qualifications: string[]
  salaryRange?: string
  track?: string
  careerLevel?: string
}

/**
 * Parses a job description text file into structured data
 * Format expected:
 * - Title
 * - Separator line (===)
 * - Role Description: (paragraph)
 * - Qualifications: (bullet points with -)
 * - Salary Range: (value)
 * - Track: (value)
 * - Career Level: (value)
 */
export function parseJobDescription(text: string): ParsedJobDescription {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  const result: ParsedJobDescription = {
    title: '',
    roleDescription: '',
    qualifications: [],
  }

  let currentSection = ''
  let i = 0

  // Get title (first line)
  if (lines.length > 0) {
    result.title = lines[0]
    i = 1
  }

  // Skip separator line if present
  if (i < lines.length && lines[i].match(/^=+$/)) {
    i++
  }

  // Parse sections
  for (; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.startsWith('Role Description:')) {
      currentSection = 'roleDescription'
      result.roleDescription = line.replace('Role Description:', '').trim()
    } else if (line.startsWith('Qualifications:')) {
      currentSection = 'qualifications'
    } else if (line.startsWith('Salary Range')) {
      const match = line.match(/Salary Range[^:]*:\s*(.+)/)
      if (match) {
        result.salaryRange = match[1].trim()
      }
      currentSection = ''
    } else if (line.startsWith('Track:')) {
      result.track = line.replace('Track:', '').trim()
      currentSection = ''
    } else if (line.startsWith('Career Level:')) {
      result.careerLevel = line.replace('Career Level:', '').trim()
      currentSection = ''
    } else if (currentSection === 'roleDescription' && line) {
      result.roleDescription += (result.roleDescription ? ' ' : '') + line
    } else if (currentSection === 'qualifications' && line.startsWith('-')) {
      result.qualifications.push(line.replace(/^-\s*/, '').trim())
    }
  }

  return result
}

interface JobDescriptionProps {
  descriptionText: string
  className?: string
}

export function JobDescription({ descriptionText, className }: JobDescriptionProps) {
  const parsed = parseJobDescription(descriptionText)
  const hasStructuredContent =
    parsed.roleDescription ||
    parsed.qualifications.length > 0 ||
    parsed.salaryRange ||
    parsed.track ||
    parsed.careerLevel
  const useFallback = !hasStructuredContent && descriptionText.trim().length > 0

  return (
    <Card className={`border-purple-200 ${className || ''}`}>
      {useFallback ? (
        <>
          <CardHeader>
            <CardTitle className="text-lg text-black">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{descriptionText.trim()}</p>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-2xl text-black">{parsed.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {parsed.track && (
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {parsed.track}
                </Badge>
              )}
              {parsed.careerLevel && (
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {parsed.careerLevel}
                </Badge>
              )}
              {parsed.salaryRange && (
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {parsed.salaryRange}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {parsed.roleDescription && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">Role Description</h3>
                <p className="text-gray-700 leading-relaxed">{parsed.roleDescription}</p>
              </div>
            )}

            {parsed.qualifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Qualifications</h3>
                <ul className="space-y-2">
                  {parsed.qualifications.map((qual, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-primary mt-1.5">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  )
}

