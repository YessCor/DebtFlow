"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { KPICard } from "@/components/dashboard/kpi-card"
import {
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  Eye,
  BarChart3,
  UserPlus,
  Activity,
} from "lucide-react"
import {
  getAllUsers,
  getAllLoans,
  getAllPayments,
  getAdminStats,
  type DbUser,
  type DbLoan,
  type DbPayment,
} from "@/lib/supabase-admin"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<DbUser[]>([])
  const [loans, setLoans] = useState<DbLoan[]>([])
  const [payments, setPayments] = useState<DbPayment[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPending: 0,
    totalPaid: 0,
    unreadNotifications: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, loansData, paymentsData, statsData] = await Promise.all([
          getAllUsers(),
          getAllLoans(),
          getAllPayments(),
          getAdminStats(),
        ])
        setUsers(usersData as DbUser[])
        setLoans(loansData as DbLoan[])
        setPayments(paymentsData as DbPayment[])
        setStats(statsData)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  const regularUsers = users.filter((u) => u.role === "user")
  const totalUsers = regularUsers.length
  const activeUsers = totalUsers

  const usersWithLoans = regularUsers.map((user) => {
    const userLoans = loans.filter((l) => l.owner_id === user.id)
    const totalOriginal = userLoans.reduce((sum, l) => sum + Number(l.principal_amount), 0)
    const totalPending = userLoans
      .filter((l) => l.status === "active")
      .reduce((sum, l) => sum + Number(l.principal_amount), 0)
    const activeLoansCount = userLoans.filter((l) => l.status === "active").length
    
    return {
      ...user,
      totalOriginal,
      totalPending,
      activeLoansCount,
      loanCount: userLoans.length,
    }
  }).sort((a, b) => b.totalPending - a.totalPending)

  const recentPayments = payments.slice(0, 5)

  const loanStatusData = [
    { name: "Activas", value: loans.filter(l => l.status === "active").length, color: "#1A56DB" },
    { name: "Cerradas", value: loans.filter(l => l.status === "closed").length, color: "#10B981" },
    { name: "Canceladas", value: loans.filter(l => l.status === "canceled").length, color: "#EF4444" },
  ]

  const monthlyPaymentsData = payments
    .filter(p => p.status === "paid")
    .reduce((acc: Record<string, number>, payment) => {
      const month = new Date(payment.paid_on).toLocaleString("es-ES", { month: "short" })
      acc[month] = (acc[month] || 0) + Number(payment.amount)
      return acc
    }, {})

  const monthlyTrendData = Object.entries(monthlyPaymentsData).map(([month, amount]) => ({
    month,
    amount,
  })).slice(-12)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">Resumen general de usuarios y sus finanzas</p>
        </div>
        <Link href="/admin/users">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Gestionar Usuarios
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Usuarios"
          value={totalUsers}
          subtitle={`${activeUsers} activos`}
          icon={Users}
        />
        <KPICard
          title="Total Recaudado"
          value={formatCurrency(stats.totalPaid)}
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Deuda Total Pendiente"
          value={formatCurrency(stats.totalPending)}
          subtitle="En todos los usuarios"
          icon={TrendingUp}
        />
        <KPICard
          title="Total Préstamos"
          value={stats.totalLoans}
          subtitle={`${stats.activeLoans} activos`}
          icon={AlertCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pagos por Mes
            </CardTitle>
            <CardDescription>Pagos recibidos de usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Pagos"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de pagos
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Préstamos</CardTitle>
            <CardDescription>Distribución global por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loans.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loanStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {loanStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay préstamos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Resumen Financiero por Usuario
              </CardTitle>
              <CardDescription>Haz clic en un usuario para ver sus estadísticas completas</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {usersWithLoans.length > 0 ? (
              <div className="space-y-4">
                {usersWithLoans.slice(0, 6).map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.display_name
                            ? user.display_name.split(" ").map((n) => n[0]).join("")
                            : user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {user.display_name || user.email.split("@")[0]}
                            </span>
                          </div>
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Préstamos ({user.loanCount})
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>
                              Total: <span className="font-medium">{formatCurrency(user.totalOriginal)}</span>
                            </span>
                            <span>
                              Pendiente: <span className="font-medium text-red-600">{formatCurrency(user.totalPending)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios con préstamos
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Total Usuarios</span>
                  <span className="font-medium">{totalUsers}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Total Préstamos</span>
                  <span className="font-medium">{loans.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Total Pagos</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pagos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length > 0 ? (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData.slice(-6)}>
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={(v) => `$${v / 1000}k`} className="text-xs" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        fill="url(#areaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No hay pagos registrados
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes de Usuarios</CardTitle>
          <CardDescription>Últimos pagos registrados por los usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Monto</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 text-sm text-muted-foreground">
                        {formatDate(payment.paid_on)}
                      </td>
                      <td className="py-3 text-sm font-medium text-green-600">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }
                        >
                          {payment.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay pagos registrados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}