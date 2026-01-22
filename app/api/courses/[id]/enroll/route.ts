import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()
        const { id: courseId } = params

        // 1. Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 2. Check if already enrolled
        const { data: existingProgress, error: checkError } = await supabase
            .from("user_progress")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single()

        if (existingProgress) {
            return NextResponse.json({ message: "Already enrolled", progressId: existingProgress.id })
        }

        // 3. Create entry in user_progress
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("total_lessons")
            .eq("id", courseId)
            .single()

        const { data: newProgress, error: enrollError } = await supabase
            .from("user_progress")
            .insert({
                user_id: user.id,
                course_id: courseId,
                status: 'started',
                progress_percentage: 0,
                completed_lessons: 0,
                total_lessons: course?.total_lessons || 0,
                last_accessed_at: new Date().toISOString()
            })
            .select()
            .single()

        // 4. Update User Stats
        const { data: stats } = await supabase
            .from("user_stats")
            .select("courses_enrolled")
            .eq("user_id", user.id)
            .single()

        if (stats) {
            await supabase
                .from("user_stats")
                .update({ courses_enrolled: (stats.courses_enrolled || 0) + 1 })
                .eq("user_id", user.id)
        }

        return NextResponse.json({ message: "Enrolled successfully", enrollment: newProgress }, { status: 201 })
    } catch (error) {
        console.error("Error in enrollment API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
