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
  Award,
  Rocket,
  Target,
  Briefcase,
  Zap,
  Trophy,
  Layout,
  Star,
  Play,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Video,
  FileText,
  BarChart3
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
  const [isWatching, setIsWatching] = useState(false)
  const [startTime, setStartTime] = useState(0)

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
        <header className={`sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border p-4 lg:p-6 transition-all duration-500 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
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
                <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Link href="/home/dashboard" className="hover:text-primary transition-colors">Courses</Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground truncate max-w-[100px] md:max-w-none">{course.title}</span>
                </nav>
                <h1 className="text-xl md:text-2xl font-bold text-foreground line-clamp-1">{course.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={() => {
                  if (!currentLessonId) {
                    const firstLesson = course.modules?.[0]?.lessons?.[0];
                    if (firstLesson) setCurrentLessonId(firstLesson.id);
                  }
                  setIsWatching(!isWatching);
                }}
                className={`hidden md:flex rounded-xl transition-all duration-300 ${isWatching ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                {isWatching ? (
                  <>
                    <Layout className="w-4 h-4 mr-2" />
                    View Overview
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Watch Playlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">

          {isWatching ? (
            /* Watch Mode View */
            <div className={`grid lg:grid-cols-3 gap-8 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <div className="lg:col-span-2 space-y-6">
                {/* Video Player Section */}
                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl bg-black aspect-video relative group">
                  {currentLesson?.video_id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${currentLesson.video_id}?autoplay=1&rel=0&modestbranding=1${startTime ? `&start=${startTime}` : ''}`}
                      title={currentLesson.title}
                      key={`${currentLesson.id}-${startTime}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <Video className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Video Available</h3>
                      <p className="text-gray-400 max-w-xs">This lesson type doesn't have a direct video link or is still being processed.</p>
                    </div>
                  )}
                </div>

                {/* Video Info Card & Chapters */}
                <div className="space-y-6">
                  <div className="glass-panel rounded-3xl p-6 lg:p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            Now Playing
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {currentLesson?.duration || "15:00"}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground line-clamp-2">{currentLesson?.title}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setStartTime(0)
                            handlePrevious()
                          }}
                          disabled={currentIndex === 0}
                          className="rounded-xl border border-border"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Prev
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setStartTime(0)
                            handleNext()
                          }}
                          disabled={currentIndex === allLessons.length - 1}
                          className="rounded-xl border border-border"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        {!currentLesson?.completed && (
                          <Button
                            onClick={handleComplete}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lesson Chapters */}
                  {currentLesson?.chapters && currentLesson.chapters.length > 0 && (
                    <div className="glass-panel rounded-3xl p-6 lg:p-8 animate-fade-in">
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Layout className="w-5 h-5 text-primary" />
                        Video Chapters
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentLesson.chapters.map((chapter: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setStartTime(chapter.timestamp_seconds)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${startTime === chapter.timestamp_seconds
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-muted/30 border-border/50 hover:bg-muted/50 text-foreground"
                              }`}
                          >
                            <span className="text-sm font-medium truncate pr-4">{chapter.title}</span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-background/50 text-muted-foreground whitespace-nowrap">
                              {Math.floor(chapter.timestamp_seconds / 60)}:{(chapter.timestamp_seconds % 60).toString().padStart(2, '0')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Curriculum Sidebar (Sticky in player mode) */}
              <div className="space-y-6">
                <div className="glass-panel rounded-3xl p-6 h-[calc(100vh-200px)] lg:h-[calc(100vh-240px)] sticky top-28 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Course Playlist
                    </h3>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="text-primary">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
                    {course.modules.map((module: any, mIdx: number) => (
                      <div key={module.id} className="space-y-3">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Module {mIdx + 1}</p>
                        <div className="space-y-2">
                          {module.lessons.map((lesson: any) => {
                            const LessonIcon = getLessonIcon(lesson.type);
                            const isActive = lesson.id === currentLessonId;

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setCurrentLessonId(lesson.id)}
                                className={`w-full group p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${isActive
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "bg-muted/30 hover:bg-muted/50 text-foreground border border-border/10"
                                  }`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/20" : lesson.completed ? "bg-green-500/10 text-green-500" : "bg-background/50 shadow-inner"
                                  }`}>
                                  {lesson.completed ? <CheckCircle className="w-4 h-4" /> : <LessonIcon className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{lesson.title}</p>
                                  <p className={`text-[10px] mt-0.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {lesson.duration}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsWatching(false)}
                    className="mt-6 w-full rounded-2xl border-border text-muted-foreground hover:text-foreground bg-transparent"
                  >
                    Exit Watch Mode
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Overview View */
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock, label: "Duration", value: course.duration, color: "text-blue-500" },
                  { icon: BookOpen, label: "Total Lessons", value: `${course.totalLessons} Lessons`, color: "text-purple-500" },
                  { icon: Trophy, label: "Experience", value: course.level || "Intermediate", color: "text-amber-500" },
                  { icon: Star, label: "Rating", value: "4.9/5.0", color: "text-yellow-500" },
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Overview Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Progress Detail */}
                  <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-primary fill-primary" />
                      Till now what you have done
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="relative text-center">
                        <div className="w-32 h-32 md:w-40 md:h-40 mx-auto relative">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                            <circle
                              className="text-primary stroke-current transition-all duration-1000 ease-out"
                              strokeWidth="8"
                              strokeDasharray={251.2}
                              strokeDashoffset={251.2 - (251.2 * course.progress) / 100}
                              strokeLinecap="round"
                              fill="transparent"
                              r="40" cx="50" cy="50"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
                            <span className="text-3xl font-bold text-foreground">{course.progress}%</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Current Milestone</p>
                          <p className="text-sm text-foreground font-medium">
                            {course.completedLessons >= course.totalLessons
                              ? "Course Completed! You've mastered all core concepts."
                              : `Successfully completed ${course.completedLessons} critical lessons in your learning path.`}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1 p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                            <p className="text-[10px] text-green-500 uppercase font-bold">Completed</p>
                            <p className="text-xl font-bold text-foreground">{course.completedLessons}</p>
                          </div>
                          <div className="flex-1 p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <p className="text-[10px] text-primary uppercase font-bold">Remaining</p>
                            <p className="text-xl font-bold text-foreground">{course.totalLessons - course.completedLessons}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3">
                      <p className="text-sm font-semibold text-foreground">Recently Mastered Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {(course.skills || []).map((skill: string, i: number) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="glass-panel rounded-3xl p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                      <Rocket className="w-6 h-6 text-primary" />
                      What can you make with what you have learned?
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      {(course.outcomes || [
                        {
                          title: "Professional Projects",
                          desc: "Build production-ready applications with modern best practices.",
                          icon: Briefcase,
                          color: "bg-blue-500"
                        },
                        {
                          title: "Custom Solutions",
                          desc: "Create bespoke tools and automations tailored to specific needs.",
                          icon: Hammer,
                          color: "bg-green-500"
                        },
                        {
                          title: "Portfolio Highlights",
                          desc: "Feature stunning projects that showcase your technical proficiency.",
                          icon: Target,
                          color: "bg-purple-500"
                        },
                        {
                          title: "Future innovations",
                          desc: "Lay the groundwork for exploring advanced AI and ML concepts.",
                          icon: Award,
                          color: "bg-amber-500"
                        }
                      ]).map((item: any, i: number) => {
                        const OutcomeIcon = item.icon === "Briefcase" ? Briefcase :
                          item.icon === "Hammer" ? Hammer :
                            item.icon === "Target" ? Target : Award;

                        return (
                          <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all cursor-default">
                            <div className={`w-10 h-10 rounded-xl ${item.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                              <OutcomeIcon className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Curriculum */}
                <div className="space-y-6">
                  <div className="glass-panel rounded-3xl p-6 h-fit sticky top-28">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-foreground">Course Content</h3>
                      <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {allLessons.length} Sections
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                      {course.modules.map((module: any, mIdx: number) => (
                        <div key={module.id} className="space-y-2">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-6 rounded-full bg-primary/30" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Module {mIdx + 1}</span>
                          </div>
                          <div className="space-y-2 pl-2">
                            {module.lessons.map((lesson: any) => {
                              const LessonIcon = getLessonIcon(lesson.type);
                              const isActive = lesson.id === currentLessonId;

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => {
                                    setCurrentLessonId(lesson.id);
                                    setIsWatching(true);
                                  }}
                                  className={`w-full group p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "bg-muted/50 hover:bg-muted text-foreground border border-border/50"
                                    }`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/20" : lesson.completed ? "bg-green-500/10 text-green-500" : "bg-background"
                                    }`}>
                                    {lesson.completed ? <CheckCircle className="w-4 h-4" /> : <LessonIcon className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{lesson.title}</p>
                                    <p className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                      {lesson.duration}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => setIsWatching(true)}
                      className="w-full mt-8 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-bold py-6 group"
                    >
                      Resume Learning Journey
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
