import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createCustomCourse } from "@/modules/createCustomCourse"

export async function POST(request: Request) {
    console.log('\n🚀 ========== COURSE CREATION STARTED ==========')
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.json()
        console.log('📝 Form data received:', formData)

        console.log('🎬 Starting course generation...')
        const course = await createCustomCourse(formData, user.id, supabase)

        console.log('✅ Course created successfully!')
        console.log('📊 Course ID:', course.id)
        console.log('📊 Course Title:', course.title)

        return NextResponse.json({
            success: true,
            courseId: course.id,
            course: course
        })

    } catch (error: any) {
        console.error("❌ Custom course creation error:", error)
        console.error("❌ Error stack:", error.stack)
        return NextResponse.json({
            error: error.message || "Failed to create custom course"
        }, { status: 500 })
    } finally {
        console.log('🏁 ========== COURSE CREATION ENDED ==========\n')
    }
}
