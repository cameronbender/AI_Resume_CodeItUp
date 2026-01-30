import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { parseJobDescription } from "./JobDescription"
import { MapPin, Briefcase, ChevronRight } from "lucide-react"

interface JobCardProps {
  jobId: string
  title: string
  company?: string
  location?: string
  description: string // txt file content
  applicants?: number
  matchScore?: number
  onClick: () => void
}

export function JobCard({
  title,
  company,
  location,
  applicants,
  matchScore,
  onClick
}: JobCardProps) {
  // const parsed = parseJobDescription(description)

  return (
    <Card
      className="border-purple-200 hover:shadow-lg transition-all cursor-pointer hover:border-primary"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-black truncate">{title}</h3>
                {company && (
                  <p className="text-sm text-gray-600 truncate">{company}</p>
                )}
              </div>
              {matchScore && (
                <Badge variant="default" className="bg-primary flex-shrink-0">
                  {matchScore}% Match
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {/* Client-side parsed fields removed to rely on DB data */}
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {applicants !== undefined && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{applicants} applicants</span>
                </div>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  )
}

