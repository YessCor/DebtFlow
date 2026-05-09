"use client"

import { useState, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Percent,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Send,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getDebtById,
  getPaymentsByDebtId,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
} from "@/lib/mock-data"
import { toast } from "sonner"

export default function MyDebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const debt = getDebtById(id)
  const payments = debt ? getPaymentsByDebtId(debt.id) : []

  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [adjustmentReason, setAdjustmentReason] = useState("")

  // Check if user owns this debt
  if (!debt || (user && debt.userId !== user.id)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Deuda no encontrada</p>
            <Link href="/dashboard/my-debts">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a mis deudas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pending = debt.originalAmount - debt.paidAmount
  const progress = (debt.paidAmount / debt.originalAmount) * 100
  const interestAmount = (debt.originalAmount * debt.interestRate) / 100
  const daysUntilDue = Math.ceil(
    (new Date(debt.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const isOverdue = daysUntilDue < 0
  const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0

  // Generate payment schedule
  const monthlyPayment = pending / 6
  const paymentSchedule = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() + i + 1)
    return {
      number: i + 1,
      date: date.toISOString().split("T")[0],
      amount: monthlyPayment,
      status: i < 2 ? "pending" : "scheduled",
    }
  })

  const handleRequestAdjustment = () => {
    toast.success("Solicitud de ajuste enviada al administrador")
    setIsAdjustDialogOpen(false)
    setAdjustmentReason("")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/my-debts">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{debt.description}</h1>
              <Badge className={getStatusColor(debt.status)}>
                {getStatusLabel(debt.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{getCategoryLabel(debt.category)}</p>
          </div>
        </div>
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Solicitar Ajuste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Ajuste</DialogTitle>
              <DialogDescription>
                Envía una solicitud al administrador para ajustar los términos de esta deuda
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>Motivo de la solicitud *</FieldLabel>
                <Textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Explica por qué necesitas un ajuste en los términos de pago..."
                  rows={4}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRequestAdjustment}>Enviar Solicitud</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert if overdue or urgent */}
      {(isOverdue || isUrgent) && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            isOverdue
              ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
          }`}
        >
          <AlertTriangle
            className={`h-5 w-5 mt-0.5 ${
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          />
          <div>
            <p
              className={`font-medium ${
                isOverdue
                  ? "text-red-800 dark:text-red-300"
                  : "text-yellow-800 dark:text-yellow-300"
              }`}
            >
              {isOverdue ? "Deuda Vencida" : "Deuda Próxima a Vencer"}
            </p>
            <p
              className={`text-sm ${
                isOverdue
                  ? "text-red-700 dark:text-red-400"
                  : "text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {isOverdue
                ? `Esta deuda venció hace ${Math.abs(daysUntilDue)} días. Por favor realiza el pago lo antes posible para evitar cargos adicionales.`
                : `Esta deuda vence en ${daysUntilDue} días. Recuerda realizar el pago a tiempo.`}
            </p>
          </div>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monto Original</p>
                <p className="text-xl font-bold">{formatCurrency(debt.originalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagado</p>
                <p className="text-xl font-bold">{formatCurrency(debt.paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-xl font-bold">{formatCurrency(pending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Percent className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intereses</p>
                <p className="text-xl font-bold">{debt.interestRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso de pago</span>
              <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
              <span>Restante: {formatCurrency(pending)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Cronograma de Pagos
            </CardTitle>
            <CardDescription>Plan de pagos sugerido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Cuota
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSchedule.map((payment) => (
                    <tr key={payment.number} className="border-b last:border-0">
                      <td className="py-3 text-sm">#{payment.number}</td>
                      <td className="py-3 text-sm">{formatDate(payment.date)}</td>
                      <td className="py-3 text-sm font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }
                        >
                          {payment.status === "pending" ? "Próximo" : "Programado"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
            <CardDescription>Pagos realizados para esta deuda</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.date)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      Confirmado
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay pagos registrados para esta deuda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debt Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Deuda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-medium">{getCategoryLabel(debt.category)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Interés</p>
              <p className="font-medium">{debt.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
              <p className="font-medium">{formatDate(debt.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
              <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                {formatDate(debt.dueDate)}
              </p>
            </div>
          </div>
          {debt.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-1">Notas</p>
              <p className="text-sm">{debt.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
