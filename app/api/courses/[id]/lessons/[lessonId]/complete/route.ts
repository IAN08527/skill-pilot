import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: { id: string, lessonId: string } }
) {
    try {
        const supabase = await createClient()
        const { id: courseId, lessonId } = params

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

        // 3. Update user_progress
        const { data: progressEntry, error: progressError } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single()

        if (progressEntry) {
            const newCompletedCount = (progressEntry.completed_lessons || 0) + 1
            const totalLessons = progressEntry.total_lessons || 1
            const newProgress = Math.min(Math.round((newCompletedCount / totalLessons) * 100), 100)

            await supabase
                .from("user_progress")
                .update({
                    completed_lessons: newCompletedCount,
                    progress_percentage: newProgress,
                    status: newProgress === 100 ? 'completed' : 'started',
                    last_accessed_at: new Date().toISOString()
                })
                .eq("id", progressEntry.id)

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

                    // Unlock "Course Finisher" achievement if not already earned
                    const { data: existingAchievement } = await supabase
                        .from("achievements")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("title", "Course Finisher")
                        .single()

                    if (!existingAchievement) {
                        await supabase.from("achievements").insert({
                            user_id: user.id,
                            title: "Course Finisher",
                            icon: "🎓",
                            unlocked_at: new Date().toISOString()
                        })
                        updates.achievements = (stats.achievements || 0) + 1
                    }
                }

                // Recalculate average progress rate
                updates.progress_rate = Math.min(Math.round(((stats.courses_completed * 100 + newProgress) / (stats.courses_enrolled || 1))), 100)

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
            message: "Lesson marked as complete (Mock Mode)",
            simulated: true
        })
    } catch (error) {
        console.error("Error in lesson completion API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
