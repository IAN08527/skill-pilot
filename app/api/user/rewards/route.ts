import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 1. Fetch all enrollments
        const { data: enrollments, error: enrollError } = await supabase
            .from("enrollments")
            .select(`
                *,
                course:courses (*)
            `)
            .eq("user_id", user.id)

        // 2. Fetch badges/achievements
        const { data: achievements, error: achError } = await supabase
            .from("achievements")
            .select("*")
            .eq("user_id", user.id)

        const completedEnrollments = (enrollments || []).filter(e => e.progress === 100)
        const inProgressEnrollments = (enrollments || []).filter(e => e.progress < 100)

        const certificates = completedEnrollments.map(e => ({
            id: e.id,
            title: e.course?.title || "Unknown Course",
            issueDate: new Date(e.last_accessed_at).toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            credential: `CERT-${e.course_id}-${e.id}`,
            courseId: e.course_id
        }))

        const inProgress = inProgressEnrollments.map(e => ({
            id: e.id,
            title: e.course?.title || "Unknown Course",
            progress: e.progress,
            remainingLessons: (e.total_lessons || 0) - (e.completed_lessons || 0),
            courseId: e.course_id
        }))

        // Return real data if available, fallback to mock if DB error
        if (enrollError || achError) {
            console.warn("Supabase error fetching rewards, falling back to mock.")
            return NextResponse.json({
                certificates: getMockCertificates(),
                inProgress: getMockInProgress(),
                achievements: getMockAchievements(),
                source: "mock"
            })
        }

        return NextResponse.json({
            certificates,
            inProgress,
            achievements: achievements || []
        })
    } catch (error) {
        console.error("Error in rewards API:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

function getMockCertificates() {
    return [
        {
            id: 1,
            title: "Machine Learning Fundamentals",
            issueDate: "January 15, 2026",
            credential: "ML-2026-001",
            progress: 100,
        },
        {
            id: 2,
            title: "Advanced React Development",
            issueDate: "December 20, 2025",
            credential: "REACT-2025-089",
            progress: 100,
        }
    ]
}

function getMockAchievements() {
    return [
        { id: 1, title: "7 Day Streak", icon: "🔥", date: "2 days ago" },
        { id: 2, title: "Course Finisher", icon: "🎓", date: "1 week ago" },
        { id: 3, title: "Early Bird", icon: "🌅", date: "2 weeks ago" }
    ]
}

function getMockInProgress() {
    return [
        {
            id: 4,
            title: "Deep Learning Specialization",
            progress: 65,
            remainingLessons: 12,
        },
        {
            id: 5,
            title: "Cloud Architecture Mastery",
            progress: 30,
            remainingLessons: 28,
        },
    ]
}
