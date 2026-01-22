"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  BookOpen, 
  Plus, 
  LayoutDashboard, 
  User, 
  LogOut,
  Sparkles,
  Award,
  Mail,
  Calendar,
  Clock,
  Target,
  Trophy,
  Download,
  Eye,
  ChevronRight,
  Edit2,
  Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
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

export default function ProfilePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeNav, setActiveNav] = useState("profile")

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const navItems = [
    { id: "explore", icon: BookOpen, label: "Explore Courses", href: "/home/explore" },
    { id: "create", icon: Plus, label: "Create Course", href: "/home/create" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/home/dashboard" },
  ]

  const userStats = [
    { label: "Courses Completed", value: "8", icon: BookOpen },
    { label: "Hours Learned", value: "156", icon: Clock },
    { label: "Skills Earned", value: "24", icon: Target },
    { label: "Achievements", value: "12", icon: Trophy },
  ]

  const certificates = [
    {
      id: 1,
      title: "Machine Learning Fundamentals",
      issueDate: "January 15, 2026",
      credential: "ML-2026-001",
      progress: 100,
    },
    {
      id: 2,
      title: "Advanced React Development",
      issueDate: "December 20, 2025",
      credential: "REACT-2025-089",
      progress: 100,
    },
    {
      id: 3,
      title: "Python for Data Science",
      issueDate: "November 8, 2025",
      credential: "PY-DS-2025-042",
      progress: 100,
    },
  ]

  const inProgressCertificates = [
    {
      id: 4,
      title: "Deep Learning Specialization",
      progress: 65,
      remainingLessons: 12,
    },
    {
      id: 5,
      title: "Cloud Architecture Mastery",
      progress: 30,
      remainingLessons: 28,
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
            className="flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl bg-primary/10 border border-primary/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Profile</p>
              <p className="text-xs text-muted-foreground truncate">View & Edit</p>
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
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {/* Profile Card */}
          <div className={`glass-panel rounded-2xl p-6 lg:p-8 mb-8 transition-all duration-500 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-primary flex items-center justify-center">
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-primary-foreground" />
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">John Doe</h2>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      john.doe@example.com
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      Member since October 2025
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-2 bg-transparent">
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {userStats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="bg-muted rounded-xl p-4 group hover:bg-primary/10 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates Section */}
          <div className={`transition-all duration-500 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                My Certificates
              </h2>
            </div>

            {/* Earned Certificates */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Earned Certificates</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert, index) => (
                  <div 
                    key={cert.id}
                    className="glass-panel rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Certificate Icon */}
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Award className="w-7 h-7 text-primary" />
                    </div>

                    {/* Certificate Info */}
                    <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {cert.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">Issued: {cert.issueDate}</p>
                    <p className="text-xs text-muted-foreground mb-4">Credential ID: {cert.credential}</p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Certificate of Completion</DialogTitle>
                            <DialogDescription>
                              This certifies that John Doe has successfully completed the course.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 p-6 border-2 border-primary/30 rounded-xl bg-primary/5">
                            <div className="text-center">
                              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                              <h3 className="text-xl font-bold text-foreground mb-2">{cert.title}</h3>
                              <p className="text-muted-foreground mb-4">
                                Awarded to <span className="font-semibold text-foreground">John Doe</span>
                              </p>
                              <div className="text-sm text-muted-foreground">
                                <p>Issue Date: {cert.issueDate}</p>
                                <p>Credential ID: {cert.credential}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">In Progress</h3>
              <div className="space-y-4">
                {inProgressCertificates.map((cert, index) => (
                  <div 
                    key={cert.id}
                    className="glass-panel rounded-xl p-5 group hover:scale-[1.01] transition-all duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <Award className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {cert.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {cert.remainingLessons} lessons remaining
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">{cert.progress}%</span>
                      </div>
                    </div>
                    <Progress value={cert.progress} className="h-2" />
                    <div className="flex justify-end mt-3">
                      <Link href="/home/dashboard">
                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                          Continue Learning
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
