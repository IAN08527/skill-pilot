import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch from enrollments joined with courses
        const { data: enrollmentEntries, error } = await supabase
            .from("enrollments")
            .select(`
                *,
                course:courses (*)
            `)
            .eq("user_id", user.id)

        if (error) {
            console.error("Supabase error fetching enrollments:", error.message)
            return NextResponse.json({
                courses: getMockEnrolledCourses(),
                source: "mock"
            })
        }

        // Transform joined data to match expectation
        const courses = enrollmentEntries.map(e => ({
            ...e.course,
            enrollmentId: e.id,
            progress: e.progress,
            completed: e.completed_lessons,
            lessons: e.total_lessons,
            lastAccessed: e.last_accessed_at,
            skills: e.course.skills || []
        }))

        return NextResponse.json({ courses })
    } catch (error) {
        console.error("Error in user courses API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function getMockEnrolledCourses() {
    return [
        {
            id: 1,
            title: "Machine Learning Basics",
            progress: 75,
            lessons: 24,
            completed: 18,
            instructor: "Dr. Sarah Chen",
            duration: "8 hours",
            description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks. This course covers practical implementations using Python and popular ML libraries.",
            lastAccessed: "2 hours ago",
            nextLesson: "Building Your First Neural Network",
            skills: ["Python", "TensorFlow", "Data Analysis", "Neural Networks"],
            certificate: true
        },
        {
            id: 2,
            title: "React & Next.js",
            progress: 45,
            lessons: 32,
            completed: 14,
            instructor: "John Developer",
            duration: "12 hours",
            description: "Master modern React development with Next.js. Learn server components, app router, data fetching patterns, and deployment strategies for production applications.",
            lastAccessed: "1 day ago",
            nextLesson: "API Routes and Server Actions",
            skills: ["React", "Next.js", "TypeScript", "API Development"],
            certificate: true
        },
        {
            id: 3,
            title: "Python for Data Science",
            progress: 20,
            lessons: 28,
            completed: 6,
            instructor: "Mike Analytics",
            duration: "10 hours",
            description: "Learn Python programming with a focus on data science applications. Cover pandas, numpy, matplotlib, and statistical analysis techniques.",
            lastAccessed: "3 days ago",
            nextLesson: "Working with Dictionaries",
            skills: ["Python", "Pandas", "NumPy", "Data Visualization"],
            certificate: true
        },
    ]
}
