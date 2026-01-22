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
            // If table doesn't exist or other error, return mock data for now
            // so the app stays functional while the DB is being set up.
            console.warn("Supabase error fetching courses, falling back to mock:", error.message)
            return NextResponse.json({
                courses: getMockCourses(category, query),
                source: "mock"
            })
        }

        return NextResponse.json({ courses })
    } catch (error) {
        console.error("Error in courses API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function getMockCourses(category: string | null, query: string | null) {
    const courses = [
        {
            id: 1,
            title: "Introduction to Machine Learning",
            instructor: "Dr. Sarah Chen",
            duration: "8 hours",
            rating: 4.9,
            students: 12500,
            category: "ai",
            description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks.",
            skills: ["Python", "TensorFlow", "Data Analysis", "Neural Networks"],
            certificate: true
        },
        {
            id: 2,
            title: "React & Next.js Masterclass",
            instructor: "John Developer",
            duration: "12 hours",
            rating: 4.8,
            students: 8900,
            category: "programming",
            description: "Master modern React development with Next.js. Learn server components, app router, data fetching patterns.",
            skills: ["React", "Next.js", "TypeScript", "API Development"],
            certificate: true
        },
        {
            id: 3,
            title: "UI/UX Design Fundamentals",
            instructor: "Emily Design",
            duration: "6 hours",
            rating: 4.7,
            students: 6700,
            category: "design",
            description: "Learn Python programming with a focus on data science applications. Cover pandas, numpy, matplotlib.",
            skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
            certificate: true
        },
        {
            id: 4,
            title: "Python for Data Science",
            instructor: "Mike Analytics",
            duration: "10 hours",
            rating: 4.9,
            students: 15200,
            category: "programming",
            description: "Deep dive into data science using Python.",
            skills: ["Python", "Pandas", "NumPy", "Data Visualization"],
            certificate: true
        },
        {
            id: 5,
            title: "Digital Marketing Strategy",
            instructor: "Lisa Marketing",
            duration: "5 hours",
            rating: 4.6,
            students: 4300,
            category: "business",
            description: "Master digital marketing strategies for modern business.",
            skills: ["SEO", "SEM", "Social Media", "Content Marketing"],
            certificate: true
        },
        {
            id: 6,
            title: "Deep Learning with TensorFlow",
            instructor: "Dr. Alex Neural",
            duration: "15 hours",
            rating: 4.9,
            students: 7800,
            category: "ai",
            description: "Advanced deep learning with TensorFlow.",
            skills: ["Deep Learning", "CNN", "RNN", "Tensors"],
            certificate: true
        },
    ]

    return courses.filter((course) => {
        const matchesSearch = !query || course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.instructor.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = !category || category === "all" || course.category === category
        return matchesSearch && matchesCategory
    })
}
