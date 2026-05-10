"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KPICard } from "@/components/dashboard/kpi-card"
import { useAuth } from "@/lib/auth-context"
import { getLoansByUserId, getIncomesByUserId, type DbLoan, type DbPayment, type DbIncome } from "@/lib/supabase-admin"
import { supabase } from "@/lib/supabase-client"
import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Handshake,
  DollarSign,
} from "lucide-react"
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const COLORS = ["#1A56DB", "#10B981", "#EF4444", "#F59E0B"]

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: "Activa",
    closed: "Cerrada",
    canceled: "Cancelada"
  }
  return labels[status] || status
}

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<DbLoan[]>([])
  const [incomes, setIncomes] = useState<DbIncome[]>([])
  const [payments, setPayments] = useState<DbPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [loansData, incomesData] = await Promise.all([
        getLoansByUserId(user.id),
        getIncomesByUserId(user.id)
      ])
      setLoans(loansData)
      setIncomes(incomesData)
      
      const loanIds = loansData.map(l => l.id)
      if (loanIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*")
          .in("loan_id", loanIds)
          .order("paid_on", { ascending: false })
        if (paymentsData) setPayments(paymentsData)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const debts = loans.filter(l => l.direction === "received")
  const loansGiven = loans.filter(l => l.direction === "given")

  const totalDebtPending = debts
    .filter(d => d.status === "active")
    .reduce((sum, d) => sum + Number(d.principal_amount), 0)
  
  const totalDebtPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  
  const totalLoansPending = loansGiven
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + Number(l.principal_amount), 0)

  const netWorth = totalIncome - totalDebtPending + totalLoansPending

  const activeDebts = debts.filter(d => d.status === "active").length

  const upcomingDebts = debts
    .filter(d => d.status === "active" && d.due_on)
    .sort((a, b) => new Date(a.due_on!).getTime() - new Date(b.due_on!).getTime())
  const nextDue = upcomingDebts[0]
  const daysUntilDue = nextDue
    ? Math.ceil(
        (new Date(nextDue.due_on!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0

  const statusCounts = debts.reduce(
    (acc, debt) => {
      acc[debt.status] = (acc[debt.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const debtStatusData = [
    { name: "Activas", value: statusCounts.active || 0, color: "#1A56DB" },
    { name: "Cerradas", value: statusCounts.closed || 0, color: "#10B981" },
    { name: "Canceladas", value: statusCounts.canceled || 0, color: "#EF4444" },
  ].filter(d => d.value > 0)

  const paymentsByMonth = payments.reduce(
    (acc, payment) => {
      const date = new Date(payment.paid_on)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + Number(payment.amount)
      return acc
    },
    {} as Record<string, number>
  )

  const sortedMonths = Object.keys(paymentsByMonth).sort().slice(-6)
  const paymentHistoryData = sortedMonths.map(monthKey => {
    const [year, monthNum] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return {
      month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      amount: paymentsByMonth[monthKey]
    }
  })

  const totalPaidSoFar = Object.values(paymentsByMonth).reduce((sum, v) => sum + v, 0)
  const monthsWithPayments = Object.keys(paymentsByMonth).length
  const avgMonthlyPayment = monthsWithPayments > 0 ? totalPaidSoFar / monthsWithPayments : 0
  
  let runningBalance = totalDebtPending
  const debtEvolutionData = []
  
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const paidThisMonth = paymentsByMonth[monthKey] || 0
    runningBalance = Math.max(0, runningBalance - paidThisMonth)
    debtEvolutionData.push({
      month: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      amount: runningBalance
    })
  }
  
  if (avgMonthlyPayment > 0 && runningBalance > 0) {
    let projectedBalance = runningBalance
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      projectedBalance = Math.max(0, projectedBalance - avgMonthlyPayment)
      debtEvolutionData.push({
        month: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        amount: projectedBalance,
        projected: true
      })
    }
  }

  const recentDebts = debts.slice(0, 3)

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
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="Total Deudas"
          value={formatCurrency(totalDebtPending)}
          icon={AlertTriangle}
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
                Tu deuda &quot;{nextDue.title || nextDue.description}&quot; de{" "}
                {formatCurrency(Number(nextDue.principal_amount) - totalDebtPaid)} vence el{" "}
                {formatDate(nextDue.due_on!)}.
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
              {debtStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={debtStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {debtStatusData.map((entry, index) => (
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
            {debtStatusData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {debtStatusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            )}
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
            <CardDescription>Datos reales y proyección basada en pagos promedio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {debtEvolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={debtEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `$${v / 1000}k`} className="text-xs" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'amount' ? (debtEvolutionData.find(d => d.amount === value)?.projected ? 'Proyectado' : 'Real') : name
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {debtEvolutionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.projected ? "#9CA3AF" : "#1A56DB"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos de deuda
                </div>
              )}
            </div>
            {avgMonthlyPayment > 0 && (
              <div className="mt-3 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1A56DB]"></div>
                  <span>Datos reales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Proyectado (pago promedio: {formatCurrency(avgMonthlyPayment)}/mes)</span>
                </div>
              </div>
            )}
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
              const debtPayments = payments.filter(p => p.loan_id === debt.id)
              const paidAmount = debtPayments.reduce((sum, p) => sum + Number(p.amount), 0)
              const remaining = Number(debt.principal_amount) - paidAmount
              const progress = debt.principal_amount > 0 ? (paidAmount / Number(debt.principal_amount)) * 100 : 0
              
              return (
                <div key={debt.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{debt.title || debt.description || "Deuda"}</p>
                      <p className="text-sm text-muted-foreground">
                        {debt.people?.name || "Sin beneficiario"}
                      </p>
                    </div>
                    <Badge variant={debt.status === "active" ? "destructive" : "secondary"}>
                      {getStatusLabel(debt.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso de pago</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Pagado: {formatCurrency(paidAmount)}
                      </span>
                      <span className="font-medium">
                        Pendiente: {formatCurrency(remaining > 0 ? remaining : 0)}
                      </span>
                    </div>
                  </div>
                  {debt.due_on && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Vence: {formatDate(debt.due_on)}
                      </span>
                      <Link href={`/dashboard/my-debts/${debt.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalle
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
            {recentDebts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tienes deudas registradas</p>
                <Link href="/dashboard/new-debt">
                  <Button className="mt-4">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Agregar Deuda
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}