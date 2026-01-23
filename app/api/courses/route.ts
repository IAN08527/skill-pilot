import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")
        const query = searchParams.get("q")

        let dbQuery = supabase
            .from("courses")
            .select("*")

        if (category && category !== "all") {
            dbQuery = dbQuery.eq("category", category)
        }

        if (query) {
            dbQuery = dbQuery.ilike("title", `%${query}%`)
        }

        const { data: courses, error } = await dbQuery

        if (error) {
            console.error("Supabase error fetching courses:", error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ courses })
    } catch (error: any) {
        console.error("Error in courses API:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const courseData = await request.json()
        const { data, error } = await supabase
            .from("courses")
            .insert({
                ...courseData,
                created_by: user.id
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ course: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await request.json()
        if (!id) {
            return NextResponse.json({ error: "Course ID required" }, { status: 400 })
        }

        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", id)
            .eq("created_by", user.id) // Only allow owner to delete

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
