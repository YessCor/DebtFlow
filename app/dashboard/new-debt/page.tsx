"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { PlusCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"

export default function NewDebtPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    interestRate: "",
    dueDate: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    if (!formData.title || !formData.amount || !formData.dueDate) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)

    try {
      // Buscar o crear persona "Deuda Propia"
      const { data: existingPerson } = await supabase
        .from("people")
        .select("id")
        .eq("owner_id", user.id)
        .eq("name", "Deuda Propia")
        .limit(1)
        .single()

      let personId = existingPerson?.id

      if (!personId) {
        const { data: newPerson, error: personError } = await supabase
          .from("people")
          .insert({
            owner_id: user.id,
            name: "Deuda Propia",
          })
          .select()
          .single()

        if (personError) throw personError
        personId = newPerson.id
      }

      // Crear el préstamo/deuda
      const { error: loanError } = await supabase
        .from("loans")
        .insert({
          owner_id: user.id,
          counterparty_id: personId,
          direction: "received",
          title: formData.title,
          description: formData.description || null,
          principal_amount: parseFloat(formData.amount),
          interest_rate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
          due_on: formData.dueDate,
          notes: formData.notes || null,
          status: "active",
        })

      if (loanError) throw loanError

      toast.success("Deuda registrada exitosamente")
      router.push("/dashboard/my-debts")
    } catch (err) {
      console.error("Error creating debt:", err)
      toast.error("Error al registrar la deuda")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-debts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
            <PlusCircle className="h-7 w-7 text-red-500" />
            Registrar Nueva Deuda
          </h1>
          <p className="text-muted-foreground">
            Agrega una nueva deuda o préstamo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Deuda</CardTitle>
            <CardDescription>
              Completa los campos para registrar una nueva deuda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Nombre de la Deuda *</Label>
              <Input
                id="title"
                placeholder="Ej: Préstamo Bancario, Tarjeta de Crédito"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales de la deuda"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto Total *</Label>
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
                <Label htmlFor="interestRate">Tasa de Interés (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange("interestRate", e.target.value)}
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre la deuda"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>

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
    </div>
  )
}