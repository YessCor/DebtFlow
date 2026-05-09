"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { users, type User } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("debtflow_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("debtflow_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (foundUser) {
      const userWithoutPassword = { ...foundUser, password: "" }
      setUser(userWithoutPassword)
      localStorage.setItem("debtflow_user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      
      // Redirect based on role
      if (foundUser.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
      
      return { success: true }
    }

    setIsLoading(false)
    return { success: false, error: "Credenciales incorrectas. Por favor intenta de nuevo." }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("debtflow_user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
