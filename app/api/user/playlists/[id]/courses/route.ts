import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST add course to playlist
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { id: playlistId } = await params

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { courseId } = await request.json()

        // 1. Check if playlist belongs to user
        const { data: playlist } = await supabase
            .from("playlists")
            .select("id")
            .eq("id", playlistId)
            .eq("user_id", user.id)
            .single()

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found or access denied" }, { status: 404 })
        }

        // 2. Get current max position to append
        const { data: countData } = await supabase
            .from("playlist_courses")
            .select("position")
            .eq("playlist_id", playlistId)
            .order("position", { ascending: false })
            .limit(1)

        const nextPosition = countData && countData.length > 0 ? countData[0].position + 1 : 0

        // 3. Add course
        const { error } = await supabase
            .from("playlist_courses")
            .upsert({
                playlist_id: playlistId,
                course_id: courseId,
                position: nextPosition
            })

        if (error) throw error

        return NextResponse.json({ message: "Course added to playlist" })
    } catch (error) {
        console.error("Error adding course to playlist:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

// DELETE remove course from playlist
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { id: playlistId } = await params

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { courseId } = await request.json()

        const { error } = await supabase
            .from("playlist_courses")
            .delete()
            .eq("playlist_id", playlistId)
            .eq("course_id", courseId)

        if (error) throw error

        return NextResponse.json({ message: "Course removed from playlist" })
    } catch (error) {
        console.error("Error removing course from playlist:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
