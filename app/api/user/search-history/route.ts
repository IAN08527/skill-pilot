import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = await supabase
            .from("search_history")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)

        if (error) {
            // If table doesn't exist, we might get an error. We'll handle it gracefully.
            console.error("Error fetching search history:", error)
            return NextResponse.json({ history: [] })
        }

        return NextResponse.json({ history: data })
    } catch (error: any) {
        console.error("Search history fetch error:", error)
        return NextResponse.json({ history: [] })
    }
}

export async function POST(request: Request) {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { query } = await request.json()
        if (!query) {
            return NextResponse.json({ error: "Query required" }, { status: 400 })
        }

        // Upsert logic: if same query exists for this user, update timestamp
        const { error } = await supabase
            .from("search_history")
            .upsert({
                user_id: user.id,
                query: query.trim(),
                created_at: new Date().toISOString()
            }, {
                onConflict: "user_id,query"
            })

        if (error) {
            console.error("Error saving search history:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Search history save error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await request.json()

        const query = supabase.from("search_history").delete().eq("user_id", user.id)

        if (id) {
            query.eq("id", id)
        }

        const { error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
