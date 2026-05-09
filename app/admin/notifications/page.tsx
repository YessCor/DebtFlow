"use client"

import { useState } from "react"
import { Bell, Send, Users, Calendar, Mail, MessageSquare, Plus, Search, Filter, Trash2, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface NotificationTemplate {
  id: string
  name: string
  type: "email" | "sms" | "push"
  subject: string
  content: string
  createdAt: string
}

interface SentNotification {
  id: string
  template: string
  recipients: number
  sentAt: string
  status: "sent" | "pending" | "failed"
  openRate: number
}

const templates: NotificationTemplate[] = [
  {
    id: "1",
    name: "Recordatorio de pago",
    type: "email",
    subject: "Recordatorio: Tu pago vence pronto",
    content: "Estimado {nombre}, te recordamos que tu pago de {monto} vence el {fecha}.",
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    name: "Pago vencido",
    type: "sms",
    subject: "",
    content: "IMPORTANTE: Tu pago de {monto} está vencido. Regulariza tu situación.",
    createdAt: "2024-01-08"
  },
  {
    id: "3",
    name: "Confirmación de pago",
    type: "email",
    subject: "Pago recibido exitosamente",
    content: "Hemos recibido tu pago de {monto}. Gracias por tu puntualidad.",
    createdAt: "2024-01-05"
  }
]

const sentNotifications: SentNotification[] = [
  {
    id: "1",
    template: "Recordatorio de pago",
    recipients: 150,
    sentAt: "2024-01-15 10:30",
    status: "sent",
    openRate: 68
  },
  {
    id: "2",
    template: "Pago vencido",
    recipients: 45,
    sentAt: "2024-01-14 09:00",
    status: "sent",
    openRate: 82
  },
  {
    id: "3",
    template: "Confirmación de pago",
    recipients: 200,
    sentAt: "2024-01-13 14:00",
    status: "sent",
    openRate: 75
  }
]

export default function AdminNotificationsPage() {
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false)
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "email" as "email" | "sms" | "push",
    subject: "",
    content: ""
  })
  
  const [sendConfig, setSendConfig] = useState({
    template: "",
    recipients: "all",
    scheduledDate: ""
  })

  const handleCreateTemplate = () => {
    toast.success("Plantilla creada exitosamente")
    setIsNewTemplateOpen(false)
    setNewTemplate({ name: "", type: "email", subject: "", content: "" })
  }
  
  const handleSendNotification = () => {
    toast.success("Notificación enviada exitosamente")
    setIsSendOpen(false)
    setSendConfig({ template: "", recipients: "all", scheduledDate: "" })
  }

  const getTypeBadge = (type: "email" | "sms" | "push") => {
    switch (type) {
      case "email":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><Mail className="h-3 w-3 mr-1" />Email</Badge>
      case "sms":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><MessageSquare className="h-3 w-3 mr-1" />SMS</Badge>
      case "push":
        return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"><Bell className="h-3 w-3 mr-1" />Push</Badge>
    }
  }
  
  const getStatusBadge = (status: "sent" | "pending" | "failed") => {
    switch (status) {
      case "sent":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Enviado</Badge>
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pendiente</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Fallido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">Gestiona y envía notificaciones a los usuarios</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificación
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Notificación</DialogTitle>
                <DialogDescription>Configura y envía una notificación a los usuarios</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Select value={sendConfig.template} onValueChange={v => setSendConfig({ ...sendConfig, template: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destinatarios</Label>
                  <Select value={sendConfig.recipients} onValueChange={v => setSendConfig({ ...sendConfig, recipients: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      <SelectItem value="active">Solo deudas activas</SelectItem>
                      <SelectItem value="overdue">Solo deudas vencidas</SelectItem>
                      <SelectItem value="upcoming">Pagos próximos (7 días)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Programar envío (opcional)</Label>
                  <Input 
                    type="datetime-local"
                    value={sendConfig.scheduledDate}
                    onChange={e => setSendConfig({ ...sendConfig, scheduledDate: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendOpen(false)}>Cancelar</Button>
                <Button onClick={handleSendNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar ahora
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-emerald-600">+5% vs mes anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plantillas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Alcanzados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">395</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Plantillas de Notificación</CardTitle>
                <CardDescription>Gestiona las plantillas para envío masivo</CardDescription>
              </div>
              <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Crear Plantilla</DialogTitle>
                    <DialogDescription>Crea una nueva plantilla de notificación</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nombre de la plantilla</Label>
                      <Input 
                        value={newTemplate.name}
                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Ej: Recordatorio semanal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={newTemplate.type} onValueChange={(v: "email" | "sms" | "push") => setNewTemplate({ ...newTemplate, type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="push">Push</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTemplate.type === "email" && (
                      <div className="space-y-2">
                        <Label>Asunto</Label>
                        <Input 
                          value={newTemplate.subject}
                          onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                          placeholder="Asunto del correo"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Contenido</Label>
                      <Textarea 
                        value={newTemplate.content}
                        onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        placeholder="Usa {nombre}, {monto}, {fecha} como variables"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Variables disponibles: {"{nombre}"}, {"{monto}"}, {"{fecha}"}, {"{saldo}"}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTemplateOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateTemplate}>Crear plantilla</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar plantillas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Creada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getTypeBadge(template.type)}</TableCell>
                      <TableCell className="max-w-xs truncate">{template.subject || "-"}</TableCell>
                      <TableCell>{template.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Envíos</CardTitle>
              <CardDescription>Registro de todas las notificaciones enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plantilla</TableHead>
                    <TableHead>Destinatarios</TableHead>
                    <TableHead>Fecha de envío</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tasa de apertura</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentNotifications.map(notification => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.template}</TableCell>
                      <TableCell>{notification.recipients} usuarios</TableCell>
                      <TableCell>{notification.sentAt}</TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${notification.openRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{notification.openRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
