"use client"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Calendar, Save, Key, Building } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: "",
        postalCode: "",
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from("users")
        .update({
          display_name: formData.name,
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({
        ...user,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      })

      toast.success("Perfil actualizado correctamente")
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.success("Preferencias de notificaciones actualizadas")
  }

  const handleChangePassword = async () => {
    if (!user) return
    
    toast.success("Funcionalidad de cambio de contraseña en desarrollo")
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-6">
        <p>Debes iniciar sesión para ver tu perfil</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
          <User className="h-7 w-7 text-primary" />
          Mi Perfil
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {formData.name ? formData.name.split(" ").map((n) => n[0]).join("").toUpperCase() : user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{formData.name || "Usuario"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user.role === "admin" ? "Administrador" : "Usuario"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Miembro desde {user.createdAt}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
              <TabsTrigger value="security">Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          disabled
                          className="pl-10 bg-muted"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="pl-10"
                          placeholder="Ciudad de México"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="pl-10"
                          placeholder="Calle Principal 123"
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias de Notificaciones</CardTitle>
                  <CardDescription>
                    Configura cómo quieres recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Notificaciones por correo</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe actualizaciones por email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Recordatorios de pago</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe recordatorios antes de tus fechas de pago
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Alertas de deudas próximas</p>
                        <p className="text-sm text-muted-foreground">
                          Notificaciones cuando una deuda esté por vencer
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">Promociones y ofertas</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe noticias sobre nuevas funcionalidades
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <Button onClick={handleSaveNotifications}>
                    Guardar Preferencias
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                  <CardDescription>
                    Gestiona tu contraseña y seguridad de la cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button onClick={handleChangePassword}>
                    <Key className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </Button>

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Información de la cuenta</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID de usuario:</span>
                        <span className="font-mono text-xs">{user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rol:</span>
                        <span>{user.role === "admin" ? "Administrador" : "Usuario"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha de registro:</span>
                        <span>{user.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}