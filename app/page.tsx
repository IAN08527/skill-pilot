"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronDown, Sparkles, BookOpen, Zap, Brain, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setIsVisible(true)
    setMounted(true)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToLearnMore = () => {
    const learnMoreSection = document.getElementById("learn-more")
    if (learnMoreSection) {
      learnMoreSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          style={{ 
            top: "10%", 
            left: "20%",
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full bg-primary/10 blur-3xl"
          style={{ 
            top: "60%", 
            right: "10%",
            transform: `translateY(${scrollY * -0.15}px)`
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full bg-primary/5 blur-3xl"
          style={{ 
            bottom: "20%", 
            left: "40%",
            transform: `translateY(${scrollY * 0.08}px)`
          }}
        />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? "bg-background/80 backdrop-blur-lg border-b border-border" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          }`}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Skill Pilot</span>
          </div>

          {/* Auth Buttons & Theme Toggle */}
          <div className={`flex items-center gap-4 transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          }`}>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-10 h-10 rounded-xl hover:bg-muted"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-primary" />
                ) : (
                  <Moon className="h-5 w-5 text-foreground" />
                )}
              </Button>
            )}
            <Link href="/login">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Learning Experience</span>
          </div>

          {/* Main Title */}
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <span className="text-foreground">Transform Your</span>
            <br />
            <span className="text-primary">
              Learning Journey
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            Discover courses, create custom learning paths, and track your progress 
            with our intelligent platform designed for the modern learner.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <Link href="/signup">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
              >
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg"
              variant="outline"
              onClick={scrollToLearnMore}
              className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToLearnMore}
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 cursor-pointer animate-bounce-subtle ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Why Choose <span className="text-primary">Skill Pilot</span>?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience a revolutionary approach to learning with our AI-driven platform
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="glass-panel rounded-2xl p-8 group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Explore Courses</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse through thousands of curated courses from top educators and institutions worldwide.
              </p>
            </div>

            {/* Card 2 */}
            <div className="glass-panel rounded-2xl p-8 group hover:scale-105 transition-all duration-300 md:translate-y-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Custom Learning Paths</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create personalized learning journeys tailored to your goals and schedule.
              </p>
            </div>

            {/* Card 3 */}
            <div className="glass-panel rounded-2xl p-8 group hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">AI-Powered Insights</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get intelligent recommendations and track your progress with advanced analytics.
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Link href="/signup">
              <Button 
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Your Journey Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>Skill Pilot - Transform your learning journey</p>
        </div>
      </footer>
    </div>
  )
}
