"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Search, 
  BookOpen, 
  Plus, 
  LayoutDashboard, 
  User, 
  LogOut,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  ChevronRight,
  Award,
  Calendar,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const stats = [
    { label: "Total Courses", value: "12", icon: BookOpen, change: "+2 this week" },
    { label: "Hours Learned", value: "48", icon: Clock, change: "+5 this week" },
    { label: "Skills Gained", value: "24", icon: Target, change: "+4 this week" },
    { label: "Achievements", value: "8", icon: Trophy, change: "+1 this week" },
  ]

  const enrolledCourses = [
    { 
      id: 1, 
      title: "Machine Learning Basics", 
      progress: 75, 
      lessons: 24, 
      completed: 18,
      instructor: "Dr. Sarah Chen",
      duration: "8 hours",
      description: "Learn the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks. This course covers practical implementations using Python and popular ML libraries.",
      lastAccessed: "2 hours ago",
      nextLesson: "Building Your First Neural Network",
      skills: ["Python", "TensorFlow", "Data Analysis", "Neural Networks"],
      certificate: true
    },
    { 
      id: 2, 
      title: "React & Next.js", 
      progress: 45, 
      lessons: 32, 
      completed: 14,
      instructor: "John Developer",
      duration: "12 hours",
      description: "Master modern React development with Next.js. Learn server components, app router, data fetching patterns, and deployment strategies for production applications.",
      lastAccessed: "1 day ago",
      nextLesson: "API Routes and Server Actions",
      skills: ["React", "Next.js", "TypeScript", "API Development"],
      certificate: true
    },
    { 
      id: 3, 
      title: "Python for Data Science", 
      progress: 20, 
      lessons: 28, 
      completed: 6,
      instructor: "Mike Analytics",
      duration: "10 hours",
      description: "Learn Python programming with a focus on data science applications. Cover pandas, numpy, matplotlib, and statistical analysis techniques.",
      lastAccessed: "3 days ago",
      nextLesson: "Working with Dictionaries",
      skills: ["Python", "Pandas", "NumPy", "Data Visualization"],
      certificate: true
    },
  ]

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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search your courses..."
                className="w-full bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 pl-12 pr-4 rounded-xl transition-all duration-300"
              />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Page Title */}
          <div className={`mb-6 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">Track your learning progress and achievements</p>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="glass-panel rounded-2xl p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Enrolled Courses */}
          <div className={`transition-all duration-500 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <h2 className="text-xl font-semibold text-foreground mb-4">Enrolled Courses</h2>
            <div className="space-y-4">
              {enrolledCourses.map((course, index) => (
                <div 
                  key={course.id}
                  className="glass-panel rounded-xl p-5 group hover:scale-[1.01] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.completed} / {course.lessons} lessons completed
                      </p>
                    </div>
                    <span className="text-primary font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex gap-3 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                      onClick={() => router.push(`/home/course/${course.id}`)}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent"
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
                          <DialogDescription>
                            Taught by {course.instructor}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-4 space-y-6">
                          {/* Progress Overview */}
                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium text-foreground">Your Progress</span>
                              <span className="text-lg font-bold text-primary">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-3" />
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                              <span>{course.completed} lessons completed</span>
                              <span>{course.lessons - course.completed} remaining</span>
                            </div>
                          </div>

                          {/* Course Info */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">About This Course</h4>
                            <p className="text-muted-foreground">{course.description}</p>
                          </div>

                          {/* Course Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-muted">
                              <Clock className="w-5 h-5 text-primary mb-2" />
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p className="font-semibold text-foreground">{course.duration}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted">
                              <BookOpen className="w-5 h-5 text-primary mb-2" />
                              <p className="text-sm text-muted-foreground">Lessons</p>
                              <p className="font-semibold text-foreground">{course.lessons} total</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted">
                              <Calendar className="w-5 h-5 text-primary mb-2" />
                              <p className="text-sm text-muted-foreground">Last Accessed</p>
                              <p className="font-semibold text-foreground">{course.lastAccessed}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted">
                              <Award className="w-5 h-5 text-primary mb-2" />
                              <p className="text-sm text-muted-foreground">Certificate</p>
                              <p className="font-semibold text-foreground">{course.certificate ? "Available" : "Not available"}</p>
                            </div>
                          </div>

                          {/* Next Lesson */}
                          <div className="p-4 rounded-xl border border-border">
                            <p className="text-sm text-muted-foreground mb-1">Next Up</p>
                            <p className="font-semibold text-foreground">{course.nextLesson}</p>
                          </div>

                          {/* Skills */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3">Skills You'll Learn</h4>
                            <div className="flex flex-wrap gap-2">
                              {course.skills.map((skill) => (
                                <span 
                                  key={skill}
                                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-border">
                            <Button 
                              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => router.push(`/home/course/${course.id}`)}
                            >
                              Continue Learning
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            <Button variant="outline" className="bg-transparent">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Stats
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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
