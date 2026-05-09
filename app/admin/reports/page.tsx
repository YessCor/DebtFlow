"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react"
import {
  debts,
  payments,
  formatCurrency,
  categoryDistribution,
  adminKPIs,
} from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("month")

  // Calculate report data
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)
  const projectedCollection = adminKPIs.totalPendingAmount * 0.85
  const collectionRate = (totalCollected / (totalCollected + adminKPIs.totalPendingAmount)) * 100
  const newDebts = debts.filter((d) => {
    const startDate = new Date(d.startDate)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return startDate > monthAgo
  }).length
  const avgOverdueDays = 15

  // Category performance data
  const categoryPerformance = [
    {
      category: "Tarjeta de Crédito",
      totalDebts: 12,
      totalAmount: 85000,
      collected: 45000,
      pending: 40000,
      collectionRate: 53,
    },
    {
      category: "Préstamo Personal",
      totalDebts: 15,
      totalAmount: 65000,
      collected: 35000,
      pending: 30000,
      collectionRate: 54,
    },
    {
      category: "Hipoteca",
      totalDebts: 8,
      totalAmount: 120000,
      collected: 60000,
      pending: 60000,
      collectionRate: 50,
    },
    {
      category: "Auto",
      totalDebts: 7,
      totalAmount: 45000,
      collected: 38000,
      pending: 7000,
      collectionRate: 84,
    },
    {
      category: "Otro",
      totalDebts: 5,
      totalAmount: 25000,
      collected: 12000,
      pending: 13000,
      collectionRate: 48,
    },
  ]

  // Comparison chart data
  const comparisonData = [
    { month: "Jul", collected: 18000, projected: 20000 },
    { month: "Ago", collected: 21000, projected: 22000 },
    { month: "Sep", collected: 24000, projected: 23000 },
    { month: "Oct", collected: 26000, projected: 25000 },
    { month: "Nov", collected: 28000, projected: 27000 },
    { month: "Dic", collected: 30000, projected: 30000 },
  ]

  const handleExport = (format: string) => {
    toast.success(`Reporte exportado en formato ${format.toUpperCase()}`)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-primary" />
            Reportes y Estadísticas
          </h1>
          <p className="text-muted-foreground">
            Análisis detallado del rendimiento del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Año actual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recaudado</p>
                <p className="text-xl font-bold">{formatCurrency(totalCollected)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Cobro</p>
                <p className="text-xl font-bold">{collectionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <BarChart3 className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deudas Nuevas</p>
                <p className="text-xl font-bold">{newDebts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Días Mora Promedio</p>
                <p className="text-xl font-bold">{avgOverdueDays} días</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection vs Projected */}
        <Card>
          <CardHeader>
            <CardTitle>Cobros vs Proyectado</CardTitle>
            <CardDescription>Comparación de monto cobrado real vs meta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
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
                  <Legend />
                  <Bar
                    dataKey="collected"
                    name="Cobrado"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="projected"
                    name="Proyectado"
                    fill="#1A56DB"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>Montos totales por tipo de deuda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `$${v / 1000}k`}
                    className="text-xs"
                  />
                  <YAxis dataKey="category" type="category" width={120} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" fill="#1A56DB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Categoría</CardTitle>
          <CardDescription>
            Análisis detallado de cada categoría de deuda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Categoría
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Total Deudas
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Monto Total
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Cobrado
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    Pendiente
                  </th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">
                    % Cobro
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryPerformance.map((cat, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium">{cat.category}</td>
                    <td className="py-4 text-sm">{cat.totalDebts}</td>
                    <td className="py-4 text-sm">{formatCurrency(cat.totalAmount)}</td>
                    <td className="py-4 text-sm text-green-600">
                      {formatCurrency(cat.collected)}
                    </td>
                    <td className="py-4 text-sm text-red-600">
                      {formatCurrency(cat.pending)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${cat.collectionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{cat.collectionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2">
                  <td className="py-4 text-sm font-bold">Total</td>
                  <td className="py-4 text-sm font-bold">
                    {categoryPerformance.reduce((sum, c) => sum + c.totalDebts, 0)}
                  </td>
                  <td className="py-4 text-sm font-bold">
                    {formatCurrency(
                      categoryPerformance.reduce((sum, c) => sum + c.totalAmount, 0)
                    )}
                  </td>
                  <td className="py-4 text-sm font-bold text-green-600">
                    {formatCurrency(
                      categoryPerformance.reduce((sum, c) => sum + c.collected, 0)
                    )}
                  </td>
                  <td className="py-4 text-sm font-bold text-red-600">
                    {formatCurrency(
                      categoryPerformance.reduce((sum, c) => sum + c.pending, 0)
                    )}
                  </td>
                  <td className="py-4 text-sm font-bold">
                    {(
                      (categoryPerformance.reduce((sum, c) => sum + c.collected, 0) /
                        categoryPerformance.reduce((sum, c) => sum + c.totalAmount, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
