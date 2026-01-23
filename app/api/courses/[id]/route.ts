import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id } = await params

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        // Fetch course details
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single()

        if (courseError) {
            console.error("Error fetching course:", courseError.message)
            return NextResponse.json(
                { error: "Course not found", details: courseError.message },
                { status: 404 }
            )
        }

        // Fetch user enrollment for progress
        let progress = 0
        let completedLessons = 0
        let completedLessonIds: string[] = []

        if (user) {
            const { data: enrollment } = await supabase
                .from("enrollments")
                .select("progress, completed_lessons")
                .eq("course_id", id)
                .eq("user_id", user.id)
                .single()

            if (enrollment) {
                progress = enrollment.progress || 0
                completedLessons = enrollment.completed_lessons || 0
            }

            // Fetch completed lesson IDs for this user
            const { data: completions } = await supabase
                .from("lesson_completions")
                .select("lesson_id")
                .eq("course_id", id)
                .eq("user_id", user.id)

            if (completions) {
                completedLessonIds = completions.map(c => c.lesson_id)
            }
        }

        // Fetch modules with lessons and chapters
        const { data: modules, error: modulesError } = await supabase
            .from("modules")
            .select(`
                *,
                lessons (
                    *,
                    chapters (*)
                )
            `)
            .eq("course_id", id)
            .order("order_index", { ascending: true })

        if (modulesError) {
            console.error("Error fetching modules:", modulesError.message)
            // Return course without modules
            return NextResponse.json({
                course: {
                    ...course,
                    totalLessons: course.total_lessons || 0,
                    completedLessons,
                    progress,
                    modules: []
                }
            })
        }

        // Sort lessons within each module and mark completed lessons
        const sortedModules = (modules || []).map(module => {
            const sortedLessons = (module.lessons || [])
                .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
                .map((lesson: any) => ({
                    ...lesson,
                    completed: completedLessonIds.includes(lesson.id),
                    chapters: (lesson.chapters || []).sort((a: any, b: any) =>
                        (a.timestamp_seconds || 0) - (b.timestamp_seconds || 0)
                    )
                }))

            return {
                ...module,
                lessons: sortedLessons
            }
        })

        return NextResponse.json({
            course: {
                ...course,
                totalLessons: course.total_lessons || 0,
                completedLessons,
                progress,
                modules: sortedModules
            }
        })
    } catch (error) {
        console.error("Error in course details API:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
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
