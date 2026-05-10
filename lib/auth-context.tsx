"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { type User } from "./mock-data"
import { loginWithEmailPassword, registerNormalUser } from "@/lib/auth-supabase"
import { supabase } from "@/lib/supabase-client"

const DEBTFLOW_STORAGE_KEY = "debtflow_user"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (input: { name: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>
}




const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = () => {
      const storedUser = localStorage.getItem(DEBTFLOW_STORAGE_KEY)
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
        } catch (e) {
          localStorage.removeItem(DEBTFLOW_STORAGE_KEY)
        }
      }
      setIsLoading(false)
    }

    init()
  }, [])

  const register = async (input: { name: string; email: string; password: string }) => {
    setIsLoading(true)
    const res = await registerNormalUser(input)
    setIsLoading(false)
    if (res.success) {
      router.push("/login")
    }
    return res
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    const result = await loginWithEmailPassword(email, password)

    if (!result.success) {
      setIsLoading(false)
      return { success: false as const, error: result.error }
    }

    const appUserRow = result.data

    if (!appUserRow) {
      setIsLoading(false)
      return { success: false as const, error: "Usuario no encontrado en app_users." }
    }

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", appUserRow.id)
      .limit(1)
      .maybeSingle()

    const role = (rolesData?.role ?? "user") as "admin" | "user"

    const userWithoutPassword: User = {
      id: appUserRow.id,
      name: appUserRow.display_name || appUserRow.email.split("@")[0],
      email: appUserRow.email,
      password: "",
      role,
      avatar: "/placeholder-user.jpg",
      status: "active",
      createdAt: new Date(appUserRow.created_at).toISOString().slice(0, 10),
    }

    setUser(userWithoutPassword)
    localStorage.setItem(DEBTFLOW_STORAGE_KEY, JSON.stringify(userWithoutPassword))
    setIsLoading(false)

    router.push(role === "admin" ? "/admin/dashboard" : "/dashboard")
    return { success: true as const }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem(DEBTFLOW_STORAGE_KEY)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}


export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

