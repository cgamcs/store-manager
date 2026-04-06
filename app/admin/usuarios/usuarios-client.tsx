"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Briefcase,
  Lock,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Prisma } from "@/src/generated/prisma/client"
import {
  createCajero,
  updateCajero,
  deleteCajero,
  toggleActivoCajero,
  searchUserByEmail,
} from "./actions"

type CajeroCompleto = Prisma.UsuarioGetPayload<{ include: { perfilCajero: true } }>

const turnos = [
  { value: "matutino", label: "Matutino (6:00 - 14:00)" },
  { value: "vespertino", label: "Vespertino (14:00 - 22:00)" },
  { value: "nocturno", label: "Nocturno (22:00 - 6:00)" },
]

type CajeroFormData = {
  nombre: string
  correo: string
  contrasena: string
  direccion: string
  telefono: string
  nss: string
  rfc: string
  fechaIngreso: string
  sueldo: number
  horasSemana: number
  turno: string
}

const defaultForm: CajeroFormData = {
  nombre: "",
  correo: "",
  contrasena: "",
  direccion: "",
  telefono: "",
  nss: "",
  rfc: "",
  fechaIngreso: "",
  sueldo: 0,
  horasSemana: 48,
  turno: "matutino",
}

function CajeroForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  isPending,
  searchEmail,
  setSearchEmail,
  selectedUser,
  onSearch,
}: {
  formData: CajeroFormData
  setFormData: (data: CajeroFormData) => void
  isEdit?: boolean
  onSubmit: () => void
  isPending: boolean
  searchEmail: string
  setSearchEmail: (value: string) => void
  selectedUser: CajeroCompleto | null
  onSearch: () => void
}) {
  return (
    <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2">
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
              <Button variant="outline" onClick={onSearch} className="rounded-lg">
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
            {!isEdit && !selectedUser && (
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Mínimo 6 caracteres (por defecto: cajero123)"
                    value={formData.contrasena}
                    onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                    className="pl-10 h-10 rounded-lg"
                  />
                </div>
              </div>
            )}
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
              value={formData.fechaIngreso}
              onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
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
              value={formData.horasSemana}
              onChange={(e) => setFormData({ ...formData, horasSemana: parseInt(e.target.value) || 0 })}
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
              {turnos.map((t) => (
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
        disabled={isPending || (isEdit ? !formData.nombre : !selectedUser && !formData.nombre)}
      >
        {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar Cajero"}
      </Button>
    </div>
  )
}

export default function UsuariosClient({ initialCajeros }: { initialCajeros: CajeroCompleto[] }) {
  const router = useRouter()
  const [cajeros, setCajeros] = useState<CajeroCompleto[]>(initialCajeros)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CajeroCompleto | null>(null)
  const [selectedCajero, setSelectedCajero] = useState<CajeroCompleto | null>(null)
  const [formData, setFormData] = useState<CajeroFormData>(defaultForm)
  const [isPending, setIsPending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    setCajeros(initialCajeros)
  }, [initialCajeros])

  const filteredCajeros = cajeros.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData(defaultForm)
    setSelectedUser(null)
    setSearchEmail("")
  }

  const handleSearch = async () => {
    if (!searchEmail) return
    const found = await searchUserByEmail(searchEmail)
    setSelectedUser(found)
    if (found) {
      setFormData((prev) => ({ ...prev, nombre: found.nombre, correo: found.correo }))
    }
  }

  const handleCreateCajero = async () => {
    setIsPending(true)
    try {
      const result = await createCajero({
        nombre: selectedUser ? selectedUser.nombre : formData.nombre,
        correo: selectedUser ? selectedUser.correo : formData.correo,
        contrasena: formData.contrasena || undefined,
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        turno: formData.turno,
        nss: formData.nss || undefined,
        rfc: formData.rfc || undefined,
        fechaIngreso: formData.fechaIngreso || undefined,
        sueldo: formData.sueldo || undefined,
        horasSemana: formData.horasSemana || undefined,
      })
      if ("ok" in result) {
        setIsDialogOpen(false)
        resetForm()
        router.refresh()
      }
    } finally {
      setIsPending(false)
    }
  }

  const openEditDialog = (cajero: CajeroCompleto) => {
    setSelectedCajero(cajero)
    const p = cajero.perfilCajero
    setFormData({
      nombre: cajero.nombre,
      correo: cajero.correo,
      contrasena: "",
      direccion: p?.direccion ?? "",
      telefono: p?.telefono ?? "",
      nss: p?.nss ?? "",
      rfc: p?.rfc ?? "",
      fechaIngreso: p?.fechaIngreso ? new Date(p.fechaIngreso).toISOString().split("T")[0] : "",
      sueldo: p?.sueldo ? Number(p.sueldo) : 0,
      horasSemana: p?.horasSemana ?? 48,
      turno: p?.turno ?? "matutino",
    })
    setIsEditDialogOpen(true)
  }

  const handleEditCajero = async () => {
    if (!selectedCajero) return
    setIsPending(true)
    try {
      const result = await updateCajero(selectedCajero.id, {
        nombre: formData.nombre,
        correo: formData.correo,
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        turno: formData.turno,
        nss: formData.nss || undefined,
        rfc: formData.rfc || undefined,
        fechaIngreso: formData.fechaIngreso || undefined,
        sueldo: formData.sueldo || undefined,
        horasSemana: formData.horasSemana || undefined,
      })
      if ("ok" in result) {
        setIsEditDialogOpen(false)
        setSelectedCajero(null)
        resetForm()
        router.refresh()
      }
    } finally {
      setIsPending(false)
    }
  }

  const openDeleteDialog = (cajero: CajeroCompleto) => {
    setSelectedCajero(cajero)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteCajero = async () => {
    if (!selectedCajero) return
    setIsPending(true)
    try {
      const result = await deleteCajero(selectedCajero.id)
      if ("error" in result) {
        setDeleteError(result.error ?? "Error al eliminar")
        return
      }
      setCajeros((prev) => prev.filter((c) => c.id !== selectedCajero.id))
      setIsDeleteDialogOpen(false)
      setSelectedCajero(null)
      setDeleteError(null)
    } finally {
      setIsPending(false)
    }
  }

  const handleToggleActivo = async (cajero: CajeroCompleto) => {
    const result = await toggleActivoCajero(cajero.id)
    if ("ok" in result) {
      const nuevoActivo = result.activo ?? false
      setCajeros((prev) =>
        prev.map((c) =>
          c.id === cajero.id && c.perfilCajero
            ? { ...c, perfilCajero: { ...c.perfilCajero, activo: nuevoActivo } }
            : c
        )
      )
    }
  }

  const totalMatutino = cajeros.filter((c) => c.perfilCajero?.turno === "matutino").length
  const totalVespertino = cajeros.filter((c) => c.perfilCajero?.turno === "vespertino").length

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
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
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
              isPending={isPending}
              searchEmail={searchEmail}
              setSearchEmail={setSearchEmail}
              selectedUser={selectedUser}
              onSearch={handleSearch}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            resetForm()
            setSelectedCajero(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Editar Cajero</DialogTitle>
          </DialogHeader>
          <CajeroForm
            formData={formData}
            setFormData={setFormData}
            isEdit
            onSubmit={handleEditCajero}
            isPending={isPending}
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
            selectedUser={selectedUser}
            onSearch={handleSearch}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setDeleteError(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar cajero
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteError
                ? deleteError
                : <>¿Estás seguro de que deseas eliminar al cajero &quot;{selectedCajero?.nombre}&quot;? Esta acción eliminará tanto la cuenta como su perfil de cajero.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleDeleteCajero}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isPending}
            >
              {isPending ? "Eliminando..." : "Eliminar"}
            </Button>
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
              <p className="text-2xl font-bold text-foreground">{totalMatutino}</p>
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
              <p className="text-2xl font-bold text-foreground">{totalVespertino}</p>
              <p className="text-sm text-muted-foreground">Turno vespertino</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cashiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCajeros.map((cajero) => {
          const perfil = cajero.perfilCajero
          return (
            <Card
              key={cajero.id}
              className="rounded-2xl -py-6 border-border/50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-4 bg-linear-to-r from-primary/5 to-accent/5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md text-primary-foreground font-bold text-lg">
                    {cajero.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{cajero.nombre}</h3>
                    <p className="text-sm text-muted-foreground truncate">{cajero.correo}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span className="capitalize">{perfil?.turno ?? "—"}</span>
                  </div>
                  {perfil?.sueldo != null && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>${Number(perfil.sueldo).toLocaleString("es-MX")}</span>
                    </div>
                  )}
                  {perfil?.fechaIngreso && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        Desde {new Date(perfil.fechaIngreso).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                  {perfil ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      perfil.activo
                        ? "bg-[oklch(0.6_0.15_145)]/10 text-[oklch(0.5_0.15_145)]"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {perfil.activo ? "Activo" : "Inactivo"}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Sin perfil
                    </span>
                  )}
                  {perfil?.horasSemana != null && (
                    <span className="text-xs text-muted-foreground">
                      {perfil.horasSemana}h/semana
                    </span>
                  )}
                  <div className="flex-1" />
                  {perfil && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-lg h-8 w-8 ${
                        perfil.activo
                          ? "hover:text-destructive hover:bg-destructive/10"
                          : "hover:text-[oklch(0.5_0.15_145)] hover:bg-[oklch(0.6_0.15_145)]/10"
                      }`}
                      onClick={() => handleToggleActivo(cajero)}
                      title={perfil.activo ? "Desactivar acceso" : "Activar acceso"}
                    >
                      {perfil.activo
                        ? <ToggleRight className="w-4 h-4 text-[oklch(0.5_0.15_145)]" />
                        : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      }
                    </Button>
                  )}
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
            </Card>
          )
        })}
      </div>
    </div>
  )
}
