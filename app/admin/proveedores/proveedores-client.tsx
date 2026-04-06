"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Truck,
  Mail,
  Phone,
  User,
  Edit,
  Trash2,
  Building,
  MapPin,
  Clock,
  CreditCard,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react"
import {
  createProvider,
  updateProvider,
  deleteProvider,
} from "./actions"

type ProveedorDB = {
  id: number
  codigo: string
  nombreComercial: string
  razonSocial: string
  rfc: string
  contacto: string
  correo: string
  telefono: string
  direccion: string
  cantidadMinimaOrden: number | string
  tiempoEntregaDias: number
  plazoPago: string
  metodosPago: string[]
}

type ProveedorFormData = {
  codigo: string
  nombreComercial: string
  razonSocial: string
  rfc: string
  contacto: string
  correo: string
  telefono: string
  direccion: string
  cantidadMinimaOrden: string
  tiempoEntregaDias: string
  plazoPago: string
  metodosPago: string[]
}

const metodosPagoOptions = ["Efectivo", "Transferencia", "Cheque", "Crédito", "Tarjeta"]

const emptyForm: ProveedorFormData = {
  codigo: "",
  nombreComercial: "",
  razonSocial: "",
  rfc: "",
  contacto: "",
  correo: "",
  telefono: "",
  direccion: "",
  cantidadMinimaOrden: "",
  tiempoEntregaDias: "1",
  plazoPago: "",
  metodosPago: [],
}

function toNumber(val: number | string): number {
  return typeof val === "string" ? parseFloat(val) : val
}

function generateCodigo(proveedores: ProveedorDB[]): string {
  const nums = proveedores
    .map((p) => parseInt((p.codigo ?? "").replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `PROV${next.toString().padStart(3, "0")}`
}

function ProveedorForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  loading,
  codigoPlaceholder,
  errorMsg,
}: {
  formData: ProveedorFormData
  setFormData: React.Dispatch<React.SetStateAction<ProveedorFormData>>
  isEdit?: boolean
  onSubmit: () => void
  loading: boolean
  codigoPlaceholder: string
  errorMsg?: string
}) {
  const toggleMetodoPago = (metodo: string) => {
    setFormData((prev) => ({
      ...prev,
      metodosPago: prev.metodosPago.includes(metodo)
        ? prev.metodosPago.filter((m) => m !== metodo)
        : [...prev.metodosPago, metodo],
    }))
  }

  const isValid =
    (formData.nombreComercial ?? "").trim() !== "" &&
    (formData.razonSocial ?? "").trim() !== "" &&
    (formData.rfc ?? "").trim() !== "" &&
    (formData.contacto ?? "").trim() !== "" &&
    (formData.correo ?? "").trim() !== "" &&
    (formData.telefono ?? "").trim() !== "" &&
    (formData.direccion ?? "").trim() !== "" &&
    (formData.cantidadMinimaOrden ?? "").toString().trim() !== "" &&
    (formData.plazoPago ?? "").trim() !== "" &&
    (formData.metodosPago ?? []).length > 0

  return (
    <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-2">
      {errorMsg && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{errorMsg}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Código de proveedor</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isEdit ? "" : codigoPlaceholder}
              value={formData.codigo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, codigo: e.target.value.toUpperCase() }))
              }
              className="pl-10 h-11 rounded-xl uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">RFC/NIT</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ABC123456XY1"
              value={formData.rfc}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rfc: e.target.value.toUpperCase() }))
              }
              className="pl-10 h-11 rounded-xl uppercase"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Nombre comercial</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Distribuidora ABC"
            value={formData.nombreComercial}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nombreComercial: e.target.value }))
            }
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Razón social</Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Distribuidora ABC SA de CV"
            value={formData.razonSocial}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, razonSocial: e.target.value }))
            }
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Persona de contacto</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Juan Pérez"
              value={formData.contacto}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, contacto: e.target.value }))
              }
              className="pl-10 h-11 rounded-xl"
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, telefono: e.target.value }))
              }
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="contacto@empresa.com"
            value={formData.correo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, correo: e.target.value }))
            }
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Dirección física</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Calle, Número, Colonia, Ciudad"
            value={formData.direccion}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, direccion: e.target.value }))
            }
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Cantidad mínima de orden</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="5000"
              value={formData.cantidadMinimaOrden}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cantidadMinimaOrden: e.target.value }))
              }
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground font-medium">Tiempo de entrega (días)</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              min="1"
              value={formData.tiempoEntregaDias}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tiempoEntregaDias: e.target.value }))
              }
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Plazo de pago</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="30 días, Contado, 15 días, etc."
            value={formData.plazoPago}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, plazoPago: e.target.value }))
            }
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-foreground font-medium">Métodos de pago aceptados</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {metodosPagoOptions.map((metodo) => (
            <div
              key={metodo}
              className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50"
            >
              <Checkbox
                id={`metodo-${metodo}`}
                checked={(formData.metodosPago ?? []).includes(metodo)}
                onCheckedChange={() => toggleMetodoPago(metodo)}
              />
              <label
                htmlFor={`metodo-${metodo}`}
                className="text-sm cursor-pointer flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                {metodo}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
        onClick={onSubmit}
        disabled={!isValid || loading}
      >
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar Proveedor"}
      </Button>
    </div>
  )
}

export default function ProveedoresClient({
  initialProveedores,
}: {
  initialProveedores: ProveedorDB[]
}) {
  const [proveedores, setProveedores] = useState<ProveedorDB[]>(initialProveedores)
  const [loadingAction, setLoadingAction] = useState(false)
  const [actionError, setActionError] = useState<string | undefined>()

  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState<ProveedorDB | null>(null)
  const [formData, setFormData] = useState<ProveedorFormData>(emptyForm)

  const filteredProveedores = proveedores.filter(
    (p) =>
      p.nombreComercial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contacto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const resetForm = () => {
    setFormData(emptyForm)
    setActionError(undefined)
  }

  // CREATE
  const handleCreate = async () => {
    setLoadingAction(true)
    setActionError(undefined)
    try {
      const result = await createProvider({
        codigo: formData.codigo || generateCodigo(proveedores),
        nombreComercial: formData.nombreComercial,
        razonSocial: formData.razonSocial,
        rfc: formData.rfc,
        contacto: formData.contacto,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        cantidadMinimaOrden: parseFloat(formData.cantidadMinimaOrden) || 0,
        tiempoEntregaDias: parseInt(formData.tiempoEntregaDias) || 1,
        plazoPago: formData.plazoPago,
        metodosPago: formData.metodosPago,
      })
      if (result.error) {
        setActionError(result.error)
      } else if (result.data) {
        setProveedores((prev) => [...prev, result.data!])
        setIsDialogOpen(false)
        resetForm()
      }
    } catch {
      setActionError("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setLoadingAction(false)
    }
  }

  // EDIT
  const openEdit = (proveedor: ProveedorDB) => {
    setSelectedProveedor(proveedor)
    setFormData({
      codigo: proveedor.codigo ?? "",
      nombreComercial: proveedor.nombreComercial ?? "",
      razonSocial: proveedor.razonSocial ?? "",
      rfc: proveedor.rfc ?? "",
      contacto: proveedor.contacto ?? "",
      correo: proveedor.correo ?? "",
      telefono: proveedor.telefono ?? "",
      direccion: proveedor.direccion ?? "",
      cantidadMinimaOrden: toNumber(proveedor.cantidadMinimaOrden ?? 0).toString(),
      tiempoEntregaDias: (proveedor.tiempoEntregaDias ?? 1).toString(),
      plazoPago: proveedor.plazoPago ?? "",
      metodosPago: proveedor.metodosPago ?? [],
    })
    setActionError(undefined)
    setIsEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedProveedor) return
    setLoadingAction(true)
    setActionError(undefined)
    try {
      const result = await updateProvider(selectedProveedor.id, {
        codigo: formData.codigo,
        nombreComercial: formData.nombreComercial,
        razonSocial: formData.razonSocial,
        rfc: formData.rfc,
        contacto: formData.contacto,
        correo: formData.correo,
        telefono: formData.telefono,
        direccion: formData.direccion,
        cantidadMinimaOrden: parseFloat(formData.cantidadMinimaOrden) || 0,
        tiempoEntregaDias: parseInt(formData.tiempoEntregaDias) || 1,
        plazoPago: formData.plazoPago,
        metodosPago: formData.metodosPago,
      })
      if (result.error) {
        setActionError(result.error)
      } else if (result.data) {
        setProveedores((prev) =>
          prev.map((p) => (p.id === result.data!.id ? result.data! : p))
        )
        setIsEditDialogOpen(false)
        setSelectedProveedor(null)
        resetForm()
      }
    } catch {
      setActionError("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setLoadingAction(false)
    }
  }

  // DELETE
  const openDelete = (proveedor: ProveedorDB) => {
    setSelectedProveedor(proveedor)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProveedor) return
    setLoadingAction(true)
    const result = await deleteProvider(selectedProveedor.id)
    if (result.ok) {
      setProveedores((prev) => prev.filter((p) => p.id !== selectedProveedor.id))
      setIsDeleteDialogOpen(false)
      setSelectedProveedor(null)
    }
    setLoadingAction(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar proveedor..."
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
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Agregar Proveedor
              </DialogTitle>
            </DialogHeader>
            <ProveedorForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              loading={loadingAction}
              codigoPlaceholder={generateCodigo(proveedores)}
              errorMsg={actionError}
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
            setSelectedProveedor(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Editar Proveedor
            </DialogTitle>
          </DialogHeader>
          <ProveedorForm
            formData={formData}
            setFormData={setFormData}
            isEdit
            onSubmit={handleEdit}
            loading={loadingAction}
            codigoPlaceholder=""
            errorMsg={actionError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar proveedor
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a &quot;{selectedProveedor?.nombreComercial}&quot;?
              Esta acción no se puede deshacer y los productos asociados quedarán sin proveedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loadingAction}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl -py-6 border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{proveedores.length}</p>
              <p className="text-sm text-muted-foreground">Total proveedores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl -py-6 border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <Building className="w-6 h-6 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{proveedores.length}</p>
              <p className="text-sm text-muted-foreground">Proveedores activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl -py-6 border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.65_0.18_35)]/20 to-[oklch(0.65_0.18_35)]/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[oklch(0.55_0.18_35)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {proveedores.filter((p) => (p.metodosPago ?? []).includes("Transferencia")).length}
              </p>
              <p className="text-sm text-muted-foreground">Aceptan transferencia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proveedores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProveedores.map((proveedor) => (
          <Card
            key={proveedor.id}
            className="rounded-2xl -py-6 border-border/50 shadow-lg hover:shadow-xl transition-shadow"
          >
            <CardContent className="p-0">
              <div className="p-4 border-b border-border/50 bg-linear-to-r from-primary/5 to-accent/5 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md">
                    <Truck className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">
                      {proveedor.nombreComercial}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {proveedor.codigo} | {proveedor.rfc}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <User className="w-4 h-4 shrink-0" />
                    <span className="truncate">{proveedor.contacto}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="truncate">{proveedor.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm col-span-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{proveedor.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm col-span-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{proveedor.direccion}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Min: ${toNumber(proveedor.cantidadMinimaOrden).toLocaleString()}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {proveedor.tiempoEntregaDias} días entrega
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {proveedor.plazoPago}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(proveedor.metodosPago ?? []).map((metodo) => (
                    <span
                      key={metodo}
                      className="text-[10px] bg-[oklch(0.6_0.15_145)]/10 text-[oklch(0.5_0.15_145)] px-2 py-0.5 rounded"
                    >
                      {metodo}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => openEdit(proveedor)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg h-9 w-9 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => openDelete(proveedor)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
