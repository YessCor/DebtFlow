"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { DollarSign, ArrowLeft, Briefcase, Gift, PiggyBank, Laptop, Banknote, TrendingUp } from "lucide-react"
import Link from "next/link"

const incomeSources = [
  { value: "salary", label: "Salario", icon: Briefcase },
  { value: "freelance", label: "Freelance", icon: Laptop },
  { value: "investment", label: "Inversión", icon: PiggyBank },
  { value: "business", label: "Negocio", icon: TrendingUp },
  { value: "gift", label: "Regalo", icon: Gift },
  { value: "other", label: "Otro", icon: Banknote },
]

const recurringOptions = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
]

export default function NewIncomePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    source: "",
    description: "",
    amount: "",
    date: "",
    recurring: false,
    recurringPeriod: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.source || !formData.description || !formData.amount || !formData.date) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    if (formData.recurring && !formData.recurringPeriod) {
      toast.error("Selecciona la periodicidad del ingreso")
      return
    }

    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success("Ingreso registrado exitosamente")
    router.push("/dashboard/my-incomes")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-incomes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-emerald-500" />
            Registrar Nuevo Ingreso
          </h1>
          <p className="text-muted-foreground">
            Registra tus fuentes de ingresos para un mejor control financiero
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Ingreso</CardTitle>
            <CardDescription>
              Completa los campos para registrar un nuevo ingreso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Fuente de Ingreso *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {incomeSources.map((src) => {
                  const Icon = src.icon
                  const isSelected = formData.source === src.value
                  return (
                    <button
                      key={src.value}
                      type="button"
                      onClick={() => handleInputChange("source", src.value)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border hover:border-emerald-500/50"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isSelected ? "text-emerald-500" : "text-muted-foreground"}`} />
                      <span className={`text-xs text-center ${isSelected ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                        {src.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Ej: Salario Diciembre 2024"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha de Recepción *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="recurring" className="text-base">¿Es un ingreso recurrente?</Label>
                <p className="text-sm text-muted-foreground">
                  Activa si este ingreso se repite periódicamente
                </p>
              </div>
              <Switch
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => handleInputChange("recurring", checked)}
              />
            </div>

            {formData.recurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringPeriod">Periodicidad *</Label>
                <Select
                  value={formData.recurringPeriod}
                  onValueChange={(value) => handleInputChange("recurringPeriod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la periodicidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {recurringOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el ingreso"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Link href="/dashboard/my-incomes" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Ingreso"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}