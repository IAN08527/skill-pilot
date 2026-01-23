import { NextResponse } from "next/server"
import { getCourses } from "@/modules/searchCourse"

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q") || "programming"
        const page = parseInt(searchParams.get("page") || "1")

        const result = await getCourses(query, 15, page)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("External search error:", error)
        return NextResponse.json({
            success: false,
            error: error.message || "Failed to fetch external courses",
            courses: []
        }, { status: 500 })
    }
}
