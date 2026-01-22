"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Search,
  BookOpen,
  Plus,
  LayoutDashboard,
  User,
  LogOut,
  Sparkles,
  Wand2,
  Clock,
  Target,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIGenerationLoader, generationSteps } from "@/components/ai-generation-loader"
import { useToast } from "@/components/ui/use-toast"

export default function CreateCoursePage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeNav, setActiveNav] = useState("create")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [generatedCourseId, setGeneratedCourseId] = useState<string | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    topic: "",
    goal: "",
    duration: "",
    level: "beginner",
  })

  useEffect(() => {
    setIsVisible(true)
    const fetchData = async () => {
      try {
        const response = await fetch("/api/user/profile")
        const data = await response.json()
        if (data.user) setUser(data.user)
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

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const levels = [
    { id: "beginner", label: "Beginner", description: "New to the topic" },
    { id: "intermediate", label: "Intermediate", description: "Some experience" },
    { id: "advanced", label: "Advanced", description: "Looking to master" },
  ]

  const handleGenerate = async () => {
    if (!formData.topic || !formData.goal || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate a course.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setCurrentStep(0)

    try {
      // Start API call in background
      const genPromise = fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      // Simulate step progress for UX
      for (let i = 0; i < generationSteps.length; i++) {
        setCurrentStep(i)
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const response = await genPromise
      const data = await response.json()

      if (response.ok) {
        setGeneratedCourseId(data.courseId)
        setIsGenerating(false)
        setIsGenerated(true)

        toast({
          title: "Course Generated!",
          description: "Your personalized learning path is ready.",
        })

        // Auto redirect after a short delay
        setTimeout(() => {
          router.push(`/home/course/${data.courseId}`)
        }, 2000)
      } else {
        throw new Error(data.error || "Failed to generate course")
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      setIsGenerating(false)
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12 pl-12 pr-4 rounded-xl transition-all duration-300"
              />
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
          {/* Page Title */}
          <div className={`mb-8 transition-all duration-500 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create Custom Course</h1>
                <p className="text-muted-foreground">Let AI build your personalized learning path</p>
              </div>
            </div>
          </div>

          {/* AI Generation Loading State */}
          {isGenerating && (
            <AIGenerationLoader topic={formData.topic} currentStep={currentStep} />
          )}

          {!isGenerating && !isGenerated && (
            /* Form */
            <div className={`glass-panel rounded-2xl p-6 lg:p-8 transition-all duration-500 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}>
              <div className="space-y-6">
                {/* Topic */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-foreground">What do you want to learn?</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Machine Learning, Web Development, UI Design..."
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12"
                  />
                </div>

                {/* Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-foreground">What is your learning goal?</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g., Build a portfolio website, Get a job as a data scientist..."
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 min-h-24 resize-none"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-foreground">How much time can you dedicate?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["2-4 weeks", "1-2 months", "3+ months"].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => setFormData({ ...formData, duration })}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${formData.duration === duration
                          ? "bg-primary text-primary-foreground font-medium"
                          : "glass-panel text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                      >
                        <Clock className={`w-5 h-5 mx-auto mb-2 ${formData.duration === duration ? "text-primary-foreground" : ""}`} />
                        {duration}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label className="text-foreground">Your current level</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {levels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setFormData({ ...formData, level: level.id })}
                        className={`p-4 rounded-xl text-center transition-all duration-300 ${formData.level === level.id
                          ? "bg-primary text-primary-foreground"
                          : "glass-panel text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                      >
                        <Target className={`w-5 h-5 mx-auto mb-2 ${formData.level === level.id ? "text-primary-foreground" : ""}`} />
                        <span className="font-medium">{level.label}</span>
                        <p className={`text-xs mt-1 ${formData.level === level.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {level.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!formData.topic}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Custom Course
                </Button>
              </div>
            </div>
          )}

          {!isGenerating && isGenerated && (
            /* Success State */
            <div className={`glass-panel rounded-2xl p-8 lg:p-12 text-center transition-all duration-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}>
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Course Generated!</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Your personalized learning path for "{formData.topic}" has been created. Ready to start learning?
              </p>

              {/* Generated Course Preview */}
              <div className="glass-panel rounded-xl p-6 text-left mb-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Course Outline</h3>
                <div className="space-y-3">
                  {["Introduction & Fundamentals", "Core Concepts Deep Dive", "Hands-on Projects", "Advanced Topics", "Final Project & Review"].map((module, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
                        {i + 1}
                      </div>
                      <span className="text-foreground">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 transition-all duration-300 hover:scale-105">
                  Start Learning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsGenerated(false)}
                  className="border-border text-foreground hover:bg-muted px-8 bg-transparent"
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
