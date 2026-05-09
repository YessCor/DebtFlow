"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import {
  getIncomesByUserId,
  formatCurrency,
  formatDate,
  getIncomeSourceLabel,
} from "@/lib/mock-data"
import { Plus, DollarSign, TrendingUp, Repeat, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function MyIncomesPage() {
  const { user } = useAuth()

  if (!user) return null

  const userIncomes = getIncomesByUserId(user.id)
  const totalIncome = userIncomes.reduce((sum, i) => sum + i.amount, 0)
  const recurringIncomes = userIncomes.filter((i) => i.recurring)
  const oneTimeIncomes = userIncomes.filter((i) => !i.recurring)

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
              {userIncomes.length} ingresos registrados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos Recurrentes</CardDescription>
            <CardTitle className="text-2xl">{recurringIncomes.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(recurringIncomes.reduce((s, i) => s + i.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Una Sola Vez</CardDescription>
            <CardTitle className="text-2xl">{oneTimeIncomes.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(oneTimeIncomes.reduce((s, i) => s + i.amount, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Ingresos</CardTitle>
          <CardDescription>Lista completa de tus ingresos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userIncomes.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium">{income.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {getIncomeSourceLabel(income.source)} • {formatDate(income.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(income.amount)}
                    </p>
                    {income.recurring && (
                      <Badge variant="outline" className="text-xs">
                        <Repeat className="h-3 w-3 mr-1" />
                        {income.recurringPeriod === "monthly" ? "Mensual" :
                         income.recurringPeriod === "weekly" ? "Semanal" :
                         income.recurringPeriod === "biweekly" ? "Quincenal" : "Anual"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {userIncomes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tienes ingresos registrados
                <Link href="/dashboard/new-income" className="block mt-2">
                  <Button variant="link">Registrar tu primer ingreso</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}