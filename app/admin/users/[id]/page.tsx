"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Mail,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import {
  getUserById,
  getLoansByUserId,
  getPaymentsByLoanId,
  getAllPayments,
  type DbUser,
  type DbLoan,
  type DbPayment,
} from "@/lib/supabase-admin"
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

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<DbUser & { role: string } | null>(null)
  const [loans, setLoans] = useState<DbLoan[]>([])
  const [payments, setPayments] = useState<DbPayment[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserById(id)
        const loansData = await getLoansByUserId(id)
        const paymentsData = await getAllPayments()
        
        const userPayments = paymentsData.filter((p: DbPayment) => 
          loansData.some((l: DbLoan) => l.id === p.loan_id)
        )
        
        setUser(userData as DbUser & { role: string })
        setLoans(loansData as DbLoan[])
        setPayments(userPayments as DbPayment[])
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Error al cargar los datos del usuario")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  const totalOriginal = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0)
  const totalPending = loans
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + Number(l.principal_amount), 0)
  const activeLoans = loans.filter(l => l.status === "active").length
  const closedLoans = loans.filter(l => l.status === "closed").length
  const paymentProgress = totalOriginal > 0 ? ((totalOriginal - totalPending) / totalOriginal) * 100 : 0

  const paymentsThisMonth = payments.filter(p => {
    const paymentDate = new Date(p.paid_on)
    const now = new Date()
    return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear()
  }).reduce((sum, p) => sum + Number(p.amount), 0)

  const categoryData = loans.reduce((acc: Record<string, number>, loan) => {
    const key = loan.direction === "given" ? "Préstamos dados" : "Préstamos recibidos"
    acc[key] = (acc[key] || 0) + Number(loan.principal_amount)
    return acc
  }, {})
  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))

  const statusData = [
    { name: "Activos", value: activeLoans, color: "#3B82F6" },
    { name: "Cerrados", value: closedLoans, color: "#10B981" },
  ]

  const monthlyPaymentsData = payments
    .filter(p => p.status === "paid")
    .reduce((acc: Record<string, number>, payment) => {
      const month = new Date(payment.paid_on).toLocaleString("es-ES", { month: "short" })
      acc[month] = (acc[month] || 0) + Number(payment.amount)
      return acc
    }, {})
  const paymentTrend = Object.entries(monthlyPaymentsData).map(([month, amount]) => ({ month, amount })).slice(-6)

  return (
    <div className="p-4 lg:p-6 space-y-6">
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
          <p className="text-muted-foreground">
            {user.display_name || user.email.split("@")[0]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:row-span-2">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.display_name
                    ? user.display_name.split(" ").map((n) => n[0]).join("")
                    : user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">
                {user.display_name || "Sin nombre"}
              </h2>
              <Badge
                variant="secondary"
                className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {user.role === "admin" ? "Admin" : "Usuario"}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Miembro desde {formatDate(user.created_at)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t space-y-4">
              <h3 className="font-medium text-sm">Progreso General de Pago</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completado</span>
                  <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Pagado</p>
                  <p className="font-semibold text-green-600">{formatCurrency(totalOriginal - totalPending)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pendiente</p>
                  <p className="font-semibold text-red-600">{formatCurrency(totalPending)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Préstamos Activos</p>
                <p className="text-2xl font-bold">{activeLoans}</p>
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
                <p className="text-sm text-muted-foreground">Préstamos Cerrados</p>
                <p className="text-2xl font-bold text-green-600">{closedLoans}</p>
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
                <p className="text-sm text-muted-foreground">Monto Total</p>
                <p className="text-xl font-bold">{formatCurrency(totalOriginal)}</p>
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
                <p className="text-xl font-bold">{formatCurrency(paymentsThisMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia de Pagos</CardTitle>
            <CardDescription>Pagos realizados en los últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {paymentTrend.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay pagos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Préstamos por Tipo</CardTitle>
            <CardDescription>Distribución del monto total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} className="text-xs" />
                    <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "Monto"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay préstamos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Préstamos</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {loans.length > 0 ? (
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
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No hay préstamos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Préstamos del Usuario</CardTitle>
            <CardDescription>{loans.length} préstamos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {loans.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{loan.title || "Préstamo"}</p>
                        <p className="text-xs text-muted-foreground">
                          {loan.direction === "given" ? "Préstamo dado" : "Préstamo recibido"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          loan.status === "active"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        }
                      >
                        {loan.status === "active" ? "Activo" : "Cerrado"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Monto: {formatCurrency(Number(loan.principal_amount))}</span>
                      </div>
                      {loan.due_on && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Vence: {formatDate(loan.due_on)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Este usuario no tiene préstamos registrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de Pagos Recientes</CardTitle>
          <CardDescription>{payments.length} pagos en total</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Monto</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 10).map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{formatDate(payment.paid_on)}</td>
                      <td className="py-3 text-sm font-medium text-green-600">{formatCurrency(Number(payment.amount))}</td>
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
              Este usuario no ha realizado pagos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}