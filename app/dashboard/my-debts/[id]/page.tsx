"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, DollarSign, Calendar, Percent, CheckCircle, Trash2, Edit, Save, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

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

interface LoanDetail {
  id: string
  owner_id: string
  title: string
  description: string | null
  principal_amount: number
  interest_rate: number
  due_on: string | null
  status: string
  notes: string | null
  created_at: string
}

export default function MyDebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    principal_amount: "",
    interest_rate: "",
    due_on: "",
    notes: "",
    status: "active",
  })

  useEffect(() => {
    if (user && id) {
      fetchLoanDetails()
    }
  }, [user, id])

  const fetchLoanDetails = async () => {
    try {
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user!.id)
        .single()

      if (loanError) throw loanError

      if (!loanData) {
        setLoading(false)
        return
      }

      setLoan(loanData)
      setEditData({
        title: loanData.title || "",
        description: loanData.description || "",
        principal_amount: String(loanData.principal_amount),
        interest_rate: String(loanData.interest_rate),
        due_on: loanData.due_on || "",
        notes: loanData.notes || "",
        status: loanData.status,
      })

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("loan_id", id)
        .order("paid_on", { ascending: false })

      setPayments(paymentsData || [])
    } catch (err) {
      console.error("Error fetching loan:", err)
      toast.error("Error al cargar la deuda")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      const { error } = await supabase
        .from("loans")
        .update({
          title: editData.title,
          description: editData.description || null,
          principal_amount: parseFloat(editData.principal_amount),
          interest_rate: parseFloat(editData.interest_rate) || 0,
          due_on: editData.due_on || null,
          notes: editData.notes || null,
          status: editData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      setLoan((prev) => prev ? { ...prev, ...editData, principal_amount: parseFloat(editData.principal_amount) } : null)
      setIsEditing(false)
      toast.success("Deuda actualizada")
    } catch (err) {
      console.error("Error updating loan:", err)
      toast.error("Error al actualizar")
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta deuda?")) return

    try {
      const { error } = await supabase
        .from("loans")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Deuda eliminada")
      window.location.href = "/dashboard/my-debts"
    } catch (err) {
      console.error("Error deleting loan:", err)
      toast.error("Error al eliminar")
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

  if (!loan) {
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

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const pending = Number(loan.principal_amount) - totalPaid
  const progress = Number(loan.principal_amount) > 0 
    ? (totalPaid / Number(loan.principal_amount)) * 100 
    : 0

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-debts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-red-500" />
            {loan.title || "Detalle de Deuda"}
          </h1>
          <p className="text-muted-foreground">
            Información y pagos de tu deuda
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Información de la Deuda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto</Label>
                    <Input
                      type="number"
                      value={editData.principal_amount}
                      onChange={(e) => setEditData({ ...editData, principal_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Interés (%)</Label>
                    <Input
                      type="number"
                      value={editData.interest_rate}
                      onChange={(e) => setEditData({ ...editData, interest_rate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Vencimiento</Label>
                    <Input
                      type="date"
                      value={editData.due_on}
                      onChange={(e) => setEditData({ ...editData, due_on: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <select
                      className="w-full px-3 py-2 rounded-md border bg-background"
                      value={editData.status}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    >
                      <option value="active">Activa</option>
                      <option value="closed">Cerrada</option>
                      <option value="canceled">Cancelada</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notas</Label>
                  <Input
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="font-medium">{loan.description || "Sin descripción"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Tasa de Interés</p>
                  <p className="font-medium">{loan.interest_rate}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{formatDate(loan.due_on)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    variant="secondary"
                    className={
                      loan.status === "active"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }
                  >
                    {loan.status === "active" ? "Activa" : "Cerrada"}
                  </Badge>
                </div>
                {loan.notes && (
                  <div className="sm:col-span-2 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Notas</p>
                    <p className="font-medium">{loan.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Pagos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(Number(loan.principal_amount))}
                </p>
                <p className="text-sm text-muted-foreground">Monto Total</p>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Pagado: {formatCurrency(totalPaid)}</span>
                <span className="text-red-600">Pendiente: {formatCurrency(pending)}</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {progress.toFixed(1)}% completado
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>
            {payments.length} pagos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.paid_on)}
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }
                    >
                      {payment.status === "paid" ? "Pagado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay pagos registrados
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}