"use client"

import { useState, useEffect } from "react"
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
import { Settings, Bell, Shield, Link2, Copy, RefreshCw, Check, Save } from "lucide-react"
import { toast } from "sonner"
import { getSystemSettings, updateSystemSettings, type SystemSetting } from "@/lib/supabase-admin"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [copied, setCopied] = useState(false)

  const [companyName, setCompanyName] = useState("DebtFlow Pro")
  const [currency, setCurrency] = useState("USD")
  const [timezone, setTimezone] = useState("America/Bogota")

  const [emailOverdue, setEmailOverdue] = useState(true)
  const [emailReminder, setEmailReminder] = useState(true)
  const [emailNewUser, setEmailNewUser] = useState(false)

  const [minPasswordLength, setMinPasswordLength] = useState("8")
  const [sessionTimeout, setSessionTimeout] = useState("30")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await getSystemSettings()
      console.log("Settings data:", data)
      setSettings(data)

      if (data && data.length > 0) {
        const settingMap: Record<string, string> = {}
        data.forEach((s) => {
          settingMap[s.key] = s.value
        })

        if (settingMap.company_name) setCompanyName(settingMap.company_name)
        if (settingMap.currency) setCurrency(settingMap.currency)
        if (settingMap.timezone) setTimezone(settingMap.timezone)
        if (settingMap.email_overdue !== undefined) setEmailOverdue(settingMap.email_overdue === "true")
        if (settingMap.email_reminder !== undefined) setEmailReminder(settingMap.email_reminder === "true")
        if (settingMap.email_new_user !== undefined) setEmailNewUser(settingMap.email_new_user === "true")
        if (settingMap.min_password_length) setMinPasswordLength(settingMap.min_password_length)
        if (settingMap.session_timeout) setSessionTimeout(settingMap.session_timeout)
        if (settingMap.two_factor_enabled !== undefined) setTwoFactorEnabled(settingMap.two_factor_enabled === "true")
        if (settingMap.webhook_url) setWebhookUrl(settingMap.webhook_url)
      } else {
        console.log("No settings found in database, using defaults")
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err)
      toast.error("Error al cargar la configuración: " + (err?.message || ""))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      await updateSystemSettings([
        { key: "company_name", value: companyName },
        { key: "currency", value: currency },
        { key: "timezone", value: timezone },
      ])
      toast.success("Configuración general guardada")
    } catch (err) {
      console.error("Error saving general settings:", err)
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await updateSystemSettings([
        { key: "email_overdue", value: String(emailOverdue) },
        { key: "email_reminder", value: String(emailReminder) },
        { key: "email_new_user", value: String(emailNewUser) },
      ])
      toast.success("Configuración de notificaciones guardada")
    } catch (err) {
      console.error("Error saving notification settings:", err)
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSecurity = async () => {
    setSaving(true)
    try {
      await updateSystemSettings([
        { key: "min_password_length", value: minPasswordLength },
        { key: "session_timeout", value: sessionTimeout },
        { key: "two_factor_enabled", value: String(twoFactorEnabled) },
      ])
      toast.success("Configuración de seguridad guardada")
    } catch (err) {
      console.error("Error saving security settings:", err)
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveIntegrations = async () => {
    setSaving(true)
    try {
      await updateSystemSettings([
        { key: "webhook_url", value: webhookUrl },
      ])
      toast.success("Configuración de integraciones guardada")
    } catch (err) {
      console.error("Error saving integration settings:", err)
      toast.error("Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("df_live_sk_xxxxx")
    setCopied(true)
    toast.success("API Key copiada al portapapeles")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-7 w-7 text-primary" />
          Configuración del Sistema
        </h1>
        <p className="text-muted-foreground">
          Administra la configuración general de la plataforma
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configura los ajustes básicos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la Empresa</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moneda</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">Dólar estadounidense (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="COP">Peso colombiano (COP)</SelectItem>
                      <SelectItem value="MXN">Peso mexicano (MXN)</SelectItem>
                      <SelectItem value="ARS">Peso argentino (ARS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zona Horaria</label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona zona horaria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Bogotá (UTC-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (UTC-6)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Ángeles (UTC-8)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Gestiona los correos electrónicos y notificaciones del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Notificaciones de deudas vencidas</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir email cuando una deuda pase a estado vencido
                    </p>
                  </div>
                  <Switch
                    checked={emailOverdue}
                    onCheckedChange={setEmailOverdue}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Recordatorios de pago</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir recordatorios antes del vencimiento de pagos
                    </p>
                  </div>
                  <Switch
                    checked={emailReminder}
                    onCheckedChange={setEmailReminder}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">Notificaciones de nuevos usuarios</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir email cuando un nuevo usuario se registre
                    </p>
                  </div>
                  <Switch
                    checked={emailNewUser}
                    onCheckedChange={setEmailNewUser}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Ajustes de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitud mínima de contraseña</label>
                  <Select value={minPasswordLength} onValueChange={setMinPasswordLength}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona longitud" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 caracteres</SelectItem>
                      <SelectItem value="8">8 caracteres</SelectItem>
                      <SelectItem value="10">10 caracteres</SelectItem>
                      <SelectItem value="12">12 caracteres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiempo de sesión (minutos)</label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium">Autenticación de dos factores (2FA)</p>
                  <p className="text-sm text-muted-foreground">
                    Requiere verificación adicional al iniciar sesión
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integraciones</CardTitle>
              <CardDescription>
                Conecta con servicios externos y API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL del Webhook</label>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://tu-servidor.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  Recibir notificaciones de eventos del sistema
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">API Key</label>
                <div className="flex gap-2">
                  <Input
                    value="df_live_sk_xxxxx"
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={handleCopyApiKey}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Usa esta key para integrar con servicios externos
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveIntegrations} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}