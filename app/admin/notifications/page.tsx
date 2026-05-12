"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Calendar, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllNotifications } from "@/lib/supabase-admin"
import type { DbNotification } from "@/lib/supabase-admin"
import { toast } from "sonner"

function kindToBadge(kind: string) {
  const k = (kind || "").toLowerCase()
  if (k.includes("overdue")) return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencida</Badge>
  if (k.includes("due_soon")) return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Próxima</Badge>
  if (k.includes("payment")) return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Pago</Badge>
  if (k.includes("profile")) return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Perfil</Badge>
  if (k.includes("debt")) return <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Deuda</Badge>
  return <Badge variant="secondary">{kind || "info"}</Badge>
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<DbNotification[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllNotifications()
        setNotifications((data || []) as DbNotification[])
      } catch (err) {
        console.error("Error loading notifications:", err)
        toast.error("Error al cargar notificaciones")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return notifications
    return notifications.filter((n) => {
      const title = n.title || ""
      const body = n.body || ""
      const kind = n.kind || ""
      return `${title} ${body} ${kind}`.toLowerCase().includes(q)
    })
  }, [notifications, searchTerm])

  const unreadCount = useMemo(() => filtered.filter((n) => !n.is_read).length, [filtered])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">Notificaciones generadas por eventos del sistema (tabla notifications)</p>
        </div>
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <Calendar className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Bell className="h-4 w-4" />
            Sin leer
            {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Actualizaciones registradas en la base de datos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Contenido</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-medium">{n.owner_id}</TableCell>
                        <TableCell>{kindToBadge(n.kind)}</TableCell>
                        <TableCell className="max-w-[140px] sm:max-w-xs truncate">{n.title}</TableCell>
                        <TableCell className="max-w-[180px] sm:max-w-md truncate">{n.body || "-"}</TableCell>
                        <TableCell>{formatDateTime(n.created_at)}</TableCell>
                        <TableCell>
                          {n.is_read ? (
                            <Badge variant="secondary">Leída</Badge>
                          ) : (
                            <Badge className="bg-primary/10 text-primary">Sin leer</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {loading ? "Cargando..." : "No hay notificaciones"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sin leer</CardTitle>
              <CardDescription>Solo notificaciones no leídas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.filter((n) => !n.is_read).length > 0 ? (
                    filtered
                      .filter((n) => !n.is_read)
                      .map((n) => (
                        <TableRow key={n.id}>
                          <TableCell className="font-medium">{n.owner_id}</TableCell>
                          <TableCell>{kindToBadge(n.kind)}</TableCell>
                          <TableCell className="max-w-[140px] sm:max-w-xs truncate">{n.title}</TableCell>
                          <TableCell>{formatDateTime(n.created_at)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {loading ? "Cargando..." : "No hay notificaciones sin leer"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

