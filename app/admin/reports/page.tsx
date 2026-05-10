"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react"
import { getAdminStats, getAllLoans, getAllPayments, getAllUsers } from "@/lib/supabase-admin"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { toast } from "sonner"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#EC4899"]

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("month")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalPending: 0,
    totalPaid: 0,
    unreadNotifications: 0,
  })
  const [loans, setLoans] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsData, loansData, paymentsData, usersData] = await Promise.all([
        getAdminStats(),
        getAllLoans(),
        getAllPayments(),
        getAllUsers(),
      ])
      setStats(statsData)
      setLoans(loansData)
      setPayments(paymentsData)
      setUsers(usersData)
    } catch (err) {
      console.error("Error fetching report data:", err)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  const totalCollected = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0)
  
  const totalPending = loans
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + Number(l.principal_amount), 0)
  
  const collectionRate = totalPending + totalCollected > 0 
    ? (totalCollected / (totalPending + totalCollected)) * 100 
    : 0

  const activeLoans = loans.filter(l => l.status === "active").length
  const closedLoans = loans.filter(l => l.status === "closed").length

  const directionData = [
    { name: "Préstamos Dados", value: loans.filter(l => l.direction === "given").length },
    { name: "Préstamos Recibidos", value: loans.filter(l => l.direction === "received").length },
  ]

  const statusData = [
    { name: "Activos", value: activeLoans, color: "#3B82F6" },
    { name: "Cerrados", value: closedLoans, color: "#10B981" },
    { name: "Cancelados", value: loans.filter(l => l.status === "canceled").length, color: "#EF4444" },
  ]

  const monthlyPaymentsData = payments
    .filter(p => p.status === "paid")
    .reduce((acc: Record<string, number>, payment) => {
      const month = new Date(payment.paid_on).toLocaleString("es-ES", { month: "short", year: "numeric" })
      acc[month] = (acc[month] || 0) + Number(payment.amount)
      return acc
    }, {})

  const paymentsTrend = Object.entries(monthlyPaymentsData)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)

  const userRoleData = [
    { name: "Administradores", value: users.filter(u => u.role === "admin").length },
    { name: "Usuarios", value: users.filter(u => u.role === "user").length },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">Análisis completo del sistema</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recaudado</p>
                <p className="text-xl font-bold">{formatCurrency(totalCollected)}</p>
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
                <p className="text-sm text-muted-foreground">Pendiente por Cobrar</p>
                <p className="text-xl font-bold">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Cobro</p>
                <p className="text-xl font-bold">{collectionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendencia de Pagos
            </CardTitle>
            <CardDescription>Monto recibido por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {paymentsTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentsTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Monto"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
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
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Estado de Préstamos
            </CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loans.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
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
                    <Legend />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Distribución de Usuarios
            </CardTitle>
            <CardDescription>Por tipo de rol</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {users.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay usuarios registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Préstamos por Dirección
            </CardTitle>
            <CardDescription>Dados vs Recibidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loans.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={directionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      formatter={(value: number) => [`${value} préstamos`, "Cantidad"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Total Préstamos</h4>
              <p className="text-2xl font-bold">{loans.length}</p>
              <p className="text-sm text-muted-foreground">
                {activeLoans} activos, {closedLoans} cerrados
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Total Pagos</h4>
              <p className="text-2xl font-bold">{payments.length}</p>
              <p className="text-sm text-muted-foreground">
                {payments.filter(p => p.status === "paid").length} completados
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Monto Promedio</h4>
              <p className="text-2xl font-bold">
                {formatCurrency(loans.length > 0 ? totalPending / activeLoans : 0)}
              </p>
              <p className="text-sm text-muted-foreground">por préstamo activo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}