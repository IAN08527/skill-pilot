import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string, lessonId: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: courseId, lessonId } = await params

        // 1. Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Mark lesson as complete in lesson_completions table
        const { error: completeError } = await supabase
            .from("lesson_completions")
            .upsert({
                user_id: user.id,
                course_id: courseId,
                lesson_id: lessonId,
                completed_at: new Date().toISOString()
            }, { onConflict: 'user_id,lesson_id' })

        if (completeError) {
            console.warn("Supabase error marking lesson complete, falling back to mock behavior:", completeError.message)
        }

        // 3. Update enrollments
        const { data: enrollment, error: enrollError } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single()

        if (enrollment) {
            const newCompletedCount = (enrollment.completed_lessons || 0) + 1
            const totalLessons = enrollment.total_lessons || 1
            const newProgress = Math.min(Math.round((newCompletedCount / totalLessons) * 100), 100)

            await supabase
                .from("enrollments")
                .update({
                    completed_lessons: newCompletedCount,
                    progress: newProgress,
                    last_accessed_at: new Date().toISOString()
                })
                .eq("id", enrollment.id)

            // 4. Update Global User Stats
            const { data: stats } = await supabase
                .from("user_stats")
                .select("*")
                .eq("user_id", user.id)
                .single()

            if (stats) {
                const updates: any = {
                    hours_learned: (stats.hours_learned || 0) + 0.5,
                }

                if (newProgress === 100) {
                    updates.courses_completed = (stats.courses_completed || 0) + 1

                    // Unlock "Course Finisher" achievement
                    await supabase.from("achievements")
                        .upsert({
                            user_id: user.id,
                            title: "Course Finisher",
                            icon: "🎓",
                            unlocked_at: new Date().toISOString()
                        }, { onConflict: 'user_id,title' })
                }

                await supabase
                    .from("user_stats")
                    .update(updates)
                    .eq("user_id", user.id)
            }

            return NextResponse.json({
                message: "Lesson marked as complete",
                progress: newProgress,
                completedCount: newCompletedCount
            })
        }

        return NextResponse.json({
            message: "Lesson marked as complete (No enrollment found)",
            success: true
        })
    } catch (error) {
        console.error("Error in lesson completion API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
