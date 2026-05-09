"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import {
  getUserById,
  getDebtsByUserId,
  getPaymentsByUserId,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  type Debt,
} from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"]

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = getUserById(id)
  const userDebts = user ? getDebtsByUserId(user.id) : []
  const userPayments = user ? getPaymentsByUserId(user.id) : []

  // Calculate financial statistics
  const stats = useMemo(() => {
    if (!user) return null

    const totalOriginal = userDebts.reduce((sum, d) => sum + d.originalAmount, 0)
    const totalPaid = userDebts.reduce((sum, d) => sum + d.paidAmount, 0)
    const totalPending = totalOriginal - totalPaid
    const activeDebts = userDebts.filter((d) => d.status !== "paid").length
    const overdueDebts = userDebts.filter((d) => d.status === "overdue").length
    const paidDebts = userDebts.filter((d) => d.status === "paid").length
    const avgInterest = userDebts.length > 0 
      ? userDebts.reduce((sum, d) => sum + d.interestRate, 0) / userDebts.length 
      : 0
    const paymentProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0
    const paymentsThisMonth = userPayments.filter(p => {
      const paymentDate = new Date(p.date)
      const now = new Date()
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
    }).reduce((sum, p) => sum + p.amount, 0)

    return {
      totalOriginal,
      totalPaid,
      totalPending,
      activeDebts,
      overdueDebts,
      paidDebts,
      avgInterest,
      paymentProgress,
      paymentsThisMonth,
    }
  }, [user, userDebts, userPayments])

  // Debt by category chart data
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}
    userDebts.forEach(debt => {
      const label = getCategoryLabel(debt.category)
      categories[label] = (categories[label] || 0) + (debt.originalAmount - debt.paidAmount)
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }, [userDebts])

  // Status distribution data
  const statusData = useMemo(() => {
    const statuses: Record<string, number> = {}
    userDebts.forEach(debt => {
      const label = getStatusLabel(debt.status)
      statuses[label] = (statuses[label] || 0) + 1
    })
    return Object.entries(statuses).map(([name, value]) => ({ name, value }))
  }, [userDebts])

  // Monthly payment trend (last 6 months)
  const paymentTrend = useMemo(() => {
    const months: Record<string, number> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
      months[key] = 0
    }
    userPayments.forEach(payment => {
      const d = new Date(payment.date)
      const key = d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" })
      if (months[key] !== undefined) {
        months[key] += payment.amount
      }
    })
    return Object.entries(months).map(([month, amount]) => ({ month, amount }))
  }, [userPayments])

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Usuario no encontrado</p>
            <Link href="/admin/users">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a usuarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Estadísticas Financieras
          </h1>
          <p className="text-muted-foreground">Análisis financiero detallado de {user.name}</p>
        </div>
        <Button variant="outline">
          <Pencil className="mr-2 h-4 w-4" />
          Editar Usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Profile Card */}
        <Card className="lg:row-span-2">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <Badge
                variant="secondary"
                className={
                  user.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mt-2"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 mt-2"
                }
              >
                {user.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Miembro desde {formatDate(user.createdAt)}</span>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="font-medium text-sm">Progreso General de Pago</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completado</span>
                  <span className="font-medium">{stats?.paymentProgress.toFixed(1)}%</span>
                </div>
                <Progress value={stats?.paymentProgress || 0} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Pagado</p>
                  <p className="font-semibold text-green-600">{formatCurrency(stats?.totalPaid || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pendiente</p>
                  <p className="font-semibold text-red-600">{formatCurrency(stats?.totalPending || 0)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deudas Activas</p>
                <p className="text-2xl font-bold">{stats?.activeDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deudas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{stats?.overdueDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deudas Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{stats?.paidDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deuda Total Original</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.totalOriginal || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30">
                <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos Este Mes</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.paymentsThisMonth || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interés Promedio</p>
                <p className="text-xl font-bold">{stats?.avgInterest.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Pagos</CardTitle>
            <CardDescription>Pagos realizados en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Monto"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Debt by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deuda por Categoría</CardTitle>
            <CardDescription>Distribución del saldo pendiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Pendiente"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay deudas registradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution and Debts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Deudas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay deudas registradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Debts List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Deudas del Usuario</CardTitle>
            <CardDescription>{userDebts.length} deudas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {userDebts.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {userDebts.map((debt) => {
                  const progress = (debt.paidAmount / debt.originalAmount) * 100
                  const pending = debt.originalAmount - debt.paidAmount
                  return (
                    <div
                      key={debt.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{debt.description}</p>
                          <p className="text-xs text-muted-foreground">{getCategoryLabel(debt.category)}</p>
                        </div>
                        <Badge className={`${getStatusColor(debt.status)} shrink-0`}>
                          {getStatusLabel(debt.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
                          <span>Pendiente: {formatCurrency(pending)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Este usuario no tiene deudas registradas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de Pagos Recientes</CardTitle>
          <CardDescription>{userPayments.length} pagos en total</CardDescription>
        </CardHeader>
        <CardContent>
          {userPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID Deuda</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Método</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Monto</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{formatDate(payment.date)}</td>
                      <td className="py-3 text-sm font-mono">#{payment.debtId}</td>
                      <td className="py-3 text-sm capitalize">
                        {payment.method === "transfer" ? "Transferencia" : 
                         payment.method === "cash" ? "Efectivo" :
                         payment.method === "card" ? "Tarjeta" : "Cheque"}
                      </td>
                      <td className="py-3 text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Este usuario no ha realizado pagos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
