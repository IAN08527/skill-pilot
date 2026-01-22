"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  BookOpen,
  Plus,
  LayoutDashboard,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  X,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchHistory } from "@/hooks/use-search-history"
import { ThemeToggle } from "@/components/theme-toggle"
import Loading from "./loading"

import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeNav, setActiveNav] = useState("dashboard")
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const { history, addToHistory, removeFromHistory, clearHistory, getFilteredHistory } = useSearchHistory()

  useEffect(() => {
    setIsVisible(true)
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, coursesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/stats"),
          fetch("/api/user/courses")
        ])

        const profileData = await profileRes.json()
        const statsData = await statsRes.json()
        const coursesData = await coursesRes.json()

        if (profileData.user) setUser(profileData.user)
        if (statsData.stats) setStatsData(statsData.stats)
        if (coursesData.courses) setEnrolledCourses(coursesData.courses)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addToHistory(searchQuery)
      router.push(`/home/explore?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    addToHistory(query)
    setShowHistory(false)
    router.push(`/home/explore?q=${encodeURIComponent(query)}`)
  }

  const filteredHistory = getFilteredHistory(searchQuery)

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const quickActions = [
    {
      id: "explore",
      title: "Explore Courses",
      description: "Browse thousands of curated courses",
      icon: BookOpen,
      href: "/home/explore",
      color: "bg-primary",
    },
    {
      id: "create",
      title: "Create Custom Course",
      description: "Build your personalized learning path",
      icon: Plus,
      href: "/home/create",
      color: "bg-blue-500",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      description: "Track your learning progress",
      icon: LayoutDashboard,
      href: "/home/dashboard",
      color: "bg-amber-500",
    },
  ]

  const stats = [
    { label: "Courses Enrolled", value: statsData?.courses_enrolled || "0", icon: BookOpen },
    { label: "Hours Learned", value: statsData?.hours_learned || "0", icon: Clock },
    { label: "Skills Gained", value: statsData?.skills_gained || "0", icon: Target },
    { label: "Progress Rate", value: (statsData?.progress_rate || "0") + "%", icon: TrendingUp },
  ]

  return (
    <Suspense fallback={<Loading />}>
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
            {navItems.map((item, index) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveNav(item.id)}
                className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] group ${activeNav === item.id
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
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
              className="w-full flex items-center gap-3 px-3 lg:px-4 py-3 mt-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="hidden lg:block font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-20 lg:ml-64 min-h-screen">
          {/* Header */}
          <header className={`sticky top-0 z-30 glass-panel border-b border-border p-4 lg:p-6 transition-all duration-500 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
            }`}>
            <div className="flex items-center gap-4">
              {/* Search Bar with History */}
              <div ref={searchRef} className="relative flex-1 max-w-2xl">
                <form onSubmit={handleSearch}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search courses, topics, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    className="w-full bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 pl-12 pr-4 rounded-xl transition-all duration-300"
                  />
                </form>

                {/* Search History Dropdown */}
                {showHistory && filteredHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl border border-border overflow-hidden z-50 animate-fade-in-up">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <History className="w-4 h-4" />
                        <span className="text-sm">Recent searches</span>
                      </div>
                      <button
                        onClick={() => clearHistory()}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors group cursor-pointer"
                          onClick={() => handleHistoryClick(item.query)}
                        >
                          <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{item.query}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromHistory(item.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Content Area */}
          <div className="p-4 lg:p-8">
            {/* Welcome Section */}
            <div className={`mb-8 transition-all duration-500 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || "Learner"}!
              </h1>
              <p className="text-muted-foreground text-lg">
                {"Ready to continue your learning journey? Here's what you can do today."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-panel rounded-2xl p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className={`mb-8 transition-all duration-500 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
              <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className="glass-panel rounded-2xl p-6 lg:p-8 group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{action.description}</p>
                      <div className="flex items-center text-primary font-medium">
                        <span>Get Started</span>
                        <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`transition-all duration-500 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
              <h2 className="text-xl font-semibold text-foreground mb-4">Continue Learning</h2>
              <div className="glass-panel rounded-2xl p-6 lg:p-8">
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 1).map((course) => (
                      <div key={course.id} className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-48 aspect-video bg-primary/10 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-primary" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-xl font-bold text-foreground mb-2">{course.title}</h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-primary font-medium">{course.progress}%</span>
                              </div>
                              <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>
                            <Link href={`/home/course/${course.id}`}>
                              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Continue
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {enrolledCourses.length > 1 && (
                      <Link href="/home/dashboard" className="block text-center text-sm text-primary hover:underline mt-4">
                        View all {enrolledCourses.length} courses
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Start exploring our course catalog to begin your learning journey.
                    </p>
                    <Link href="/home/explore">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                        Explore Courses
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  )
}
