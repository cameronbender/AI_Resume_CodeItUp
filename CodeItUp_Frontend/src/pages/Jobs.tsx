import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search} from "lucide-react"

// TODO: Define Job interface based on backend API response
// interface Job {
//   id: string
//   title: string
//   company: string
//   location: string
//   salary: string
//   description: string
//   applicants: number
//   matchScore?: number
// }

export function Jobs() {
  // TODO: Add state management and API call to fetch jobs from backend
  // TODO: Implement search functionality that queries backend API

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Job Listings</h1>
          <p className="text-gray-600">Find your next opportunity and see how you rank</p>
        </div>

        {/* Search Bar */}
        {/* TODO: Connect search input to backend API */}
        {/* TODO: Implement debounced search or search on submit */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              // TODO: Add value={searchTerm} and onChange handler
              className="pl-10"
            />
          </div>
        </div>

        {/* Job Listings */}
        {/* TODO: Fetch jobs from backend API (GET /api/jobs) */}
        {/* TODO: Map over jobs array and display job cards */}
        {/* Example structure for each job card: */}
        {/* {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow border-purple-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </div>
                {job.matchScore && (
                  <Badge variant="default" className="bg-primary">
                    {job.matchScore}% Match
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {job.applicants} applicants
                  </div>
                </div>
                <p>{job.description}</p>
                <div className="flex gap-2">
                  <Button>View Details</Button>
                  <Button variant="outline">Upload Resume</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))} */}
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Job listings will appear here when backend is connected</p>
        </div>
      </div>
    </div>
  )
}
