"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { KPICard } from "@/components/dashboard/kpi-card"
import { useAuth } from "@/lib/auth-context"
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Handshake,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react"
import {
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  getDebtsByUserId,
  getPaymentsByUserId,
  getIncomesByUserId,
  getLoansGivenByUserId,
} from "@/lib/mock-data"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Link from "next/link"

export default function UserDashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const userDebts = getDebtsByUserId(user.id)
  const userPayments = getPaymentsByUserId(user.id)
  const userIncomes = getIncomesByUserId(user.id)
  const userLoansGiven = getLoansGivenByUserId(user.id)

  const activeDebts = userDebts.filter((d) => d.status !== "paid").length
  const totalDebtPending = userDebts.reduce(
    (sum, d) => sum + (d.originalAmount - d.paidAmount),
    0
  )
  const totalIncome = userIncomes.reduce((sum, i) => sum + i.amount, 0)
  const totalLoansPending = userLoansGiven.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0)
  const netWorth = totalIncome - totalDebtPending + totalLoansPending

  const upcomingDebts = userDebts
    .filter((d) => d.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const nextDue = upcomingDebts[0]
  const daysUntilDue = nextDue
    ? Math.ceil(
        (new Date(nextDue.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  const statusCounts = userDebts.reduce(
    (acc, debt) => {
      acc[debt.status] = (acc[debt.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const userStatusData = [
    { name: "Pendiente", value: statusCounts.pending || 0, color: "#1A56DB" },
    { name: "Pagada", value: statusCounts.paid || 0, color: "#10B981" },
    { name: "Vencida", value: statusCounts.overdue || 0, color: "#EF4444" },
    { name: "En Negociación", value: statusCounts.negotiation || 0, color: "#F59E0B" },
  ].filter((d) => d.value > 0)

  const paymentsByMonth = userPayments.reduce(
    (acc, payment) => {
      const month = new Date(payment.date).toLocaleDateString("es-ES", { month: "short" })
      acc[month] = (acc[month] || 0) + payment.amount
      return acc
    },
    {} as Record<string, number>
  )

  const paymentHistoryData = Object.entries(paymentsByMonth).map(([month, amount]) => ({
    month,
    amount,
  }))

  const debtEvolutionData = [
    { month: "Actual", amount: totalDebtPending },
    { month: "Mes 1", amount: totalDebtPending * 0.92 },
    { month: "Mes 2", amount: totalDebtPending * 0.84 },
    { month: "Mes 3", amount: totalDebtPending * 0.75 },
    { month: "Mes 4", amount: totalDebtPending * 0.65 },
    { month: "Mes 5", amount: totalDebtPending * 0.54 },
    { month: "Mes 6", amount: totalDebtPending * 0.42 },
  ]

  const recentDebts = userDebts.slice(0, 3)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Bienvenido, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Resumen de tu situación financiera
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Patrimonio Neto"
          value={formatCurrency(netWorth)}
          icon={TrendingUp}
          variant={netWorth >= 0 ? "success" : "danger"}
        />
        <KPICard
          title="Ingresos Totales"
          value={formatCurrency(totalIncome)}
          icon={ArrowDownCircle}
          variant="success"
        />
        <KPICard
          title="Total Deudas"
          value={formatCurrency(totalDebtPending)}
          icon={ArrowUpCircle}
          variant="warning"
        />
        <KPICard
          title="Por Cobrar"
          value={formatCurrency(totalLoansPending)}
          icon={Handshake}
          variant="default"
        />
      </div>

      {nextDue && daysUntilDue <= 7 && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                Deuda próxima a vencer
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Tu deuda &quot;{nextDue.description}&quot; de{" "}
                {formatCurrency(nextDue.originalAmount - nextDue.paidAmount)} vence el{" "}
                {formatDate(nextDue.dueDate)}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deudas por Estado</CardTitle>
            <CardDescription>Distribución actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {userStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {userStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
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
                  No tienes deudas registradas
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {paymentHistoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                    <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay pagos registrados
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolución de Deuda</CardTitle>
            <CardDescription>Proyección de reducción</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={debtEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
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
                  <Bar dataKey="amount" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mis Deudas Recientes</CardTitle>
            <CardDescription>Acceso rápido a tus deudas</CardDescription>
          </div>
          <Link href="/dashboard/my-debts">
            <Button variant="outline" size="sm">
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDebts.map((debt) => {
              const progress = (debt.paidAmount / debt.originalAmount) * 100
              return (
                <div key={debt.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{debt.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCategoryLabel(debt.category)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(debt.status)}>
                      {getStatusLabel(debt.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso de pago</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pagado: {formatCurrency(debt.paidAmount)}
                      </span>
                      <span className="font-medium">
                        Pendiente: {formatCurrency(debt.originalAmount - debt.paidAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Vence: {formatDate(debt.dueDate)}
                    </span>
                    <Link href={`/dashboard/my-debts/${debt.id}`}>
                      <Button variant="ghost" size="sm">
                        Ver detalle
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
            {recentDebts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tienes deudas registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}