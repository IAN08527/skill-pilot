"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen,
  Plus,
  LayoutDashboard,
  User,
  LogOut,
  Sparkles,
  Play,
  CheckCircle,
  Circle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import Loading from "../../loading"



export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")
  const { toast } = useToast()
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const [courseLoading, setCourseLoading] = useState(true)

  const courseId = params.id as string

  useEffect(() => {
    setIsVisible(true)
    const fetchData = async () => {
      try {
        const [profileRes, courseRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch(`/api/courses/${courseId}`)
        ])
        const profileData = await profileRes.json()
        const courseData = await courseRes.json()

        if (profileData.user) setUser(profileData.user)
        if (courseData.course) {
          setCourse(courseData.course)
          // Find first incomplete lesson
          for (const module of courseData.course.modules || []) {
            const incompleteLesson = module.lessons?.find((l: any) => !l.completed)
            if (incompleteLesson) {
              setCurrentLessonId(incompleteLesson.id)
              break
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
        setCourseLoading(false)
      }
    }
    fetchData()
  }, [courseId])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video": return Video
      case "reading": return FileText
      case "quiz": return Award
      default: return FileText
    }
  }

  if (courseLoading || !course) {
    return <Loading />
  }

  const currentLesson = course.modules?.flatMap((m: any) => m.lessons).find((l: any) => l.id === currentLessonId)
  const allLessons = course.modules?.flatMap((m: any) => m.lessons) || []
  const currentIndex = allLessons.findIndex((l: any) => l.id === currentLessonId)

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id)
    }
  }

  const handleComplete = async () => {
    if (!currentLesson || currentLesson.completed) return

    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${currentLesson.id}/complete`, {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        // Update local state
        const updatedCourse = { ...course }
        updatedCourse.modules = updatedCourse.modules.map((m: any) => ({
          ...m,
          lessons: m.lessons.map((l: any) =>
            l.id === currentLesson.id ? { ...l, completed: true } : l
          )
        }))

        // Update progress if applicable
        if (data.progress !== undefined) {
          updatedCourse.progress = data.progress
          updatedCourse.completedLessons = data.completedCount
        } else {
          updatedCourse.completedLessons = (updatedCourse.completedLessons || 0) + 1
          updatedCourse.progress = Math.round((updatedCourse.completedLessons / updatedCourse.totalLessons) * 100)
        }

        setCourse(updatedCourse)

        toast({
          title: "Lesson Completed!",
          description: "Well done! Keep going to reach your goal.",
        })

        // Auto-advance to next lesson after a short delay
        if (currentIndex < allLessons.length - 1) {
          setTimeout(() => {
            handleNext()
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error)
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex page-transition">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-20 lg:w-64 glass-panel border-r border-border flex flex-col z-40 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
        }`}>
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground hidden lg:block">Skill Pilot</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${activeNav === item.id
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${activeNav === item.id ? "text-primary" : ""
                }`} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <Link
            href="/home/profile"
            className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl hover:bg-muted transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.full_name || user?.user_metadata?.full_name || user?.email || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">View Profile</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 mt-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group font-medium"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:block">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className={`sticky top-0 z-30 glass-panel border-b border-border p-4 lg:p-6 transition-all duration-500 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/home/dashboard')}
                className="hover:bg-muted"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{course.title}</h1>
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <span className="text-sm font-bold text-primary">{course.progress}%</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row">
          {/* Video/Content Area */}
          <div className="flex-1 p-4 lg:p-8">
            {/* Current Lesson */}
            {currentLesson && (
              <div className={`transition-all duration-500 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}>
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-primary ml-1" />
                    </div>
                    <p className="text-muted-foreground">Click to play lesson</p>
                  </div>
                </div>

                {/* Lesson Info */}
                <div className="glass-panel rounded-xl p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">{currentLesson.title}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {currentLesson.duration}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          {React.createElement(getLessonIcon(currentLesson.type), { className: "w-4 h-4" })}
                          {currentLesson.type}
                        </span>
                      </div>
                    </div>
                    {currentLesson.completed ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === allLessons.length - 1}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Content */}
          <div className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card/50 transition-all duration-500 delay-300 ${isVisible ? "opacity-100" : "opacity-0"
            }`}>
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Course Content</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {course.completedLessons} of {course.totalLessons} lessons completed
              </p>
              <Progress value={course.progress} className="h-2 mt-3" />
            </div>

            {/* Modules List */}
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {course.modules.map((module: any, moduleIndex: number) => (
                <div key={module.id} className="border-b border-border last:border-b-0">
                  <div className="p-4 bg-muted/50">
                    <h4 className="font-medium text-foreground text-sm">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {module.lessons.map((lesson: any) => {
                      const LessonIcon = getLessonIcon(lesson.type)
                      const isActive = lesson.id === currentLessonId

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full p-4 flex items-center gap-3 text-left transition-all duration-200 hover:bg-muted ${isActive ? "bg-primary/10 border-l-2 border-primary" : ""
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${lesson.completed
                            ? "bg-green-500/20 text-green-500"
                            : isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                            }`}>
                            {lesson.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <LessonIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : "text-foreground"
                              }`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.duration}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
