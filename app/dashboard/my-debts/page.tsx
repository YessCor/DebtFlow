"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Eye, CreditCard, ArrowUpDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getDebtsByUserId,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
  getCategoryLabel,
  type Debt,
} from "@/lib/mock-data"

export default function MyDebtsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<"dueDate" | "originalAmount">("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const userDebts = user ? getDebtsByUserId(user.id) : []

  const filteredDebts = useMemo(() => {
    let result = userDebts.filter((debt) => {
      const matchesSearch = debt.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || debt.status === statusFilter
      const matchesCategory = categoryFilter === "all" || debt.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })

    result = [...result].sort((a, b) => {
      if (sortField === "dueDate") {
        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }
      if (sortField === "originalAmount") {
        return sortDirection === "asc"
          ? a.originalAmount - b.originalAmount
          : b.originalAmount - a.originalAmount
      }
      return 0
    })

    return result
  }, [userDebts, searchQuery, statusFilter, categoryFilter, sortField, sortDirection])

  const handleSort = (field: "dueDate" | "originalAmount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Calculate totals
  const totalOriginal = userDebts.reduce((sum, d) => sum + d.originalAmount, 0)
  const totalPaid = userDebts.reduce((sum, d) => sum + d.paidAmount, 0)
  const totalPending = totalOriginal - totalPaid

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Mis Deudas
        </h1>
        <p className="text-muted-foreground">
          Administra y da seguimiento a tus deudas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Original</p>
            <p className="text-2xl font-bold">{formatCurrency(totalOriginal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pagado</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pendiente</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar deudas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="negotiation">En Negociación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="personal_loan">Préstamo Personal</SelectItem>
                <SelectItem value="mortgage">Hipoteca</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Debts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Deudas</CardTitle>
              <CardDescription>{filteredDebts.length} deudas encontradas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("dueDate")}
                className="text-muted-foreground"
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Vencimiento
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("originalAmount")}
                className="text-muted-foreground"
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Monto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDebts.length > 0 ? (
            <div className="space-y-4">
              {filteredDebts.map((debt) => {
                const progress = (debt.paidAmount / debt.originalAmount) * 100
                const pending = debt.originalAmount - debt.paidAmount
                const daysUntilDue = Math.ceil(
                  (new Date(debt.dueDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                const isUrgent = daysUntilDue <= 7 && debt.status !== "paid"

                return (
                  <div
                    key={debt.id}
                    className={`p-4 rounded-lg border bg-card transition-colors hover:bg-muted/30 ${
                      isUrgent ? "border-yellow-400 dark:border-yellow-600" : ""
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-lg">{debt.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {getCategoryLabel(debt.category)}
                            </p>
                          </div>
                          <Badge className={getStatusColor(debt.status)}>
                            {getStatusLabel(debt.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progreso de pago</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-2">
                            <span>
                              Pagado: <span className="font-medium text-green-600">{formatCurrency(debt.paidAmount)}</span>{" "}
                              de {formatCurrency(debt.originalAmount)}
                            </span>
                            <span>
                              Pendiente:{" "}
                              <span className="font-medium text-red-600">
                                {formatCurrency(pending)}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-[150px]">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Vencimiento</p>
                          <p className={`font-medium ${isUrgent ? "text-yellow-600" : ""}`}>
                            {formatDate(debt.dueDate)}
                          </p>
                          {isUrgent && debt.status !== "paid" && (
                            <p className="text-xs text-yellow-600">
                              {daysUntilDue < 0
                                ? "Vencida"
                                : `En ${daysUntilDue} días`}
                            </p>
                          )}
                        </div>
                        <Link href={`/dashboard/my-debts/${debt.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalle
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron deudas</p>
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all" ? (
                <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
