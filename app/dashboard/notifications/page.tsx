"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Mail, AlertCircle, Info, Calendar, DollarSign, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Notification {
  id: string
  type: "payment" | "reminder" | "info" | "alert"
  title: string
  message: string
  date: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Pago recibido",
    message: "Tu pago de $500.00 ha sido procesado exitosamente.",
    date: "2024-01-15T10:30:00",
    read: false
  },
  {
    id: "2",
    type: "reminder",
    title: "Recordatorio de pago",
    message: "Tu próximo pago de $250.00 vence en 3 días.",
    date: "2024-01-14T09:00:00",
    read: false
  },
  {
    id: "3",
    type: "alert",
    title: "Pago vencido",
    message: "Tienes un pago vencido desde hace 5 días. Por favor, regulariza tu situación.",
    date: "2024-01-10T08:00:00",
    read: true
  },
  {
    id: "4",
    type: "info",
    title: "Nueva funcionalidad",
    message: "Ahora puedes ver el historial completo de tus pagos en la sección de pagos.",
    date: "2024-01-08T14:00:00",
    read: true
  },
  {
    id: "5",
    type: "payment",
    title: "Confirmación de abono",
    message: "Se ha registrado tu abono de $300.00 a tu deuda principal.",
    date: "2024-01-05T11:15:00",
    read: true
  },
  {
    id: "6",
    type: "reminder",
    title: "Plan de pagos actualizado",
    message: "Tu plan de pagos ha sido actualizado. Revisa los nuevos términos.",
    date: "2024-01-03T16:30:00",
    read: true
  }
]

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "payment":
      return <DollarSign className="h-5 w-5 text-emerald-500" />
    case "reminder":
      return <Calendar className="h-5 w-5 text-amber-500" />
    case "alert":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
  }
}

const getNotificationBadge = (type: Notification["type"]) => {
  switch (type) {
    case "payment":
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Pago</Badge>
    case "reminder":
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Recordatorio</Badge>
    case "alert":
      return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Alerta</Badge>
    case "info":
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Info</Badge>
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success("Todas las notificaciones marcadas como leídas")
  }
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success("Notificación eliminada")
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Hace unos minutos"
    if (diffInHours < 24) return `Hace ${diffInHours} horas`
    if (diffInHours < 48) return "Ayer"
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
  }

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <div 
      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
        notification.read 
          ? "bg-background border-border" 
          : "bg-primary/5 border-primary/20"
      }`}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {getNotificationBadge(notification.type)}
          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </div>
        <h4 className="font-medium text-foreground">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.date)}</p>
      </div>
      <div className="flex items-center gap-1">
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => markAsRead(notification.id)}
            title="Marcar como leída"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => deleteNotification(notification.id)}
          title="Eliminar"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 
              ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? "es" : ""} sin leer`
              : "No tienes notificaciones sin leer"
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Bell className="h-4 w-4" />
            Todas
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Mail className="h-4 w-4" />
            Sin leer
            {unreadCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Todas las notificaciones</CardTitle>
              <CardDescription>Historial completo de notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes notificaciones</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sin leer</CardTitle>
              <CardDescription>Notificaciones pendientes de leer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.filter(n => !n.read).length > 0 ? (
                notifications
                  .filter(n => !n.read)
                  .map(notification => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes notificaciones sin leer</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
