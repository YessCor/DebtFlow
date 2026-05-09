"use client"

import { useMemo } from "react"
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
  debts,
  activities,
  users,
  payments,
  monthlyTrendData,
  statusDistribution,
  monthlyPayments,
  formatCurrency,
  formatDate,
  getRelativeTime,
  getUserById,
} from "@/lib/mock-data"
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

export default function AdminDashboardPage() {
  // Calculate user statistics
  const userStats = useMemo(() => {
    const regularUsers = users.filter((u) => u.role === "user")
    const activeUsers = regularUsers.filter((u) => u.status === "active").length
    const totalUsers = regularUsers.length
    
    const usersWithDebts = regularUsers.map((user) => {
      const userDebts = debts.filter((d) => d.userId === user.id)
      const totalOriginal = userDebts.reduce((sum, d) => sum + d.originalAmount, 0)
      const totalPaid = userDebts.reduce((sum, d) => sum + d.paidAmount, 0)
      const totalPending = totalOriginal - totalPaid
      const overdueDebts = userDebts.filter((d) => d.status === "overdue").length
      const activeDebts = userDebts.filter((d) => d.status !== "paid").length
      const paymentProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0
      
      return {
        ...user,
        totalOriginal,
        totalPaid,
        totalPending,
        overdueDebts,
        activeDebts,
        paymentProgress,
        debtCount: userDebts.length,
      }
    }).sort((a, b) => b.totalPending - a.totalPending)

    const totalPendingAll = usersWithDebts.reduce((sum, u) => sum + u.totalPending, 0)
    const totalPaidAll = usersWithDebts.reduce((sum, u) => sum + u.totalPaid, 0)
    const usersWithOverdue = usersWithDebts.filter((u) => u.overdueDebts > 0).length
    
    return {
      totalUsers,
      activeUsers,
      usersWithDebts,
      totalPendingAll,
      totalPaidAll,
      usersWithOverdue,
    }
  }, [])

  const recentPayments = payments.slice(0, 5)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Title */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Usuarios"
          value={userStats.totalUsers}
          subtitle={`${userStats.activeUsers} activos`}
          icon={Users}
        />
        <KPICard
          title="Total Recaudado"
          value={formatCurrency(userStats.totalPaidAll)}
          trend={{ value: 12.5, label: "vs mes anterior" }}
          icon={DollarSign}
          variant="success"
        />
        <KPICard
          title="Deuda Total Pendiente"
          value={formatCurrency(userStats.totalPendingAll)}
          subtitle="En todos los usuarios"
          icon={TrendingUp}
        />
        <KPICard
          title="Usuarios con Deudas Vencidas"
          value={userStats.usersWithOverdue}
          subtitle="Requieren seguimiento"
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendencia de Recaudación
            </CardTitle>
            <CardDescription>Pagos recibidos de usuarios - Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    name="Deudas Registradas"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    name="Pagos Recibidos"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Deudas en el Sistema</CardTitle>
            <CardDescription>Distribución global por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value}%`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Financial Overview */}
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
            <div className="space-y-4">
              {userStats.usersWithDebts.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <Badge
                            variant="secondary"
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                            }
                          >
                            {user.status === "active" ? "Activo" : "Inactivo"}
                          </Badge>
                          {user.overdueDebts > 0 && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                              {user.overdueDebts} vencida{user.overdueDebts > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Estadísticas
                          </Button>
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progreso de pago ({user.debtCount} deuda{user.debtCount !== 1 ? "s" : ""})
                          </span>
                          <span className="font-medium">{user.paymentProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={user.paymentProgress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span>
                            Pagado: <span className="font-medium text-green-600">{formatCurrency(user.totalPaid)}</span>
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
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => {
                  const user = getUserById(activity.userId)
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">
                          {user?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Payments Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pagos Recientes
              </CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPayments}>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Recientes de Usuarios</CardTitle>
          <CardDescription>Últimos pagos registrados por los usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Método</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Monto</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="pb-3 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => {
                  const user = getUserById(payment.userId)
                  return (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {user?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user?.name || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {formatDate(payment.date)}
                      </td>
                      <td className="py-3 text-sm capitalize">
                        {payment.method === "transfer" ? "Transferencia" : 
                         payment.method === "cash" ? "Efectivo" :
                         payment.method === "card" ? "Tarjeta" : "Cheque"}
                      </td>
                      <td className="py-3 text-sm font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            payment.status === "confirmed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }
                        >
                          {payment.status === "confirmed" ? "Confirmado" : "Pendiente"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Link href={`/admin/users/${payment.userId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Usuario
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
