"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@teispace/next-themes"
import { Button } from "@/components/ui/button"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu, Bell, Moon, Sun, User, Settings, LogOut, Check } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

interface AppHeaderProps {
  onMenuClick?: () => void
}

const breadcrumbLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  debts: "Deudas",
  users: "Usuarios",
  reports: "Reportes",
  settings: "Configuración",
  "my-debts": "Mis Deudas",
  payments: "Pagos",
  notifications: "Notificaciones",
  profile: "Perfil",
}

interface Notification {
  id: string
  title: string
  body: string | null
  kind: string
  is_read: boolean
  created_at: string
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    
    setLoadingNotifications(true)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (!error && data) {
        setNotifications(data as Notification[])
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId)

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("owner_id", user!.id)
        .eq("is_read", false)

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      )
      toast.success("Todas las notificaciones marcadas como leídas")
    } catch (err) {
      console.error("Error marking all as read:", err)
    }
  }

  if (!user) return null

  const pathSegments = pathname.split("/").filter(Boolean)
  const isAdmin = user.role === "admin"
  
  const unreadCount = notifications.filter((n) => !n.is_read).length

  const profileLink = isAdmin ? "/admin/settings" : "/dashboard/profile"
  const settingsLink = isAdmin ? "/admin/settings" : "/dashboard/profile"
  const notificationsLink = isAdmin ? "/admin/notifications" : "/dashboard/notifications"

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />
      case "dark":
        return <Moon className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </Button>

      <Breadcrumb className="hidden md:flex items-center">
        <BreadcrumbList className="flex items-center gap-1">
          <BreadcrumbItem className="flex items-center">
            <BreadcrumbLink 
              asChild 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                {isAdmin ? "Admin" : "Inicio"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathSegments.slice(1).map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 2).join("/")
            const isLast = index === pathSegments.length - 2
            const label = breadcrumbLabels[segment] || segment

            return (
              <BreadcrumbItem key={segment} className="flex items-center gap-1">
                <BreadcrumbSeparator className="text-muted-foreground">/</BreadcrumbSeparator>
                {isLast ? (
                  <BreadcrumbPage className="text-sm font-medium text-foreground">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    asChild 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>



      <div className="flex items-center gap-2 ml-auto lg:ml-4">
        <DropdownMenu open={showThemeMenu} onOpenChange={setShowThemeMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              {getThemeIcon()}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Tema</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setTheme("light"); setShowThemeMenu(false) }}>
              <Sun className="mr-2 h-4 w-4" />
              Claro
              {theme === "light" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setTheme("dark"); setShowThemeMenu(false) }}>
              <Moon className="mr-2 h-4 w-4" />
              Oscuro
              {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

        {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1"
                  onClick={markAllAsRead}
                >
                  Marcar todo leído
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loadingNotifications ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Cargando...
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${notification.is_read ? "text-muted-foreground" : ""}`}>
                      {notification.title}
                    </span>
                  </div>
                  {notification.body && (
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No hay notificaciones
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={notificationsLink} className="text-center text-sm">
                Ver todas las notificaciones
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileLink} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Ver Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={settingsLink} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}