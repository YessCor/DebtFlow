"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { History, DollarSign, Calendar, Plus, CheckCircle, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

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

interface Loan {
  id: string
  title: string
  principal_amount: number
  status: string
}

interface Payment {
  id: string
  loan_id: string
  amount: number
  paid_on: string
  status: string
  method: string | null
}

export default function PaymentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMethod, setPaymentMethod] = useState("transfer")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        supabase
          .from("loans")
          .select("id, title, principal_amount, status")
          .eq("owner_id", user!.id)
          .eq("direction", "received")
          .eq("status", "active"),
        supabase
          .from("payments")
          .select("*")
          .eq("owner_id", user!.id)
          .order("paid_on", { ascending: false }),
      ])

      setLoans(loansRes.data || [])
      setPayments(paymentsRes.data || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const getLoanPayments = (loanId: string) => {
    return payments.filter(p => p.loan_id === loanId)
  }

  const getLoanTotalPaid = (loanId: string) => {
    return getLoanPayments(loanId).reduce((sum, p) => sum + Number(p.amount), 0)
  }

  const getLoanPending = (loan: Loan) => {
    const paid = getLoanTotalPaid(loan.id)
    return Number(loan.principal_amount) - paid
  }

  const filteredLoans = loans.filter(loan => {
    if (!searchQuery) return true
    return loan.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const totalPaidAll = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const handleAddPayment = async () => {
    if (!selectedLoan || !paymentAmount || !paymentDate) {
      toast.error("Por favor completa todos los campos")
      return
    }

    setIsSubmitting(true)
    try {
      const loan = loans.find(l => l.id === selectedLoan)
      if (!loan) throw new Error("Préstamo no encontrado")

      await supabase.from("payments").insert({
        owner_id: user!.id,
        loan_id: selectedLoan,
        amount: parseFloat(paymentAmount),
        paid_on: paymentDate,
        status: "paid",
        method: paymentMethod,
      })

      const totalPaid = getLoanTotalPaid(selectedLoan) + parseFloat(paymentAmount)
      const pending = Number(loan.principal_amount) - totalPaid

      if (pending <= 0) {
        await supabase
          .from("loans")
          .update({ status: "closed", updated_at: new Date().toISOString() })
          .eq("id", selectedLoan)

        toast.success("¡Deuda pagada completamente!")
      } else {
        toast.success("Pago registrado")
      }

      setIsAddDialogOpen(false)
      setSelectedLoan("")
      setPaymentAmount("")
      setPaymentDate(new Date().toISOString().split("T")[0])
      fetchData()
    } catch (err) {
      console.error("Error adding payment:", err)
      toast.error("Error al registrar el pago")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-7 w-7 text-primary" />
            Historial de Pagos
          </h1>
          <p className="text-muted-foreground">
            Consulta todos los pagos que has realizado
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
              <DialogDescription>
                Registra un pago para reducir el saldo de tu deuda
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Seleccionar Deuda</Label>
                <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una deuda" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map((loan) => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.title} - Pendiente: {formatCurrency(getLoanPending(loan))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monto del Pago</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPayment} disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Registrar Pago"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-200 dark:border-green-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaidAll)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{payments.length}</p>
                <p className="text-sm text-muted-foreground">Pagos realizados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por deuda..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLoans.map((loan) => {
          const loanPayments = getLoanPayments(loan.id)
          const totalPaid = getLoanTotalPaid(loan.id)
          const pending = getLoanPending(loan)
          const progress = Number(loan.principal_amount) > 0 
            ? (totalPaid / Number(loan.principal_amount)) * 100 
            : 0

          return (
            <Card key={loan.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{loan.title}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Activa
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Monto total: {formatCurrency(Number(loan.principal_amount))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Pagado: {formatCurrency(totalPaid)}</span>
                  <span className="text-red-600">Pendiente: {formatCurrency(pending)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {progress.toFixed(1)}% completado
                </p>

                {loanPayments.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-2">Pagos ({loanPayments.length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {loanPayments.map((payment) => (
                        <div key={payment.id} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                          <span className="text-muted-foreground">
                            {formatDate(payment.paid_on)}
                          </span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(Number(payment.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pending > 0 && (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      setSelectedLoan(loan.id)
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Pago
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}

        {filteredLoans.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay deudas activas</p>
          </div>
        )}
      </div>
    </div>
  )
}