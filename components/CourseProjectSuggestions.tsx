"use client"

import { useState, useEffect } from "react"
import {
  Lightbulb,
  Code,
  ArrowRight,
  Star,
  Target,
  Rocket,
  Brain,
  Layers,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Course {
  id: number | string
  title: string
  progress: number
  skills: string[]
}

interface ProjectSuggestion {
  id: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedTime: string
  skills: string[]
  matchScore: number
  field: string
  reason?: string
}

// Course fields mapping for categorization
const FIELD_KEYWORDS: Record<string, string[]> = {
  "Web Development": ["react", "html", "css", "javascript", "web", "frontend", "backend", "node", "next.js"],
  "Data Science": ["python", "data", "pandas", "numpy", "analysis", "visualization", "statistics"],
  "Machine Learning": ["machine learning", "ai", "neural", "tensor", "scikit", "deep learning", "nlp"],
  "Mobile Development": ["mobile", "ios", "android", "flutter", "react native"],
  "DevOps": ["docker", "kubernetes", "aws", "cloud", "ci/cd", "linux"]
}

const PROJECT_TEMPLATES = [
  // Web Development
  {
    title: "Personal Portfolio Website",
    description: "Build a responsive portfolio to showcase your skills and projects. Focus on semantic HTML, CSS styling, and basic interactivity.",
    difficulty: "Beginner",
    estimatedTime: "5-10 hours",
    skills: ["HTML", "CSS", "JavaScript", "React", "Web Design"],
    field: "Web Development"
  },
  {
    title: "Task Management App",
    description: "Create a CRUD application to manage daily tasks. Implement features like adding, editing, deleting, and filtering tasks.",
    difficulty: "Intermediate",
    estimatedTime: "15-20 hours",
    skills: ["React", "State Management", "Local Storage", "JavaScript"],
    field: "Web Development"
  },
  {
    title: "E-commerce Dashboard",
    description: "Develop a comprehensive dashboard with data visualization, user authentication, and product management features.",
    difficulty: "Advanced",
    estimatedTime: "30-40 hours",
    skills: ["React", "Next.js", "API Integration", "Charts", "Authentication"],
    field: "Web Development"
  },

  // Data Science / ML (Combined for broader matching)
  {
    title: "Weather Data Analyzer",
    description: "Fetch weather data from an API, store it, and perform basic statistical analysis to find trends.",
    difficulty: "Beginner",
    estimatedTime: "5-8 hours",
    skills: ["Python", "API", "Data Analysis", "Basic Scripting"],
    field: "Data Science"
  },
  {
    title: "Predictive House Pricing Model",
    description: "Build a machine learning model to predict house prices based on various features using a dataset.",
    difficulty: "Intermediate",
    estimatedTime: "20-25 hours",
    skills: ["Python", "Machine Learning", "Scikit-learn", "Pandas"],
    field: "Machine Learning"
  },
  {
    title: "Real-time Sentiment Analysis API",
    description: "Create a REST API that accepts text and returns sentiment analysis results using a trained NLP model.",
    difficulty: "Advanced",
    estimatedTime: "30-40 hours",
    skills: ["Python", "FastAPI", "NLP", "Deep Learning", "API deployment"],
    field: "Machine Learning"
  },
  // General / Beginner friendly
  {
    title: "Course Kickoff Project",
    description: "Create a simple 'Hello World' application or a basic outline of what you plan to build during this course.",
    difficulty: "Beginner",
    estimatedTime: "1-2 hours",
    skills: ["General", "Planning", "Basics"],
    field: "General"
  }
]

export function CourseProjectSuggestions({ courses }: { courses: Course[] }) {
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([])
  const [userExpertise, setUserExpertise] = useState<Record<string, { level: string, score: number }>>({})

  useEffect(() => {
    if (!courses || courses.length === 0) return

    // 1. Calculate User Expertise per Field
    const fieldStats: Record<string, { totalProgress: number, courseCount: number }> = {}

    courses.forEach(course => {
      // Determine field for this course
      let matchedField = "General"
      const courseText = (course.title + " " + course.skills.join(" ")).toLowerCase()

      for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
        if (keywords.some(k => courseText.includes(k))) {
          matchedField = field
          break // Assign to first matching field for now
        }
      }

      if (!fieldStats[matchedField]) (fieldStats[matchedField] = { totalProgress: 0, courseCount: 0 })
      fieldStats[matchedField].totalProgress += course.progress
      fieldStats[matchedField].courseCount += 1
    })

    const expertise: Record<string, { level: string, score: number }> = {}

    // Calculate expertise level
    Object.entries(fieldStats).forEach(([field, stats]) => {
      const avgProgress = stats.totalProgress / stats.courseCount
      // Weighted score: 70% avg progress, 30% quantity of courses (capped at 3 courses = 100%)
      const quantityScore = Math.min(stats.courseCount * 33, 100)
      const expertiseScore = (avgProgress * 0.7) + (quantityScore * 0.3)

      let level = "Beginner"
      if (expertiseScore > 75) level = "Advanced"
      else if (expertiseScore > 35) level = "Intermediate"

      expertise[field] = { level, score: expertiseScore }
    })

    setUserExpertise(expertise)
    // console.log("User Expertise:", expertise)

    // 2. Generate Suggestions based on Expertise
    const generatedSuggestions: ProjectSuggestion[] = []

    PROJECT_TEMPLATES.forEach((template, index) => {
      // If template is General, always consider it if we have no other strong matches
      if (template.field === "General") {
        generatedSuggestions.push({ ...template, id: `gen-${index}`, field: "General", matchScore: 10, reason: "Great for getting started" } as ProjectSuggestion)
        return
      }

      const userFieldExpertise = expertise[template.field]

      // Also check if Data Science expertise applies to ML projects (related fields)
      const relatedExpertise = template.field === "Machine Learning" ? expertise["Data Science"] :
        template.field === "Data Science" ? expertise["Machine Learning"] : null

      const effectiveExpertise = userFieldExpertise || relatedExpertise

      if (effectiveExpertise) {
        let score = 0

        // Match Difficulty with Expertise Level
        if (template.difficulty === effectiveExpertise.level) {
          score = 100
        } else if (
          (effectiveExpertise.level === "Advanced" && template.difficulty === "Intermediate") ||
          (effectiveExpertise.level === "Intermediate" && template.difficulty === "Beginner")
        ) {
          score = 80 // Provide some easier projects too
        } else if (
          (effectiveExpertise.level === "Beginner" && template.difficulty === "Intermediate")
        ) {
          score = 60 // Stretch goal
        } else {
          score = 20
        }

        if (score > 40) {
          generatedSuggestions.push({
            ...template,
            id: `${template.field}-${index}`,
            matchScore: score,
            field: template.field,
            reason: `Matches your ${effectiveExpertise.level} level in ${template.field}`
          } as ProjectSuggestion)
        }
      }
    })

    // Sort by match score and limit
    const sorted = generatedSuggestions
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3) // Top 3

    setSuggestions(sorted)
  }, [courses])

  if (!courses || courses.length === 0) return null

  // If no specific suggestions found, show default generic ones or a message
  const finalSuggestions = suggestions.length > 0 ? suggestions : PROJECT_TEMPLATES.filter(p => p.field === "General").map((p, i) => ({ ...p, id: `def-${i}`, matchScore: 100, field: "General" } as ProjectSuggestion))

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Recommended Projects</h2>
        </div>
        {/* Optional: Show top expertise badge */}
        {Object.entries(userExpertise).length > 0 && (
          <div className="flex gap-2">
            {Object.entries(userExpertise)
              .sort(([, a], [, b]) => b.score - a.score)
              .slice(0, 1) // Top 1 field
              .map(([field, { level }]) => (
                <Badge key={field} variant="secondary" className="hidden sm:flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20">
                  <Zap className="w-3 h-3" />
                  {level} {field}
                </Badge>
              ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {finalSuggestions.map((project, index) => (
          <div
            key={project.id}
            className="group glass-panel rounded-xl p-5 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full relative overflow-hidden"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Match Reason Banner */}
            {project.matchScore > 80 && project.field !== "General" && (
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-bl-lg font-medium">
                Best Match
              </div>
            )}

            <div className="flex justify-between items-start mb-4 mt-2">
              <div className={`p-2 rounded-lg ${project.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                project.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-purple-500/10 text-purple-500'
                }`}>
                <Layers className="w-5 h-5" />
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {project.difficulty}
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-4 flex-grow">
              {project.description}
            </p>

            <div className="space-y-4 mt-auto">
              {project.reason && (
                <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 p-2 rounded-lg">
                  <Target className="w-3 h-3" />
                  <span>{project.reason}</span>
                </div>
              )}

              {!project.reason && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Brain className="w-3 h-3" />
                  <span>Field: {project.field}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {project.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>

              <Button className="w-full gap-2 group-hover:translate-x-1 transition-transform" variant="secondary">
                View Project Brief <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}
