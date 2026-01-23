"use client"

import React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
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
import { useToast } from "@/components/ui/use-toast"
import Loading from "./loading"

function ExploreContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  const [isVisible, setIsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeNav, setActiveNav] = useState("explore")
  const [activeCategory, setActiveCategory] = useState("all")
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [courses, setCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [enrollingId, setEnrollingId] = useState<number | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { history, addToHistory, removeFromHistory, clearHistory, getFilteredHistory } = useSearchHistory()

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setIsVisible(true)
    const controller = new AbortController()

    const loadInitialData = async () => {
      setCoursesLoading(true)
      setPage(1)
      setHasMore(true)

      try {
        const [userRes, coursesRes, externalRes] = await Promise.all([
          fetch("/api/user/profile", { signal: controller.signal }),
          fetch(`/api/courses?category=${activeCategory}&q=${debouncedQuery}`, { signal: controller.signal }),
          debouncedQuery ? fetch(`/api/courses/search/external?q=${debouncedQuery}&page=1`, { signal: controller.signal }) : Promise.resolve({ json: () => ({ courses: [] }) } as any)
        ])

        const userData = await userRes.json()
        const coursesData = await coursesRes.json()
        const externalData = await externalRes.json()

        if (userData.user) setUser(userData.user)

        let allCourses = coursesData.courses || []
        if (externalData.courses && externalData.courses.length > 0) {
          const taggedExternal = externalData.courses.map((c: any) => ({
            ...c,
            isExternal: true
          }))
          allCourses = [...allCourses, ...taggedExternal]
        }

        setCourses(allCourses)
        setHasMore(externalData.hasMore || false)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching data:", error)
        }
      } finally {
        setIsLoading(false)
        setCoursesLoading(false)
      }
    }

    loadInitialData()
    return () => controller.abort()
  }, [activeCategory, debouncedQuery])

  const loadMoreCourses = async () => {
    if (isFetchingMore || !hasMore) return
    setIsFetchingMore(true)
    const nextPage = page + 1

    try {
      const response = await fetch(`/api/courses/search/external?q=${searchQuery}&page=${nextPage}`)
      const data = await response.json()

      if (data.courses && data.courses.length > 0) {
        const taggedExternal = data.courses.map((c: any) => ({
          ...c,
          isExternal: true
        }))
        setCourses(prev => [...prev, ...taggedExternal])
        setPage(nextPage)
        setHasMore(data.hasMore || false)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more courses:", error)
      setHasMore(false)
    } finally {
      setIsFetchingMore(false)
    }
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !coursesLoading) {
          loadMoreCourses()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, coursesLoading, page, debouncedQuery])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId)
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message || "You have successfully enrolled in the course.",
        })
        // Redirect to course page after a short delay
        setTimeout(() => {
          router.push(`/home/course/${courseId}`)
        }, 1500)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to enroll. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Enrollment error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnrollingId(null)
    }
  }

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
      setDebouncedQuery(searchQuery) // Trigger immediately on enter
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

  const categories = useMemo(() => [
    { id: "all", label: "All Courses" },
    { id: "programming", label: "Programming" },
    { id: "design", label: "Design" },
    { id: "business", label: "Business" },
    { id: "ai", label: "AI & ML" },
  ], [])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesLevel = selectedLevel === "all" ||
        (course.level && course.level.toLowerCase().includes(selectedLevel.toLowerCase()))

      const matchesPrice = selectedPrice === "all" ||
        (course.price && course.price.toLowerCase() === selectedPrice.toLowerCase())

      const matchesPlatform = selectedPlatform === "all" ||
        (course.platform && course.platform.toLowerCase() === selectedPlatform.toLowerCase()) ||
        (selectedPlatform === "local" && !course.isExternal)

      return matchesLevel && matchesPrice && matchesPlatform
    })
  }, [courses, selectedLevel, selectedPrice, selectedPlatform])

  return (
    <div className="min-h-screen bg-background text-foreground flex page-transition">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-background/95 backdrop-blur-xl border-r border-border flex flex-col z-40 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
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
                  className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 pl-12 pr-4 rounded-xl transition-all duration-300 shadow-sm"
                />
              </form>

              {/* Search History Dropdown */}
              {showHistory && filteredHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl overflow-hidden z-50 shadow-xl border border-primary/20 bg-background/95">
                  <div className="p-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground px-2 uppercase tracking-wider">Recent Searches</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        clearHistory()
                      }}
                      className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {filteredHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between group px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer"
                        onClick={() => handleHistoryClick(item.query)}
                      >
                        <div className="flex items-center gap-3">
                          <History className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm text-foreground">{item.query}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromHistory(item.id)
                          }}
                          className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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

          {/* Quick Filters */}
          <div className="mt-6 flex flex-wrap items-center gap-3 animate-fade-in-up duration-500 delay-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/50 border border-border">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Refine:</span>
            </div>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none transition-all appearance-none min-w-[120px]"
            >
              <option value="all">Every Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {/* Price Filter */}
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none transition-all appearance-none min-w-[120px]"
            >
              <option value="all">Every Price</option>
              <option value="free">Free Only</option>
              <option value="paid">Premium</option>
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-1.5 rounded-xl glass-panel text-xs border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none transition-all appearance-none min-w-[140px]"
            >
              <option value="all">Every Platform</option>
              <option value="local">Skill Pilot</option>
              <option value="coursera">Coursera</option>
              <option value="geeksforgeeks">GeeksforGeeks</option>
            </select>

            {(selectedLevel !== "all" || selectedPrice !== "all" || selectedPlatform !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLevel("all")
                  setSelectedPrice("all")
                  setSelectedPlatform("all")
                }}
                className="text-xs text-primary hover:text-primary/80 h-8 px-2"
              >
                Reset
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Page Title */}
          <div className={`mb-6 transition-all duration-500 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
            <p className="text-muted-foreground">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : "Discover courses to enhance your skills"}
            </p>
          </div>

          {/* Categories */}
          <div className={`flex flex-wrap gap-2 mb-8 transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            {categories.map((category: any) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${activeCategory === category.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "glass-panel text-muted-foreground hover:text-foreground"
                  }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            {filteredCourses.map((course: any, index: number) => (
              <div
                key={course.id}
                className="glass-panel rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Course Thumbnail */}
                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-primary/20 to-background">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = course.platform === 'GeeksforGeeks' ? '/geeksforgeeks.png' : '/placeholder.jpg';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-background/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg backdrop-blur-sm">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </div>
                  {course.isExternal && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 shadow-sm">
                      {course.platform}
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {course.isExternal ? course.platform : (course.instructor || "Expert Instructor")}
                  </p>

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

                  {course.isExternal ? (
                    <Button
                      asChild
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                    >
                      <a href={course.url} target="_blank" rel="noopener noreferrer">
                        Learn on {course.platform}
                      </a>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      {enrollingId === course.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Enrolling...
                        </div>
                      ) : "Enroll Now"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Trigger & Loader */}
          <div ref={loadMoreRef} className="py-12 flex flex-col items-center justify-center gap-4">
            {isFetchingMore ? (
              <>
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Finding more courses for you...</p>
              </>
            ) : hasMore ? (
              <div className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" />
            ) : filteredCourses.length > 0 ? (
              <p className="text-sm text-muted-foreground">You've reached the end of the list.</p>
            ) : null}
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
