"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  FileText,
  Settings,
  Bell,
  User,
  History,
  LogOut,
  TrendingUp,
  DollarSign,
  Handshake,
  X,
  ChevronRight,
  Wallet,
} from "lucide-react"
import { useState } from "react"

interface AppSidebarProps {
  open: boolean
  onClose: () => void
}

interface MenuItem {
  href?: string
  label: string
  icon: React.ElementType
  children?: MenuItem[]
  badge?: string
}

const adminMenuItems: MenuItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/reports", label: "Reportes", icon: FileText },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

const userMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { label: "Ingresos", icon: DollarSign, children: [
    { href: "/dashboard/my-incomes", label: "Ver Todos", icon: DollarSign },
    { href: "/dashboard/new-income", label: "Registrar", icon: TrendingUp },
  ]},
  { label: "Deudas", icon: CreditCard, children: [
    { href: "/dashboard/my-debts", label: "Ver Todas", icon: CreditCard },
    { href: "/dashboard/new-debt", label: "Registrar", icon: TrendingUp },
  ]},
  { label: "Préstamos", icon: Handshake, children: [
    { href: "/dashboard/loans-given", label: "Ver Todos", icon: Handshake },
    { href: "/dashboard/new-loan-given", label: "Registrar", icon: TrendingUp },
  ]},
  { href: "/dashboard/payments", label: "Pagos", icon: History },
  { href: "/dashboard/notifications", label: "Notificaciones", icon: Bell, badge: "3" },
  { href: "/dashboard/profile", label: "Mi Perfil", icon: User },
]

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const isActive = (href?: string) => href && pathname === href

  const isChildActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => child.href && pathname === child.href)
    }
    return false
  }

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const menuItems = user?.role === "admin" ? adminMenuItems : userMenuItems
  const isAdmin = user?.role === "admin"
  const initials = user?.name.split(" ").map((n: string) => n[0]).join("").toUpperCase() || ""

  if (!user) return null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col bg-sidebar border-r border-sidebar-border",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-sidebar-foreground">FinanzasPro</h1>
              <p className="text-[10px] text-sidebar-foreground/50">Gestor Financiero</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4 text-sidebar-foreground/60" />
          </Button>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9px] px-1.5 py-0.5",
                  isAdmin
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-emerald-500/20 text-emerald-400"
                )}
              >
                {isAdmin ? "Admin" : "Usuario"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <nav className="space-y-0.5">
            {menuItems.map(item => {
              const Icon = item.icon
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expandedItems.includes(item.label)
              const active = isActive(item.href)
              const childActive = isChildActive(item)

              if (hasChildren) {
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpanded(item.label)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium text-sidebar-foreground/80",
                        childActive && "bg-sidebar-accent text-sidebar-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", childActive ? "text-primary" : "text-sidebar-foreground/60")} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-1 py-0.5 text-[9px] bg-primary/20 text-primary rounded">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l border-sidebar-border space-y-0.5 mt-0.5">
                        {item.children?.map(child => {
                          const ChildIcon = child.icon
                          const isChildActive = isActive(child.href)
                          return (
                            <Link key={child.label} href={child.href!} onClick={onClose}>
                              <button className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs",
                                isChildActive ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                              )}>
                                <ChildIcon className={cn("h-3.5 w-3.5", isChildActive && "text-primary")} />
                                <span>{child.label}</span>
                              </button>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link key={item.label} href={item.href!} onClick={onClose}>
                  <button className={cn(
                    "w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium",
                    active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}>
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-sidebar-foreground/60")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-1 py-0.5 text-[9px] bg-primary/20 text-primary rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start gap-2 px-2 py-2 h-auto text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground rounded-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  )
}