import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all user playlists
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: playlists, error } = await supabase
            .from("playlists")
            .select(`
        *,
        courses_count:playlist_courses(count)
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ playlists })
    } catch (error) {
        console.error("Error fetching playlists:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// POST create a new playlist
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title, description, is_public } = await request.json()

        const { data: playlist, error } = await supabase
            .from("playlists")
            .insert({
                user_id: user.id,
                title,
                description,
                is_public: is_public || false
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ playlist }, { status: 201 })
    } catch (error) {
        console.error("Error creating playlist:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
