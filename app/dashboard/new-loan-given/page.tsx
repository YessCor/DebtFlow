"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Handshake, ArrowLeft, User, Percent, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

export default function NewLoanGivenPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerContact: "",
    principalAmount: "",
    interestRate: "",
    startDate: "",
    dueDate: "",
    notes: "",
  })
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null)

  const calculateTotal = () => {
    const principal = parseFloat(formData.principalAmount) || 0
    const rate = parseFloat(formData.interestRate) || 0
    if (principal > 0 && rate >= 0) {
      const total = principal * (1 + rate / 100)
      setCalculatedTotal(total)
      return total
    }
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === "principalAmount" || field === "interestRate") {
      setTimeout(calculateTotal, 100)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.borrowerName || !formData.principalAmount || !formData.interestRate || !formData.dueDate) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success("Préstamo registrado exitosamente")
    router.push("/dashboard/loans-given")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/loans-given">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <Handshake className="h-7 w-7 text-violet-500" />
            Registrar Nuevo Préstamo
          </h1>
          <p className="text-muted-foreground">
            Registra un préstamo que has dado a alguien más
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Préstamo</CardTitle>
            <CardDescription>
              Registra los detalles del préstamo dado a un tercero
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="borrowerName">Nombre del Deudor *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="borrowerName"
                    placeholder="Nombre completo"
                    className="pl-10"
                    value={formData.borrowerName}
                    onChange={(e) => handleInputChange("borrowerName", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowerContact">Contacto (opcional)</Label>
                <Input
                  id="borrowerContact"
                  placeholder="Email o teléfono"
                  value={formData.borrowerContact}
                  onChange={(e) => handleInputChange("borrowerContact", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalAmount">Monto Prestado *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="principalAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={formData.principalAmount}
                    onChange={(e) => handleInputChange("principalAmount", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestRate">Tasa de Interés (%) *</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="interestRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0.0"
                    className="pl-10"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange("interestRate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    className="pl-10"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {calculatedTotal !== null && (
              <div className="p-4 rounded-lg bg-violet-50 border border-violet-200 dark:bg-violet-900/20 dark:border-violet-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-violet-800 dark:text-violet-300">Total a Recibir</p>
                    <p className="text-sm text-violet-600 dark:text-violet-400">
                      Monto prestado + intereses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                      ${calculatedTotal.toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +${(calculatedTotal - parseFloat(formData.principalAmount || "0")).toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} intereses
                    </p>
                  </div>
                </div>
              </div>
            )}

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Detalles del acuerdo, condiciones, etc."
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Link href="/dashboard/loans-given" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrar Préstamo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Consejos para préstamos</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Siempre documenta los acuerdos con contratos firmados</li>
            <li>- Registra los pagos parciales para llevar control</li>
            <li>- Define claramente los términos de interés y plazos</li>
            <li>- Guarda los comprobantes de cada cobro realizado</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}