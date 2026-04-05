"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  Users,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  BadgeCheck,
  Edit,
  Trash2,
  FileText,
  Briefcase
} from "lucide-react"
import { usuarios as initialUsuarios, perfilesCajero as initialPerfiles } from "@/lib/mock-data"
import type { Usuario, PerfilCajero } from "@/lib/types"

const turnos = [
  { value: 'matutino', label: 'Matutino (6:00 - 14:00)' },
  { value: 'vespertino', label: 'Vespertino (14:00 - 22:00)' },
  { value: 'nocturno', label: 'Nocturno (22:00 - 6:00)' },
]

type CajeroCompleto = Usuario & { perfil?: PerfilCajero }

type CajeroFormData = {
  nombre: string
  correo: string
  direccion: string
  telefono: string
  nss: string
  rfc: string
  fecha_ingreso: string
  sueldo: number
  horas_semana: number
  turno: string
}

function CajeroForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  searchEmail,
  setSearchEmail,
  selectedUser,
  onSearch,
}: {
  formData: CajeroFormData
  setFormData: (data: CajeroFormData) => void
  isEdit?: boolean
  onSubmit: () => void
  searchEmail: string
  setSearchEmail: (value: string) => void
  selectedUser: Usuario | null
  onSearch: () => void
}) {
  return (
    <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
      {/* Search existing user - only for new cajero */}
      {!isEdit && (
        <Card className="rounded-xl border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Buscar cuenta registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="correo@ejemplo.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10 h-10 rounded-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={onSearch}
                className="rounded-lg"
              >
                Buscar
              </Button>
            </div>
            {selectedUser && (
              <div className="p-3 bg-[oklch(0.6_0.15_145)]/10 rounded-lg flex items-center gap-3">
                <BadgeCheck className="w-5 h-5 text-[oklch(0.5_0.15_145)]" />
                <div>
                  <p className="font-medium text-foreground">{selectedUser.nombre}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.correo}</p>
                </div>
              </div>
            )}
            {searchEmail && !selectedUser && (
              <p className="text-sm text-muted-foreground">
                No se encontró usuario. Se creará una nueva cuenta.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* New cashier form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(!selectedUser || isEdit) && (
          <>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Juan Pérez García"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="pl-10 h-10 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  className="pl-10 h-10 rounded-lg"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Dirección</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Calle, Número, Colonia"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Teléfono</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="555-123-4567"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">NSS</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="12345678901"
              value={formData.nss}
              onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">RFC</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ABCD123456XYZ"
              value={formData.rfc}
              onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
              className="pl-10 h-10 rounded-lg uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Fecha de ingreso</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={formData.fecha_ingreso}
              onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Sueldo mensual</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="8500"
              value={formData.sueldo || ""}
              onChange={(e) => setFormData({ ...formData, sueldo: parseFloat(e.target.value) || 0 })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Horas por semana</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={formData.horas_semana}
              onChange={(e) => setFormData({ ...formData, horas_semana: parseInt(e.target.value) || 0 })}
              className="pl-10 h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Turno</Label>
          <Select
            value={formData.turno}
            onValueChange={(v) => setFormData({ ...formData, turno: v })}
          >
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {turnos.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
        onClick={onSubmit}
        disabled={isEdit ? !formData.nombre : (!selectedUser && !formData.nombre)}
      >
        {isEdit ? 'Guardar cambios' : 'Registrar Cajero'}
      </Button>
    </div>
  )
}

export default function UsuariosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [perfilesCajero, setPerfilesCajero] = useState(initialPerfiles)
  const [selectedUser, setSelectedUser] = useState<typeof usuarios[0] | null>(null)
  const [selectedCajero, setSelectedCajero] = useState<CajeroCompleto | null>(null)
  const [formData, setFormData] = useState<CajeroFormData>({
    nombre: "",
    correo: "",
    direccion: "",
    telefono: "",
    nss: "",
    rfc: "",
    fecha_ingreso: "",
    sueldo: 0,
    horas_semana: 48,
    turno: "matutino"
  })

  const cajeros = usuarios.filter(u => u.rol_id === 2)
  const filteredCajeros = cajeros.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.correo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      nombre: "",
      correo: "",
      direccion: "",
      telefono: "",
      nss: "",
      rfc: "",
      fecha_ingreso: "",
      sueldo: 0,
      horas_semana: 48,
      turno: "matutino"
    })
    setSelectedUser(null)
    setSearchEmail("")
  }

  const searchRegisteredUser = () => {
    const found = usuarios.find(u => u.correo.toLowerCase() === searchEmail.toLowerCase())
    setSelectedUser(found || null)
    if (found) {
      setFormData(prev => ({
        ...prev,
        nombre: found.nombre,
        correo: found.correo
      }))
    }
  }

  const handleCreateCajero = () => {
    const newUserId = Math.max(...usuarios.map(u => u.id), 0) + 1
    const newPerfilId = Math.max(...perfilesCajero.map(p => p.id), 0) + 1

    // Create user if not found
    if (!selectedUser) {
      const newUser: Usuario = {
        id: newUserId,
        rol_id: 2,
        nombre: formData.nombre,
        correo: formData.correo
      }
      setUsuarios([...usuarios, newUser])
    }

    // Create profile
    const newPerfil: PerfilCajero = {
      id: newPerfilId,
      usuario_id: selectedUser?.id || newUserId,
      direccion: formData.direccion,
      telefono: formData.telefono,
      nss: formData.nss,
      rfc: formData.rfc,
      fecha_ingreso: new Date(formData.fecha_ingreso),
      sueldo: formData.sueldo,
      horas_semana: formData.horas_semana,
      turno: formData.turno as 'matutino' | 'vespertino' | 'nocturno'
    }
    setPerfilesCajero([...perfilesCajero, newPerfil])

    setIsDialogOpen(false)
    resetForm()
  }

  const getCajeroProfile = (userId: number) => {
    return perfilesCajero.find(p => p.usuario_id === userId)
  }

  const openEditDialog = (cajero: Usuario) => {
    const perfil = getCajeroProfile(cajero.id)
    setSelectedCajero({ ...cajero, perfil })
    setFormData({
      nombre: cajero.nombre,
      correo: cajero.correo,
      direccion: perfil?.direccion || "",
      telefono: perfil?.telefono || "",
      nss: perfil?.nss || "",
      rfc: perfil?.rfc || "",
      fecha_ingreso: perfil?.fecha_ingreso ? new Date(perfil.fecha_ingreso).toISOString().split('T')[0] : "",
      sueldo: perfil?.sueldo || 0,
      horas_semana: perfil?.horas_semana || 48,
      turno: perfil?.turno || "matutino"
    })
    setIsEditDialogOpen(true)
  }

  const handleEditCajero = () => {
    if (selectedCajero) {
      // Update user
      setUsuarios(prev => prev.map(u =>
        u.id === selectedCajero.id ? {
          ...u,
          nombre: formData.nombre,
          correo: formData.correo
        } : u
      ))

      // Update profile
      if (selectedCajero.perfil) {
        setPerfilesCajero(prev => prev.map(p =>
          p.usuario_id === selectedCajero.id ? {
            ...p,
            direccion: formData.direccion,
            telefono: formData.telefono,
            nss: formData.nss,
            rfc: formData.rfc,
            fecha_ingreso: new Date(formData.fecha_ingreso),
            sueldo: formData.sueldo,
            horas_semana: formData.horas_semana,
            turno: formData.turno as 'matutino' | 'vespertino' | 'nocturno'
          } : p
        ))
      }
    }
    setIsEditDialogOpen(false)
    setSelectedCajero(null)
    resetForm()
  }

  const openDeleteDialog = (cajero: Usuario) => {
    const perfil = getCajeroProfile(cajero.id)
    setSelectedCajero({ ...cajero, perfil })
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteCajero = () => {
    if (selectedCajero) {
      setUsuarios(prev => prev.filter(u => u.id !== selectedCajero.id))
      setPerfilesCajero(prev => prev.filter(p => p.usuario_id !== selectedCajero.id))
    }
    setIsDeleteDialogOpen(false)
    setSelectedCajero(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar cajero por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 rounded-xl bg-card border-border/50"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Cajero
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Registrar Cajero</DialogTitle>
            </DialogHeader>
            <CajeroForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateCajero}
              searchEmail={searchEmail}
              setSearchEmail={setSearchEmail}
              selectedUser={selectedUser}
              onSearch={searchRegisteredUser}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { resetForm(); setSelectedCajero(null); }}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Editar Cajero</DialogTitle>
          </DialogHeader>
          <CajeroForm
            formData={formData}
            setFormData={setFormData}
            isEdit
            onSubmit={handleEditCajero}
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
            selectedUser={selectedUser}
            onSearch={searchRegisteredUser}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar cajero
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar al cajero &quot;{selectedCajero?.nombre}&quot;?
              Esta acción eliminará tanto la cuenta como su perfil de cajero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCajero} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cajeros.length}</p>
              <p className="text-sm text-muted-foreground">Total cajeros</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{perfilesCajero.filter(p => p.turno === 'matutino').length}</p>
              <p className="text-sm text-muted-foreground">Turno matutino</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.65_0.18_35)]/20 to-[oklch(0.65_0.18_35)]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[oklch(0.55_0.18_35)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{perfilesCajero.filter(p => p.turno === 'vespertino').length}</p>
              <p className="text-sm text-muted-foreground">Turno vespertino</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cashiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCajeros.map(cajero => {
          const perfil = getCajeroProfile(cajero.id)
          return (
            <Card key={cajero.id} className="rounded-2xl border-border/50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-4 bg-linear-to-r from-primary/5 to-accent/5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md text-primary-foreground font-bold text-lg">
                    {cajero.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{cajero.nombre}</h3>
                    <p className="text-sm text-muted-foreground truncate">{cajero.correo}</p>
                  </div>
                </div>
              </div>
              {perfil && (
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="capitalize">{perfil.turno}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>${perfil.sueldo.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Desde {new Date(perfil.fecha_ingreso).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[oklch(0.6_0.15_145)]/10 text-[oklch(0.5_0.15_145)]">
                      Activo
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {perfil.horas_semana}h/semana
                    </span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg h-8 w-8"
                      onClick={() => openEditDialog(cajero)}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(cajero)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
