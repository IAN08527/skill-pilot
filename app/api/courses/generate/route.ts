import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { topic, goal, duration, level } = await request.json()

        if (!process.env.GEMINI_API_KEY) {
            // Fallback for demo if no API key is provided
            console.warn("GEMINI_API_KEY not found. Simulating AI generation.")
            return simulateGeneration(user.id, topic, goal, duration, level)
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
      Create a detailed course structure for the following:
      Topic: ${topic}
      Goal: ${goal}
      Duration: ${duration}
      Level: ${level}

      Return only a JSON object with the following structure:
      {
        "title": "Course Title",
        "description": "Short description",
        "instructor": "AI Generated Expert Name",
        "duration": "${duration}",
        "category": "Identify one of: programming, design, business, ai",
        "skills": ["Skill 1", "Skill 2"],
        "total_lessons": 15,
        "modules": [
          {
            "title": "Module 1 Title",
            "lessons": [
              { "title": "Lesson 1 Title", "duration": "10 min", "type": "video" },
              { "title": "Lesson 2 Title", "duration": "15 min", "type": "reading" }
            ]
          }
        ]
      }
      Ensure the total_lessons matches the count of all lessons. Make it comprehensive and high quality.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up response to ensure it's valid JSON
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim()
        const courseData = JSON.parse(jsonStr)

        // Store the course in Supabase
        // 1. Insert course
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .insert({
                title: courseData.title,
                description: courseData.description,
                instructor: courseData.instructor,
                duration: courseData.duration,
                category: courseData.category,
                skills: courseData.skills,
                total_lessons: courseData.total_lessons,
                is_ai_generated: true,
                created_by: user.id
            })
            .select()
            .single()

        if (courseError) throw courseError

        // 2. Insert modules and lessons
        for (const [mIndex, moduleData] of courseData.modules.entries()) {
            const { data: insertedModule, error: mError } = await supabase
                .from("modules")
                .insert({
                    course_id: course.id,
                    title: moduleData.title,
                    order_index: mIndex
                })
                .select()
                .single()

            if (mError) continue

            const lessonsToInsert = moduleData.lessons.map((l: any, lIndex: number) => ({
                module_id: insertedModule.id,
                course_id: course.id,
                title: l.title,
                duration: l.duration,
                type: l.type,
                order_index: lIndex
            }))

            await supabase.from("lessons").insert(lessonsToInsert)
        }

        // 3. Automatically enroll user in the generated course
        await supabase.from("enrollments").insert({
            user_id: user.id,
            course_id: course.id,
            progress: 0,
            completed_lessons: 0,
            total_lessons: course.total_lessons,
            last_accessed_at: new Date().toISOString()
        })

        return NextResponse.json({ courseId: course.id })

    } catch (error) {
        console.error("AI Generation error:", error)
        return NextResponse.json({ error: "Failed to generate course" }, { status: 500 })
    }
}

async function simulateGeneration(userId: string, topic: string, goal: string, duration: string, level: string) {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Return a dummy ID or tell the frontend to use mock
    return NextResponse.json({
        message: "AI Generation simulated (Add GEMINI_API_KEY for real results)",
        courseId: "gen_" + Date.now(),
        isMock: true
    })
}
