"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Eye, ArrowUpDown, Trash2, DollarSign, Calendar, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getLoansByUserId, deleteLoan, type DbLoan } from "@/lib/supabase-admin"
import { toast } from "sonner"

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

export default function MyDebtsPage() {
  const { user } = useAuth()
  const [loans, setLoans] = useState<DbLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (user) {
      fetchLoans()
    }
  }, [user])

  const fetchLoans = async () => {
    if (!user) return
    try {
      const data = await getLoansByUserId(user.id)
      setLoans(data.filter(l => l.direction === "received"))
    } catch (err) {
      console.error("Error fetching loans:", err)
      toast.error("Error al cargar las deudas")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLoan(id)
      setLoans((prev) => prev.filter((l) => l.id !== id))
      toast.success("Deuda eliminada")
    } catch (err) {
      console.error("Error deleting loan:", err)
      toast.error("Error al eliminar la deuda")
    }
  }

  if (!user) return null

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = (loan.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalDebt = loans.reduce((sum, l) => sum + Number(l.principal_amount), 0)
  const activeDebts = loans.filter(l => l.status === "active").length
  const closedDebts = loans.filter(l => l.status === "closed").length

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
            <DollarSign className="h-7 w-7 text-red-500" />
            Mis Deudas
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus deudas y préstamos
          </p>
        </div>
        <Link href="/dashboard/new-debt">
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Agregar Deuda
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deudas</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {formatCurrency(totalDebt)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {loans.length} deudas registradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deudas Activas</CardDescription>
            <CardTitle className="text-2xl text-orange-600 dark:text-orange-400">
              {activeDebts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Por pagar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Deudas Pagadas</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {closedDebts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Completadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Deudas</CardTitle>
          <CardDescription>
            Tus préstamos y deudas registrados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar deudas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-3 py-2 rounded-md border bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="closed">Cerradas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>

          {filteredLoans.length > 0 ? (
            <div className="space-y-3">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      loan.status === "active" ? "bg-red-500/10" : "bg-green-500/10"
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        loan.status === "active" ? "text-red-500" : "text-green-500"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{loan.title || "Deuda"}</p>
                      {loan.description && (
                        <p className="text-sm text-muted-foreground">{loan.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(loan.due_on)}
                        </span>
                        {loan.interest_rate > 0 && (
                          <span>{loan.interest_rate}% interés</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatCurrency(Number(loan.principal_amount))}
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        loan.status === "active"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }
                    >
                      {loan.status === "active" ? "Activa" : "Cerrada"}
                    </Badge>
                    <Link href={`/dashboard/my-debts/${loan.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(loan.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay deudas registradas</p>
              <Link href="/dashboard/new-debt">
                <Button variant="outline" className="mt-4">
                  Agregar tu primera deuda
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}