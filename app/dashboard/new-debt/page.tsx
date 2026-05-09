"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PlusCircle, ArrowLeft, CreditCard, Banknote, Home, Car, Package } from "lucide-react"
import Link from "next/link"

const categories = [
  { value: "credit_card", label: "Tarjeta de Crédito", icon: CreditCard },
  { value: "personal_loan", label: "Préstamo Personal", icon: Banknote },
  { value: "mortgage", label: "Hipoteca", icon: Home },
  { value: "auto", label: "Financiamiento de Auto", icon: Car },
  { value: "other", label: "Otro", icon: Package },
]

export default function NewDebtPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    originalAmount: "",
    interestRate: "",
    startDate: "",
    dueDate: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.description || !formData.originalAmount || !formData.dueDate) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success("Deuda registrada exitosamente")
    router.push("/dashboard/my-debts")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-debts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <PlusCircle className="h-7 w-7 text-primary" />
            Registrar Nueva Deuda
          </h1>
          <p className="text-muted-foreground">
            Ingresa los detalles de tu nueva deuda para llevar un seguimiento
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Deuda</CardTitle>
            <CardDescription>
              Completa los campos para registrar una nueva deuda en tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label>Tipo de Deuda *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = formData.category === cat.value
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleInputChange("category", cat.value)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs text-center ${isSelected ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {cat.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Ej: Tarjeta Visa Banco Nacional"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            {/* Amount and Interest Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originalAmount">Monto Total *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="originalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.originalAmount}
                    onChange={(e) => handleInputChange("originalAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Tasa de Interés Anual (%)</Label>
                <div className="relative">
                  <Input
                    id="interestRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange("interestRate", e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre la deuda, términos de pago, etc."
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Link href="/dashboard/my-debts" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Deuda"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Tips Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Consejos para gestionar tus deudas</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Registra todas tus deudas para tener una visión completa de tu situación financiera</li>
            <li>- Prioriza las deudas con mayor tasa de interés</li>
            <li>- Establece recordatorios para no perder fechas de vencimiento</li>
            <li>- Revisa periódicamente tu progreso de pago</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
