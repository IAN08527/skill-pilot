import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { id } = params

        // Fetch course details
        const { data: course, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single()

        if (error) {
            console.warn("Supabase error fetching course details, falling back to mock:", error.message)
            return NextResponse.json({
                course: getMockCourse(id),
                source: "mock"
            })
        }

        // Fetch modules and lessons for this course
        const { data: modules, error: modulesError } = await supabase
            .from("modules")
            .select(`
        *,
        lessons (*)
      `)
            .eq("course_id", id)
            .order("order_index", { ascending: true })

        if (modulesError) {
            return NextResponse.json({ course })
        }

        return NextResponse.json({ course: { ...course, modules } })
    } catch (error) {
        console.error("Error in course details API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function getMockCourse(id: string) {
    const courseData: Record<string, any> = {
        "1": {
            id: 1,
            title: "Machine Learning Basics",
            description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks.",
            instructor: "Dr. Sarah Chen",
            totalLessons: 24,
            completedLessons: 18,
            progress: 75,
            modules: [
                {
                    id: 1,
                    title: "Introduction to Machine Learning",
                    lessons: [
                        { id: 1, title: "What is Machine Learning?", duration: "15 min", type: "video", completed: true },
                        { id: 2, title: "Types of Machine Learning", duration: "20 min", type: "video", completed: true },
                        { id: 3, title: "Setting Up Your Environment", duration: "10 min", type: "reading", completed: true },
                        { id: 4, title: "Module 1 Quiz", duration: "15 min", type: "quiz", completed: true },
                    ]
                },
                {
                    id: 2,
                    title: "Supervised Learning",
                    lessons: [
                        { id: 5, title: "Linear Regression", duration: "25 min", type: "video", completed: true },
                        { id: 6, title: "Logistic Regression", duration: "30 min", type: "video", completed: true },
                        { id: 7, title: "Decision Trees", duration: "25 min", type: "video", completed: true },
                        { id: 8, title: "Hands-on Practice", duration: "45 min", type: "reading", completed: true },
                        { id: 9, title: "Module 2 Quiz", duration: "20 min", type: "quiz", completed: true },
                    ]
                },
            ]
        },
        // Add other mocks if needed
    }
    return courseData[id] || courseData["1"]
}
