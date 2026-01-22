"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { 
  Search, 
  BookOpen, 
  Plus, 
  LayoutDashboard, 
  User, 
  LogOut,
  Sparkles,
  Clock,
  Star,
  Play,
  Filter,
  X,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchHistory } from "@/hooks/use-search-history"
import { ThemeToggle } from "@/components/theme-toggle"
import Loading from "./loading"

function ExploreContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeNav, setActiveNav] = useState("explore")
  const [activeCategory, setActiveCategory] = useState("all")
  const [showHistory, setShowHistory] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { history, addToHistory, removeFromHistory, clearHistory, getFilteredHistory } = useSearchHistory()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (initialQuery) {
      addToHistory(initialQuery)
    }
  }, [initialQuery, addToHistory])

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
      setShowHistory(false)
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    addToHistory(query)
    setShowHistory(false)
  }

  const filteredHistory = getFilteredHistory(searchQuery)

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const categories = [
    { id: "all", label: "All Courses" },
    { id: "programming", label: "Programming" },
    { id: "design", label: "Design" },
    { id: "business", label: "Business" },
    { id: "ai", label: "AI & ML" },
  ]

  const courses = [
    {
      id: 1,
      title: "Introduction to Machine Learning",
      instructor: "Dr. Sarah Chen",
      duration: "8 hours",
      rating: 4.9,
      students: 12500,
      category: "ai",
    },
    {
      id: 2,
      title: "React & Next.js Masterclass",
      instructor: "John Developer",
      duration: "12 hours",
      rating: 4.8,
      students: 8900,
      category: "programming",
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      instructor: "Emily Design",
      duration: "6 hours",
      rating: 4.7,
      students: 6700,
      category: "design",
    },
    {
      id: 4,
      title: "Python for Data Science",
      instructor: "Mike Analytics",
      duration: "10 hours",
      rating: 4.9,
      students: 15200,
      category: "programming",
    },
    {
      id: 5,
      title: "Digital Marketing Strategy",
      instructor: "Lisa Marketing",
      duration: "5 hours",
      rating: 4.6,
      students: 4300,
      category: "business",
    },
    {
      id: 6,
      title: "Deep Learning with TensorFlow",
      instructor: "Dr. Alex Neural",
      duration: "15 hours",
      rating: 4.9,
      students: 7800,
      category: "ai",
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || course.category === activeCategory
    return matchesSearch && matchesCategory
  })

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
            <div ref={searchRef} className="relative flex-1 max-w-2xl">
              <form onSubmit={handleSearch}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
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
            <Button variant="outline" className="hidden md:flex items-center gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Page Title */}
          <div className={`mb-6 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Showing results for "${searchQuery}"` 
                : "Discover courses to enhance your skills"}
            </p>
          </div>

          {/* Categories */}
          <div className={`flex flex-wrap gap-2 mb-8 transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className="glass-panel rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Course Thumbnail */}
                <div className="h-40 bg-gradient-to-br from-primary/20 to-background relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">{course.instructor}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>

                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                    Enroll Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ExploreContent />
    </Suspense>
  )
}
