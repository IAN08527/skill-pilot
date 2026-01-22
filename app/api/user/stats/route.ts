import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // In a real app, these would come from various tables (enrollments, achievements, etc.)
        // For now, we'll try to fetch from a user_stats table or return default values
        const { data: stats, error: statsError } = await supabase
            .from("user_stats")
            .select("*")
            .eq("user_id", user.id)
            .single()

        if (statsError && statsError.code !== "PGRST116") {
            console.error("Error fetching stats:", statsError)
        }

        // Default stats if none found in DB
        const defaultStats = {
            courses_enrolled: 0,
            courses_completed: 0,
            hours_learned: 0,
            skills_gained: 0,
            achievements: 0,
            progress_rate: 0
        }

        return NextResponse.json({
            stats: stats || defaultStats
        })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
