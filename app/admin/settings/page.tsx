"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Settings, Bell, Shield, Link2, Copy, RefreshCw, Check } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [companyName, setCompanyName] = useState("DebtFlow Pro")
  const [currency, setCurrency] = useState("USD")
  const [timezone, setTimezone] = useState("America/New_York")

  const [emailOverdue, setEmailOverdue] = useState(true)
  const [emailReminder, setEmailReminder] = useState(true)
  const [emailNewUser, setEmailNewUser] = useState(false)

  const [minPasswordLength, setMinPasswordLength] = useState("8")
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [webhookUrl, setWebhookUrl] = useState("")
  const [apiKey] = useState("df_live_sk_1234567890abcdef")
  const [copied, setCopied] = useState(false)

  const handleSave = () => {
    toast.success("Configuración guardada correctamente")
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    toast.success("API Key copiada al portapapeles")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerateApiKey = () => {
    toast.success("API Key regenerada correctamente")
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground">
          Administra la configuración general de la plataforma
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura los ajustes básicos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel>Nombre de la Empresa</FieldLabel>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nombre de tu empresa"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Moneda Predeterminada</FieldLabel>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                        <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Zona Horaria</FieldLabel>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          America/Los_Angeles (PST)
                        </SelectItem>
                        <SelectItem value="America/Mexico_City">
                          America/Mexico_City (CST)
                        </SelectItem>
                        <SelectItem value="America/Bogota">
                          America/Bogota (COT)
                        </SelectItem>
                        <SelectItem value="Europe/Madrid">
                          Europe/Madrid (CET)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Logo de la Empresa</FieldLabel>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline">Subir Logo</Button>
                  </div>
                </Field>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones por Email
              </CardTitle>
              <CardDescription>
                Configura los emails automáticos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Deuda Vencida</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar email cuando una deuda vence
                    </p>
                  </div>
                  <Switch
                    checked={emailOverdue}
                    onCheckedChange={setEmailOverdue}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Recordatorio de Pago</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorio 7 días antes del vencimiento
                    </p>
                  </div>
                  <Switch
                    checked={emailReminder}
                    onCheckedChange={setEmailReminder}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Nuevo Usuario</p>
                    <p className="text-sm text-muted-foreground">
                      Notificar al admin cuando se registra un usuario
                    </p>
                  </div>
                  <Switch
                    checked={emailNewUser}
                    onCheckedChange={setEmailNewUser}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configura las políticas de seguridad de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Longitud Mínima de Contraseña</FieldLabel>
                    <Select
                      value={minPasswordLength}
                      onValueChange={setMinPasswordLength}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caracteres</SelectItem>
                        <SelectItem value="8">8 caracteres</SelectItem>
                        <SelectItem value="10">10 caracteres</SelectItem>
                        <SelectItem value="12">12 caracteres</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Tiempo de Sesión (minutos)</FieldLabel>
                    <Select
                      value={sessionTimeout}
                      onValueChange={setSessionTimeout}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Autenticación de Dos Factores (2FA)</p>
                    <p className="text-sm text-muted-foreground">
                      Requerir 2FA para todos los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Integraciones
              </CardTitle>
              <CardDescription>
                Configura webhooks y acceso a la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel>Webhook URL</FieldLabel>
                  <Input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://tu-servidor.com/webhook"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recibirás notificaciones de eventos en esta URL
                  </p>
                </Field>
                <Field>
                  <FieldLabel>API Key</FieldLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      value={apiKey}
                      readOnly
                      className="font-mono bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyApiKey}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRegenerateApiKey}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usa esta clave para autenticar solicitudes a la API
                  </p>
                </Field>
                <div className="flex justify-end">
                  <Button onClick={handleSave}>Guardar Cambios</Button>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
