"use client"

import { useEffect, useState } from "react"
import { 
  Brain, 
  FileText, 
  ListChecks, 
  Layers, 
  Zap, 
  CheckCircle,
  Sparkles,
  BookOpen,
  Target,
  Clock
} from "lucide-react"

interface AIGenerationLoaderProps {
  topic: string
  currentStep: number
  onComplete?: () => void
}

const generationSteps = [
  { 
    id: 0, 
    icon: Brain, 
    label: "Analyzing Topic", 
    description: "Understanding the subject matter and scope...",
    detail: "AI is researching comprehensive information"
  },
  { 
    id: 1, 
    icon: Target, 
    label: "Setting Learning Goals", 
    description: "Defining clear objectives for your journey...",
    detail: "Creating measurable learning outcomes"
  },
  { 
    id: 2, 
    icon: FileText, 
    label: "Creating Course Outline", 
    description: "Structuring the optimal learning path...",
    detail: "Organizing content into logical sections"
  },
  { 
    id: 3, 
    icon: ListChecks, 
    label: "Generating Modules", 
    description: "Building detailed lessons and exercises...",
    detail: "Creating interactive learning content"
  },
  { 
    id: 4, 
    icon: BookOpen, 
    label: "Adding Resources", 
    description: "Curating supplementary materials...",
    detail: "Finding relevant examples and references"
  },
  { 
    id: 5, 
    icon: Layers, 
    label: "Building Assessments", 
    description: "Creating quizzes and practice tests...",
    detail: "Designing knowledge checkpoints"
  },
  { 
    id: 6, 
    icon: Clock, 
    label: "Optimizing Schedule", 
    description: "Planning your learning timeline...",
    detail: "Balancing content with your availability"
  },
  { 
    id: 7, 
    icon: Zap, 
    label: "Finalizing Course", 
    description: "Polishing your personalized course...",
    detail: "Preparing everything for launch"
  },
]

export function AIGenerationLoader({ topic, currentStep }: AIGenerationLoaderProps) {
  const [dots, setDots] = useState("")
  const progress = ((currentStep + 1) / generationSteps.length) * 100

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass-panel rounded-2xl p-8 lg:p-12 animate-fade-in-up">
      {/* Header with Brain Animation */}
      <div className="text-center mb-10">
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-spin-slow" 
               style={{ animationDuration: '8s' }} />
          
          {/* Middle pulsing ring */}
          <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
          
          {/* Inner spinning ring */}
          <div className="absolute inset-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          
          {/* Center icon */}
          <div className="absolute inset-6 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary-foreground animate-pulse" />
          </div>

          {/* Orbiting particles */}
          <div className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 120}deg) translateX(60px)`,
                  animation: `orbit ${3 + i}s linear infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Generating Your Course{dots}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Creating a personalized learning path for <span className="text-primary font-semibold">"{topic}"</span>
        </p>
      </div>

      {/* Progress Steps - Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-3 mb-8 max-w-3xl mx-auto">
        {generationSteps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isPending = index > currentStep
          
          return (
            <div 
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                isActive 
                  ? "bg-primary/10 border-2 border-primary/40 scale-[1.02] shadow-lg shadow-primary/10" 
                  : isCompleted 
                    ? "bg-muted/50 opacity-70" 
                    : "bg-muted/30 opacity-40"
              }`}
            >
              <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : isCompleted 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`} />
                )}
                
                {/* Active indicator ring */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse-ring" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${
                  isActive 
                    ? "text-primary" 
                    : isCompleted 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs truncate ${
                  isActive 
                    ? "text-muted-foreground" 
                    : "text-muted-foreground/60"
                }`}>
                  {isActive ? step.description : step.detail}
                </p>
              </div>

              {/* Active step indicator */}
              {isActive && (
                <div className="flex gap-1 flex-shrink-0">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
        
        {/* Step counter */}
        <p className="text-center text-sm text-muted-foreground mt-3">
          Step {currentStep + 1} of {generationSteps.length}
        </p>
      </div>

      {/* Fun fact or tip */}
      <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-2xl mx-auto">
        <p className="text-sm text-center text-muted-foreground">
          <span className="text-primary font-medium">Did you know?</span> Our AI analyzes thousands of learning resources to create the perfect course for you.
        </p>
      </div>
    </div>
  )
}

export { generationSteps }
