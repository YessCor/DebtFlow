"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "./app-sidebar"
import { AppHeader } from "./app-header"
import { Skeleton } from "@/components/ui/skeleton"

interface AppShellProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
}

export function AppShell({ children, requiredRole }: AppShellProps) {
  const { user, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const hasCheckedAuth = useRef(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isLoading) return
    
    if (!user) {
      router.push("/login")
      return
    }

    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    if (requiredRole === "admin" && user.role !== "admin") {
      router.push("/dashboard")
    } else if (requiredRole === "user" && user.role === "admin") {
      router.push("/admin/dashboard")
    }
  }, [isLoading, user, requiredRole, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:flex lg:w-[280px] border-r">
          <div className="w-full p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-2 pt-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-16 border-b px-4 flex items-center">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}