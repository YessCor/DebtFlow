"use client"

import { useEffect, useMemo, useState, use } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, DollarSign, Calendar, Percent, Handshake, ArrowRight } from "lucide-react"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const statusLabel = (status: string) => {
  if (status === "active") return "Activa"
  if (status === "closed") return "Cerrada"
  if (status === "canceled") return "Cancelada"
  return status
}

export default function LoanGivenDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()

  const [loan, setLoan] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])

  useEffect(() => {
    if (!user || !id) return

    const fetchData = async () => {
      try {
        setLoading(true)

        const { data: loanData, error: loanError } = await supabase
          .from("loans")
          .select(`
            *,
            people:counterparty_id(name),
            counterparty:counterparty_id(email, phone)
          `)
          .eq("id", id)
          .eq("owner_id", user.id)
          .single()

        if (loanError) throw loanError
        if (!loanData) {
          setLoan(null)
          return
        }

        setLoan(loanData)

        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("id, amount, paid_on, status")
          .eq("owner_id", user.id)
          .eq("loan_id", id)
          .order("paid_on", { ascending: false })

        if (paymentsError) throw paymentsError
        setPayments(paymentsData || [])
      } catch (err: any) {
        console.error(err)
        toast.error(err?.message || "Error al cargar el préstamo")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, id])

  const computed = useMemo(() => {
    if (!loan) return null

    const principal = Number(loan.principal_amount ?? 0)
    const interestRate = Number(loan.interest_rate ?? 0)
    const totalAmount = principal * (1 + interestRate / 100)

    const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0)
    const pending = totalAmount - paidAmount

    const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

    return { principal, interestRate, totalAmount, paidAmount, pending, progress }
  }, [loan, payments])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!loan || !computed) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">Préstamo no encontrado</p>
            <Link href="/dashboard/loans-given">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Préstamos Dados
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/loans-given">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Handshake className="h-7 w-7 text-violet-500" />
            {loan.title || "Detalle de Préstamo"}
          </h1>
          <p className="text-muted-foreground">Información y estado de cobro del préstamo</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/payments">
            <Button variant="outline">
              <ArrowRight className="mr-2 h-4 w-4" />
              Ver pagos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información</CardTitle>
            <CardDescription>Datos del préstamo y beneficiario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Deudor</p>
                <p className="font-medium">{loan.people?.name || "(sin nombre)"}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant="secondary" className="mt-1">
                    {statusLabel(loan.status)}
                  </Badge>
                </div>
                <DollarSign className="h-5 w-5 text-violet-500" />
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Monto prestado
                </p>
                <p className="font-medium">{formatCurrency(computed.principal)}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" /> Interés
                </p>
                <p className="font-medium">{computed.interestRate}%</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Inicio
                </p>
                <p className="font-medium">{formatDate(loan.started_on)}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Vencimiento
                </p>
                <p className="font-medium">{formatDate(loan.due_on)}</p>
              </div>
            </div>

            {loan.description && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{loan.description}</p>
              </div>
            )}

            {loan.notes && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="font-medium">{loan.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso de cobro</CardTitle>
            <CardDescription>Total a recibir y saldo pendiente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600">{formatCurrency(computed.totalAmount)}</p>
              <p className="text-sm text-muted-foreground">Monto total (principal + interés)</p>
            </div>
            <Progress value={computed.progress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Cobrado: {formatCurrency(computed.paidAmount)}</span>
              <span className="text-red-600">Pendiente: {formatCurrency(computed.pending)}</span>
            </div>
            <p className="text-center text-sm text-muted-foreground">{computed.progress.toFixed(1)}% completado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
          <CardDescription>{payments.length} pagos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(p.paid_on)}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(Number(p.amount ?? 0))}
                      </p>
                      {p.method && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Método: {p.method}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        p.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {p.status === "paid" ? "Pagado" : p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No hay pagos registrados</div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

