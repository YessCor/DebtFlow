"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency, formatDate, getLoanGivenStatusLabel, getLoanGivenStatusColor } from "@/lib/mock-data"
import { useEffect, useMemo, useState } from "react"
import { getLoansByUserId } from "@/lib/supabase-admin"
import { Plus, Handshake, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoansGivenPage() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getLoansByUserId(user.id)
      .then((res) => setLoans(res as any[]))
      .catch(() => setLoans([]))
      .finally(() => setLoading(false))
  }, [user])

  const userLoans = useMemo(() => loans.filter((l) => l.direction === "given"), [loans])

  // En esta vista la tabla 'loans' no expone paidAmount/totalAmount.
  // Calculamos total con principal_amount e interest_rate y dejamos paidAmount=0.
  const withComputed = useMemo(() => {

    return userLoans.map((loan) => {
      const principal = Number(loan.principal_amount ?? 0)
      const interestRate = Number(loan.interest_rate ?? 0)
      const total = principal * (1 + interestRate / 100)
      const paidAmount = 0

      return {
        ...loan,
        principalAmount: principal,
        totalAmount: total,
        paidAmount,
        borrowerName: loan.people?.name || (loan as any).counterparty_name || (loan as any).borrowerName || "(sin nombre)",
        borrowerContact: null,
        startDate: (loan as any).started_on || (loan as any).startDate || null,
        dueDate: (loan as any).due_on || (loan as any).dueDate || null,
        status: ((loan.status as any) === "closed" ? "paid" : loan.status) as any,
        payments: [],
      }
    })
  }, [userLoans])

  const displayLoans = withComputed

  const totalPrincipal = displayLoans.reduce((sum, l) => sum + l.principalAmount, 0)
  const totalInterest = displayLoans.reduce((sum, l) => sum + (l.totalAmount - l.principalAmount), 0)
  const totalCollected = displayLoans.reduce((sum, l) => sum + l.paidAmount, 0)
  const totalPending = displayLoans.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0)

  const activeLoans = userLoans.filter((l) => l.status === "active")

  const overdueLoans = userLoans.filter((l) => l.status === "overdue")
  const paidLoans = userLoans.filter((l) => l.status === "closed")




  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Handshake className="h-7 w-7 text-violet-500" />
            Préstamos Dados
          </h1>
          <p className="text-muted-foreground">
            Controla los préstamos que has realizado a otras personas
          </p>
        </div>
        <Link href="/dashboard/new-loan-given">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Préstamo
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Prestado</CardDescription>
            <CardTitle className="text-2xl text-violet-600 dark:text-violet-400">
              {formatCurrency(totalPrincipal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {userLoans.length} préstamos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Intereses Ganados</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalInterest)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total acumulado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cobrado</CardDescription>
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
              {formatCurrency(totalCollected)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalCollected > 0 ? `${((totalCollected / totalPrincipal) * 100).toFixed(1)}% del total` : "Sin cobrar aún"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendiente por Cobrar</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {activeLoans.length} préstamos activos
            </p>
          </CardContent>
        </Card>
      </div>

      {overdueLoans.length > 0 && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">
                Préstamos Vencidos
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">
                Tienes {overdueLoans.length} préstamo(s) vencido(s) por un total de{" "}
                {formatCurrency(overdueLoans.reduce((s, l) => s + (l.totalAmount - l.paidAmount), 0))}.
                Contacta a los deudores para regularizar.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos los Préstamos</CardTitle>
          <CardDescription>Registro completo de préstamos dados a terceros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(loading ? [] : displayLoans).map((loan) => {

              const progress = (loan.paidAmount / loan.totalAmount) * 100
              return (
                <div key={loan.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{loan.borrowerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {loan.interestRate}% de interés • Inicio: {formatDate(loan.startDate)}
                      </p>
                      {loan.borrowerContact && (
                        <p className="text-sm text-muted-foreground">
                          Contacto: {loan.borrowerContact}
                        </p>
                      )}
                    </div>
                    <Badge className={getLoanGivenStatusColor(loan.status)}>
                      {getLoanGivenStatusLabel(loan.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progreso de cobro</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Prestado: {formatCurrency(loan.principalAmount)}
                      </span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(loan.totalAmount - loan.principalAmount)} intereses
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Cobrado: {formatCurrency(loan.paidAmount)}
                      </span>
                      <span className="font-medium">
                        Pendiente: {formatCurrency(loan.totalAmount - loan.paidAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Vence: {formatDate(loan.dueDate)}
                    </span>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/loans-given/${loan.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver detalle
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
            {!loading && displayLoans.length === 0 && (

              <div className="text-center py-8 text-muted-foreground">
                No tienes préstamos registrados
                <Link href="/dashboard/new-loan-given" className="block mt-2">
                  <Button variant="link">Registrar tu primer préstamo</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}