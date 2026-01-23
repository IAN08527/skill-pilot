
interface Course {
    id: number | string
    title: string
    progress: number
    skills: string[]
}

export interface ProjectSuggestion {
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

// 1. Define the Corpus: All potential projects
const PROJECT_TEMPLATES: Omit<ProjectSuggestion, "id" | "matchScore" | "reason">[] = [
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

    // Data Science
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

    // General
    {
        title: "Course Kickoff Project",
        description: "Create a simple 'Hello World' application or a basic outline of what you plan to build during this course.",
        difficulty: "Beginner",
        estimatedTime: "1-2 hours",
        skills: ["General", "Planning", "Basics"],
        field: "General"
    }
]

// --- Vector Space Model Logic ---

type Vector = Record<string, number>

/**
 * Normalizes text to tokens (lowercase, remove punctuation)
 */
function tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(t => t.length > 2)
}

/**
 * Creates a unique vocabulary set from all projects and user courses
 */
function buildVocabulary(courses: Course[], projects: typeof PROJECT_TEMPLATES): Set<string> {
    const vocab = new Set<string>()

    // Add skills from projects
    projects.forEach(p => {
        p.skills.forEach(s => vocab.add(s.toLowerCase()))
    })

    // Add skills/tokens from courses
    courses.forEach(c => {
        c.skills.forEach(s => vocab.add(s.toLowerCase()))
        tokenize(c.title).forEach(t => vocab.add(t))
    })

    return vocab
}

/**
 * Converts a User's Course Profile into a weighted vector
 * Weight = (Progress / 100) * (Skill Relevance)
 */
function userToVector(courses: Course[], vocab: Set<string>): Vector {
    const vector: Vector = {}

    // Initialize vector with 0s
    vocab.forEach(token => vector[token] = 0)

    courses.forEach(course => {
        // Base weight derived from progress (0.1 to 1.0)
        // Even 0 progress gives a small weight (0.1) to indicate interest
        const weight = Math.max(0.1, course.progress / 100)

        // 1. Direct Skill Matches
        course.skills.forEach(skill => {
            const token = skill.toLowerCase()
            if (vocab.has(token)) {
                vector[token] = Math.min(1.0, (vector[token] || 0) + weight)
            }
        })

        // 2. Title Implied Skills
        // e.g. "Intro to Python" -> adds weight to "python" token
        tokenize(course.title).forEach(token => {
            if (vocab.has(token)) {
                // Slightly lower weight for implied tokens
                vector[token] = Math.min(1.0, (vector[token] || 0) + (weight * 0.8))
            }
        })
    })

    // Special case: If vector is empty (no known skills), give weight to "general" or "basics"
    const hasValues = Object.values(vector).some(v => v > 0)
    if (!hasValues) {
        if (vocab.has("general")) vector["general"] = 0.5
        if (vocab.has("basics")) vector["basics"] = 0.5
    }

    return vector
}

/**
 * Converts a Project into a binary/weighted vector
 */
function projectToVector(project: typeof PROJECT_TEMPLATES[0], vocab: Set<string>): Vector {
    const vector: Vector = {}
    vocab.forEach(token => vector[token] = 0)

    project.skills.forEach(skill => {
        const token = skill.toLowerCase()
        if (vocab.has(token)) {
            vector[token] = 1.0 // Required skill = 1.0
        }
    })

    return vector
}

/**
 * Calculates Cosine Similarity between two vectors
 * Cos(A, B) = (A . B) / (||A|| * ||B||)
 */
function cosineSimilarity(vecA: Vector, vecB: Vector): number {
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    const keys = Object.keys(vecA)

    for (const key of keys) {
        const valA = vecA[key]
        const valB = vecB[key]

        dotProduct += valA * valB
        magnitudeA += valA * valA
        magnitudeB += valB * valB
    }

    magnitudeA = Math.sqrt(magnitudeA)
    magnitudeB = Math.sqrt(magnitudeB)

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Main function to get recommendations
 */
export function getRecommendedProjects(courses: Course[]): ProjectSuggestion[] {
    if (!courses || courses.length === 0) {
        // Return General projects if no courses
        return PROJECT_TEMPLATES.filter(p => p.field === "General").map((p, i) => ({
            ...p,
            id: `start-${i}`,
            matchScore: 100,
            reason: "Get started with your first project"
        }))
    }

    const vocab = buildVocabulary(courses, PROJECT_TEMPLATES)
    const userVec = userToVector(courses, vocab)

    const results: ProjectSuggestion[] = PROJECT_TEMPLATES.map((project, index) => {
        const projVec = projectToVector(project, vocab)
        const similarity = cosineSimilarity(userVec, projVec)

        // Difficulty Penalty/Boost Logic can be added here
        // For simplicity, we stick to pure content similarity for now

        return {
            ...project,
            id: `proj-${index}`,
            matchScore: Math.round(similarity * 100),
            reason: similarity > 0.7 ? "Excellent match for your skills" :
                similarity > 0.4 ? "Good alignment with your courses" :
                    "Explore new territory"
        }
    })

    // Sort by Similarity Score
    return results
        .filter(r => r.matchScore > 10 || r.field === "General") // Filter noise
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3)
}
