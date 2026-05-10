"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getIncomesByUserId, createIncome, deleteIncome, type DbIncome } from "@/lib/supabase-admin"
import { Plus, DollarSign, TrendingUp, Repeat, ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
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

const getIncomeSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    salary: "Salario",
    freelance: "Freelance",
    investment: "Inversión",
    business: "Negocio",
    gift: "Regalo",
    other: "Otro",
  }
  return labels[source] || source
}

export default function MyIncomesPage() {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<DbIncome[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchIncomes()
    }
  }, [user])

  const fetchIncomes = async () => {
    if (!user) return
    try {
      const data = await getIncomesByUserId(user.id)
      setIncomes(data)
    } catch (err) {
      console.error("Error fetching incomes:", err)
      toast.error("Error al cargar los ingresos")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      setIncomes((prev) => prev.filter((i) => i.id !== id))
      toast.success("Ingreso eliminado")
    } catch (err) {
      console.error("Error deleting income:", err)
      toast.error("Error al eliminar el ingreso")
    }
  }

  if (!user) return null

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const recurringIncomes = incomes.filter((i) => i.recurring)
  const oneTimeIncomes = incomes.filter((i) => !i.recurring)

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
            <DollarSign className="h-7 w-7 text-emerald-500" />
            Mis Ingresos
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus ingresos y fuentes de dinero
          </p>
        </div>
        <Link href="/dashboard/new-income">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar Ingreso
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Registrado</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {incomes.length} ingresos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos Recurrentes</CardDescription>
            <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
              {recurringIncomes.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fuentes fijas mensuales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos Únicos</CardDescription>
            <CardTitle className="text-2xl text-purple-600 dark:text-purple-400">
              {oneTimeIncomes.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Ingresos eventuales
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-blue-500" />
              Ingresos Recurrentes
            </CardTitle>
            <CardDescription>
              Fuentes de ingreso fija
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recurringIncomes.length > 0 ? (
              <div className="space-y-3">
                {recurringIncomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{income.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {getIncomeSourceLabel(income.source)} • {income.recurring_period}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(Number(income.amount))}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(income.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No hay ingresos recurrentes
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Ingresos Únicos
            </CardTitle>
            <CardDescription>
              Ingresos eventuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            {oneTimeIncomes.length > 0 ? (
              <div className="space-y-3">
                {oneTimeIncomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">{income.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {getIncomeSourceLabel(income.source)} • {formatDate(income.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(Number(income.amount))}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(income.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No hay ingresos únicos
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {incomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Todos los Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Descripción</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Fuente</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Monto</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((income) => (
                    <tr key={income.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {income.recurring ? (
                            <Repeat className="h-4 w-4 text-blue-500" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-purple-500" />
                          )}
                          <span>{income.description}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {getIncomeSourceLabel(income.source)}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {formatDate(income.date)}
                      </td>
                      <td className="py-3 text-sm font-medium text-emerald-600">
                        {formatCurrency(Number(income.amount))}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}