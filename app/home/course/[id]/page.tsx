"use client"

import React from "react"
import use from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
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

// Mock course data
const courseData: Record<string, {
  id: number
  title: string
  description: string
  instructor: string
  totalLessons: number
  completedLessons: number
  progress: number
  modules: Array<{
    id: number
    title: string
    lessons: Array<{
      id: number
      title: string
      duration: string
      type: "video" | "reading" | "quiz"
      completed: boolean
    }>
  }>
}> = {
  "1": {
    id: 1,
    title: "Machine Learning Basics",
    description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks.",
    instructor: "Dr. Sarah Chen",
    totalLessons: 24,
    completedLessons: 18,
    progress: 75,
    modules: [
      {
        id: 1,
        title: "Introduction to Machine Learning",
        lessons: [
          { id: 1, title: "What is Machine Learning?", duration: "15 min", type: "video", completed: true },
          { id: 2, title: "Types of Machine Learning", duration: "20 min", type: "video", completed: true },
          { id: 3, title: "Setting Up Your Environment", duration: "10 min", type: "reading", completed: true },
          { id: 4, title: "Module 1 Quiz", duration: "15 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 2,
        title: "Supervised Learning",
        lessons: [
          { id: 5, title: "Linear Regression", duration: "25 min", type: "video", completed: true },
          { id: 6, title: "Logistic Regression", duration: "30 min", type: "video", completed: true },
          { id: 7, title: "Decision Trees", duration: "25 min", type: "video", completed: true },
          { id: 8, title: "Hands-on Practice", duration: "45 min", type: "reading", completed: true },
          { id: 9, title: "Module 2 Quiz", duration: "20 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 3,
        title: "Unsupervised Learning",
        lessons: [
          { id: 10, title: "Clustering Algorithms", duration: "30 min", type: "video", completed: true },
          { id: 11, title: "K-Means Clustering", duration: "25 min", type: "video", completed: true },
          { id: 12, title: "Dimensionality Reduction", duration: "35 min", type: "video", completed: true },
          { id: 13, title: "PCA Deep Dive", duration: "20 min", type: "reading", completed: true },
          { id: 14, title: "Module 3 Quiz", duration: "15 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 4,
        title: "Neural Networks",
        lessons: [
          { id: 15, title: "Introduction to Neural Networks", duration: "30 min", type: "video", completed: true },
          { id: 16, title: "Activation Functions", duration: "20 min", type: "video", completed: true },
          { id: 17, title: "Backpropagation", duration: "35 min", type: "video", completed: true },
          { id: 18, title: "Building Your First Neural Network", duration: "45 min", type: "reading", completed: false },
          { id: 19, title: "Module 4 Quiz", duration: "20 min", type: "quiz", completed: false },
        ]
      },
      {
        id: 5,
        title: "Deep Learning",
        lessons: [
          { id: 20, title: "Convolutional Neural Networks", duration: "40 min", type: "video", completed: false },
          { id: 21, title: "Recurrent Neural Networks", duration: "35 min", type: "video", completed: false },
          { id: 22, title: "Transfer Learning", duration: "25 min", type: "video", completed: false },
          { id: 23, title: "Final Project", duration: "120 min", type: "reading", completed: false },
          { id: 24, title: "Course Final Exam", duration: "60 min", type: "quiz", completed: false },
        ]
      },
    ]
  },
  "2": {
    id: 2,
    title: "React & Next.js",
    description: "Master modern React development with Next.js, including server components, app router, and best practices.",
    instructor: "John Developer",
    totalLessons: 32,
    completedLessons: 14,
    progress: 45,
    modules: [
      {
        id: 1,
        title: "React Fundamentals",
        lessons: [
          { id: 1, title: "Introduction to React", duration: "20 min", type: "video", completed: true },
          { id: 2, title: "JSX and Components", duration: "25 min", type: "video", completed: true },
          { id: 3, title: "Props and State", duration: "30 min", type: "video", completed: true },
          { id: 4, title: "Hooks Deep Dive", duration: "40 min", type: "video", completed: true },
          { id: 5, title: "Module 1 Quiz", duration: "15 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 2,
        title: "Advanced React",
        lessons: [
          { id: 6, title: "Context API", duration: "25 min", type: "video", completed: true },
          { id: 7, title: "Custom Hooks", duration: "30 min", type: "video", completed: true },
          { id: 8, title: "Performance Optimization", duration: "35 min", type: "video", completed: true },
          { id: 9, title: "Testing React Apps", duration: "40 min", type: "video", completed: true },
          { id: 10, title: "Module 2 Quiz", duration: "20 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 3,
        title: "Next.js Basics",
        lessons: [
          { id: 11, title: "Introduction to Next.js", duration: "20 min", type: "video", completed: true },
          { id: 12, title: "App Router", duration: "30 min", type: "video", completed: true },
          { id: 13, title: "Server Components", duration: "35 min", type: "video", completed: true },
          { id: 14, title: "Data Fetching", duration: "40 min", type: "video", completed: true },
          { id: 15, title: "Module 3 Quiz", duration: "15 min", type: "quiz", completed: false },
        ]
      },
      {
        id: 4,
        title: "Advanced Next.js",
        lessons: [
          { id: 16, title: "API Routes", duration: "25 min", type: "video", completed: false },
          { id: 17, title: "Authentication", duration: "45 min", type: "video", completed: false },
          { id: 18, title: "Database Integration", duration: "50 min", type: "video", completed: false },
          { id: 19, title: "Deployment", duration: "30 min", type: "video", completed: false },
          { id: 20, title: "Module 4 Quiz", duration: "20 min", type: "quiz", completed: false },
        ]
      },
    ]
  },
  "3": {
    id: 3,
    title: "Python for Data Science",
    description: "Learn Python programming with a focus on data science applications, including pandas, numpy, and visualization.",
    instructor: "Mike Analytics",
    totalLessons: 28,
    completedLessons: 6,
    progress: 20,
    modules: [
      {
        id: 1,
        title: "Python Basics",
        lessons: [
          { id: 1, title: "Introduction to Python", duration: "15 min", type: "video", completed: true },
          { id: 2, title: "Variables and Data Types", duration: "20 min", type: "video", completed: true },
          { id: 3, title: "Control Flow", duration: "25 min", type: "video", completed: true },
          { id: 4, title: "Functions", duration: "30 min", type: "video", completed: true },
          { id: 5, title: "Module 1 Quiz", duration: "15 min", type: "quiz", completed: true },
        ]
      },
      {
        id: 2,
        title: "Data Structures",
        lessons: [
          { id: 6, title: "Lists and Tuples", duration: "25 min", type: "video", completed: true },
          { id: 7, title: "Dictionaries and Sets", duration: "25 min", type: "video", completed: false },
          { id: 8, title: "Working with Files", duration: "20 min", type: "video", completed: false },
          { id: 9, title: "Module 2 Quiz", duration: "15 min", type: "quiz", completed: false },
        ]
      },
    ]
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null)

  const courseId = params.id as string
  const course = courseData[courseId] || courseData["1"]

  useEffect(() => {
    setIsVisible(true)
    // Find first incomplete lesson
    for (const module of course.modules) {
      const incompleteLesson = module.lessons.find(l => !l.completed)
      if (incompleteLesson) {
        setCurrentLessonId(incompleteLesson.id)
        break
      }
    }
  }, [course.modules])

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

  const currentLesson = course.modules.flatMap(m => m.lessons).find(l => l.id === currentLessonId)
  const allLessons = course.modules.flatMap(m => m.lessons)
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)

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

  return (
    <div className="min-h-screen bg-background text-foreground flex page-transition">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-20 lg:w-64 glass-panel border-r border-border flex flex-col z-40 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
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
              className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${
                activeNav === item.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                activeNav === item.id ? "text-primary" : ""
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
              <p className="text-sm font-medium text-foreground truncate">User</p>
              <p className="text-xs text-muted-foreground truncate">View Profile</p>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 lg:px-4 py-3 mt-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:block font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 min-h-screen">
        {/* Header */}
        <header className={`sticky top-0 z-30 glass-panel border-b border-border p-4 lg:p-6 transition-all duration-500 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
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
              <div className={`transition-all duration-500 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
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
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    ) : (
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
          <div className={`w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card/50 transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100" : "opacity-0"
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
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border-b border-border last:border-b-0">
                  <div className="p-4 bg-muted/50">
                    <h4 className="font-medium text-foreground text-sm">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                  </div>
                  <div className="divide-y divide-border">
                    {module.lessons.map((lesson) => {
                      const LessonIcon = getLessonIcon(lesson.type)
                      const isActive = lesson.id === currentLessonId
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full p-4 flex items-center gap-3 text-left transition-all duration-200 hover:bg-muted ${
                            isActive ? "bg-primary/10 border-l-2 border-primary" : ""
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            lesson.completed 
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
                            <p className={`text-sm font-medium truncate ${
                              isActive ? "text-primary" : "text-foreground"
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
