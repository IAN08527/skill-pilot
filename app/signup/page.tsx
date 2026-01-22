"use client"

import React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Compass,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  Sparkles,
  BookOpen,
  Target
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isVisible, setIsVisible] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const validateStep1 = () => {
    let isValid = true
    const newErrors = { fullName: "", email: "", password: "" }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required"
      isValid = false
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const validateStep2 = () => {
    let isValid = true
    const newErrors = { ...errors, password: "" }

    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return
    if (!agreedToTerms) return

    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
      },
    })

    if (error) {
      setErrors(prev => ({ ...prev, email: error.message }))
      setIsLoading(false)
      return
    }

    // Create initial profile and stats records if user was successfully created
    if (data.user) {
      await Promise.all([
        supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: formData.fullName,
          username: formData.email.split('@')[0],
        }),
        supabase.from("user_stats").upsert({
          user_id: data.user.id,
          courses_enrolled: 0,
          courses_completed: 0,
          hours_learned: 0,
          skills_gained: 0,
          achievements: 0,
          progress_rate: 0
        })
      ])
    }

    setIsLoading(false)
    router.push("/home")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const passwordStrength = () => {
    const password = formData.password
    if (password.length === 0) return { level: 0, text: "", color: "" }
    if (password.length < 6) return { level: 1, text: "Weak", color: "bg-red-500" }
    if (password.length < 8) return { level: 2, text: "Fair", color: "bg-yellow-500" }
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, text: "Strong", color: "bg-[#C6E693]" }
    }
    return { level: 3, text: "Good", color: "bg-blue-500" }
  }

  const features = [
    { icon: BookOpen, text: "Access 10,000+ courses" },
    { icon: Target, text: "Personalized learning paths" },
    { icon: Sparkles, text: "AI-powered recommendations" },
  ]

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white flex overflow-hidden">
      {/* Left Panel - Features */}
      <div className={`hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"
        }`}>
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#C6E693]/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-[#C6E693]/10 blur-3xl" />
        <div className="absolute bottom-40 right-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C6E693] to-[#9ED66B] flex items-center justify-center">
              <Compass className="w-7 h-7 text-[#0A0F1E]" />
            </div>
            <span className="text-2xl font-bold text-white">Skill Pilot</span>
          </Link>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight text-balance">
            Start your journey to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C6E693] to-[#9ED66B]">
              mastery
            </span>
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Join thousands of learners who are transforming their careers with personalized, AI-driven education.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-xl glass-panel transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-[#C6E693]/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-[#C6E693]" />
                </div>
                <span className="text-white/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/40 text-sm">
          Trusted by 50,000+ learners worldwide
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"
        }`}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C6E693] to-[#9ED66B] flex items-center justify-center">
                <Compass className="w-7 h-7 text-[#0A0F1E]" />
              </div>
              <span className="text-2xl font-bold text-white">Skill Pilot</span>
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 1 ? "bg-[#C6E693] text-[#0A0F1E]" : "bg-white/10 text-white/40"
              }`}>
              {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
            </div>
            <div className={`w-16 h-1 rounded-full transition-all duration-300 ${currentStep > 1 ? "bg-[#C6E693]" : "bg-white/10"
              }`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= 2 ? "bg-[#C6E693] text-[#0A0F1E]" : "bg-white/10 text-white/40"
              }`}>
              2
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {currentStep === 1 ? "Create your account" : "Secure your account"}
            </h2>
            <p className="text-white/60">
              {currentStep === 1
                ? "Enter your details to get started"
                : "Create a strong password"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {currentStep === 1 ? (
              <>
                {/* Full Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#C6E693] focus:ring-[#C6E693]/20 h-14 pl-12 transition-all duration-300 ${errors.fullName ? "border-red-500" : ""
                        }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-400 text-sm">{errors.fullName}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#C6E693] focus:ring-[#C6E693]/20 h-14 pl-12 transition-all duration-300 ${errors.email ? "border-red-500" : ""
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Continue Button */}
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-[#C6E693] text-[#0A0F1E] hover:bg-[#b8dc80] h-14 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#C6E693]/20 group"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </>
            ) : (
              <>
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#C6E693] focus:ring-[#C6E693]/20 h-14 pl-12 pr-12 transition-all duration-300 ${errors.password ? "border-red-500" : ""
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 mt-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength().level
                              ? passwordStrength().color
                              : "bg-white/10"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-white/60">
                        Password strength: <span className={`${passwordStrength().level >= 3 ? "text-[#C6E693]" : "text-white/80"}`}>{passwordStrength().text}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5 border-white/30 data-[state=checked]:bg-[#C6E693] data-[state=checked]:border-[#C6E693]"
                  />
                  <Label htmlFor="terms" className="text-sm text-white/60 cursor-pointer leading-relaxed">
                    I agree to the{" "}
                    <span className="text-[#C6E693] hover:underline cursor-pointer">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-[#C6E693] hover:underline cursor-pointer">Privacy Policy</span>
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 h-14 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !agreedToTerms}
                    className="flex-[2] bg-[#C6E693] text-[#0A0F1E] hover:bg-[#b8dc80] h-14 text-lg font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-[#C6E693]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Social Sign Up */}
            {currentStep === 1 && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#0A0F1E] text-white/40">or sign up with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 h-14 rounded-xl glass-panel hover:border-[#C6E693]/30 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-white/60 group-hover:text-white transition-colors">Google</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 h-14 rounded-xl glass-panel hover:border-[#C6E693]/30 transition-all duration-300 group"
                  >
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="text-white/60 group-hover:text-white transition-colors">GitHub</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-white/60 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C6E693] hover:underline transition-all font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
