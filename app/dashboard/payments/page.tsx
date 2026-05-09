"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { History, Search, DollarSign, Calendar, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  getPaymentsByUserId,
  getDebtById,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
} from "@/lib/mock-data"

export default function PaymentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<string>("2024")

  const userPayments = user ? getPaymentsByUserId(user.id) : []

  const filteredPayments = useMemo(() => {
    return userPayments.filter((payment) => {
      const debt = getDebtById(payment.debtId)
      const matchesSearch =
        debt?.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.debtId.includes(searchQuery)

      const paymentDate = new Date(payment.date)
      const matchesMonth =
        selectedMonth === "all" ||
        paymentDate.getMonth() === parseInt(selectedMonth)
      const matchesYear =
        paymentDate.getFullYear() === parseInt(selectedYear)

      return matchesSearch && matchesMonth && matchesYear
    })
  }, [userPayments, searchQuery, selectedMonth, selectedYear])

  // Calculate totals
  const totalPaidInPeriod = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaymentsCount = filteredPayments.length

  // Get unique years from payments
  const years = [...new Set(userPayments.map((p) => new Date(p.date).getFullYear()))].sort(
    (a, b) => b - a
  )

  const months = [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <History className="h-7 w-7 text-primary" />
          Historial de Pagos
        </h1>
        <p className="text-muted-foreground">
          Consulta todos los pagos que has realizado
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-200 dark:border-green-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pagado en el Período</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaidInPeriod)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalPaymentsCount}</p>
                <p className="text-sm text-muted-foreground">Pagos realizados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por deuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full lg:w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.length > 0 ? (
                  years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="2024">2024</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Realizados</CardTitle>
          <CardDescription>{filteredPayments.length} pagos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Deuda Asociada
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Monto
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Método
                    </th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const debt = getDebtById(payment.debtId)
                    return (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(payment.date)}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="text-sm font-medium">
                              {debt?.description || `Deuda #${payment.debtId}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: #{payment.debtId}
                            </p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm">
                            {getPaymentMethodLabel(payment.method)}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge
                            variant="secondary"
                            className={
                              payment.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {payment.status === "confirmed" ? "Confirmado" : "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron pagos</p>
              {searchQuery || selectedMonth !== "all" ? (
                <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
              ) : (
                <p className="text-sm mt-1">Aún no has realizado pagos</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
