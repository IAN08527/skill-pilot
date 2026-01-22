"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsVisible(false), 200)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className="loading-overlay bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Orbital Animation Container */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          
          {/* Orbiting Dots */}
          <div className="absolute inset-0">
            <div className="absolute w-3 h-3 rounded-full bg-primary animate-orbit" style={{ top: '50%', left: '50%', marginTop: '-6px', marginLeft: '-6px' }} />
          </div>
          <div className="absolute inset-0">
            <div className="absolute w-2 h-2 rounded-full bg-primary/60 animate-orbit-reverse" style={{ top: '50%', left: '50%', marginTop: '-4px', marginLeft: '-4px' }} />
          </div>

          {/* Center Logo */}
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center animate-scale-pulse">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/30 animate-pulse-ring" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Skill Pilot</h1>
          <p className="text-sm text-muted-foreground mt-1">Preparing your experience...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-200 ease-out progress-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Loading Dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
