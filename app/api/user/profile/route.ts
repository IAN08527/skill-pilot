import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Attempt to get profile data from a 'profiles' table
        // If it doesn't exist yet, we'll return user metadata as a fallback
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

        if (profileError && profileError.code !== "PGRST116") { // PGRST116 is 'no rows returned'
            console.error("Error fetching profile:", profileError)
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: profile?.full_name || user.user_metadata?.full_name,
                avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
                created_at: user.created_at,
                ...profile,
            },
        })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const supabase = await createClient()

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const updates = await request.json()

        const { data, error } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Also update auth metadata if full_name is provided
        if (updates.full_name) {
            await supabase.auth.updateUser({
                data: { full_name: updates.full_name }
            })
        }

        return NextResponse.json({ user: data })
    } catch (error) {
        console.error("Unexpected error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
