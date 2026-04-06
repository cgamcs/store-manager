"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
  Tags,
  Calendar,
  Percent,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { createDescuento, updateDescuento, toggleDescuento, deleteDescuento } from "./actions"

//  Tipos locales (la BD serializa Date → string vía JSON) ─

type FechaCaducidadDB = {
  id: number
  productoId: number
  fechaCaducidad: string
  cantidad: number
}

type ProductoEnDescuento = {
  id: number
  nombre: string
  sku: string | null
  precioVenta: string | number
  stockActual: number
  esMerma: boolean
  fechasCaducidad: FechaCaducidadDB[]
  categoria: { id: number; nombre: string }
}

type DescuentoProductoDB = {
  descuentoId: number
  productoId: number
  producto: ProductoEnDescuento
}

type DescuentoDB = {
  id: number
  nombre: string
  porcentaje: string | number
  activo: boolean
  fechaInicio: string
  fechaFin: string | null
  productos: DescuentoProductoDB[]
}

type ProductoMermaDB = {
  id: number
  nombre: string
  sku: string | null
  precioVenta: string | number
  stockActual: number
  esMerma: boolean
  fechasCaducidad: FechaCaducidadDB[]
  categoria: { id: number; nombre: string }
}

//  Helpers ──

type FormData = {
  nombre: string
  porcentaje: number
  fechaInicio: string
  fechaFin: string
  activo: boolean
  productosIds: number[]
}

const emptyForm: FormData = {
  nombre: "",
  porcentaje: 10,
  fechaInicio: "",
  fechaFin: "",
  activo: true,
  productosIds: [],
}

function toDateInput(date: string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toISOString().split("T")[0]
}

function formatDate(date: string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getNearestExpiry(fechas: FechaCaducidadDB[]): Date | null {
  if (!fechas.length) return null
  const dates = fechas.map((f) => new Date(f.fechaCaducidad))
  return dates.reduce((a: Date, b: Date) => (a < b ? a : b))
}

function toNum(v: string | number): number {
  return typeof v === "string" ? parseFloat(v) : v
}

//  Formulario 

function DescuentoForm({
  formData,
  setFormData,
  mermaProducts,
  isEdit,
  onSubmit,
  loading,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  mermaProducts: ProductoMermaDB[]
  isEdit?: boolean
  onSubmit: () => void
  loading: boolean
}) {
  const toggleProduct = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      productosIds: prev.productosIds.includes(id)
        ? prev.productosIds.filter((p) => p !== id)
        : [...prev.productosIds, id],
    }))
  }

  const isValid =
    formData.nombre.trim() !== "" &&
    formData.porcentaje >= 1 &&
    formData.porcentaje <= 100 &&
    formData.fechaInicio !== "" &&
    formData.productosIds.length > 0

  return (
    <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Nombre */}
      <div className="space-y-2">
        <Label className="font-medium">Nombre del descuento</Label>
        <Input
          placeholder="Ej: Merma Lácteos Lote A"
          value={formData.nombre}
          onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
          className="h-11 rounded-xl"
        />
      </div>

      {/* Porcentaje */}
      <div className="space-y-2">
        <Label className="font-medium">Porcentaje de descuento</Label>
        <div className="relative">
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.porcentaje}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, porcentaje: parseInt(e.target.value) || 0 }))
            }
            className="h-11 rounded-xl pr-10"
          />
          <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-medium">Fecha inicio</Label>
          <Input
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => setFormData((prev) => ({ ...prev, fechaInicio: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-medium">
            Fecha fin{" "}
            <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
          </Label>
          <Input
            type="date"
            value={formData.fechaFin}
            onChange={(e) => setFormData((prev) => ({ ...prev, fechaFin: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Sin fecha fin, el descuento cierra automáticamente cuando el stock de merma se agote.
      </p>

      {/* Productos elegibles */}
      <div className="space-y-2">
        <Label className="font-medium">Productos próximos a vencer (merma)</Label>
        <div className="bg-muted/30 rounded-xl p-3 max-h-52 overflow-y-auto space-y-2">
          {mermaProducts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Info className="w-5 h-5 mx-auto mb-2" />
              No hay productos marcados como merma
            </div>
          ) : (
            mermaProducts.map((product) => {
              const expiry = getNearestExpiry(product.fechasCaducidad)
              const selected = formData.productosIds.includes(product.id)
              return (
                <div
                  key={product.id}
                  onClick={() => toggleProduct(product.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selected
                      ? "bg-primary/5 border-primary/40"
                      : "bg-card border-border/50 hover:border-primary/20"
                  }`}
                >
                  <Checkbox
                    id={`p-${product.id}`}
                    checked={selected}
                    onCheckedChange={() => toggleProduct(product.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{product.nombre}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>${toNum(product.precioVenta).toFixed(2)}</span>
                      <span>·</span>
                      <span>Stock: {product.stockActual}</span>
                      {expiry && (
                        <>
                          <span>·</span>
                          <span className="text-amber-600 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            Vence: {formatDate(expiry.toISOString())}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formData.productosIds.length} producto(s) seleccionado(s)
        </p>
      </div>

      {/* Activo */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <span className="font-medium text-foreground">Activar inmediatamente</span>
        <Switch
          checked={formData.activo}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
        />
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
        onClick={onSubmit}
        disabled={!isValid || loading}
      >
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear Descuento"}
      </Button>
    </div>
  )
}

//  Componente principal

export default function DescuentosClient({
  initialDescuentos,
  mermaProducts,
}: {
  initialDescuentos: DescuentoDB[]
  mermaProducts: ProductoMermaDB[]
}) {
  const [descuentos, setDescuentos] = useState<DescuentoDB[]>(initialDescuentos)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<DescuentoDB | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  const filtered = useMemo(
    () => descuentos.filter((d) => d.nombre.toLowerCase().includes(searchQuery.toLowerCase())),
    [descuentos, searchQuery]
  )

  const resetForm = () => setFormData(emptyForm)

  // CREATE
  const handleCreate = async () => {
    setLoading(true)
    const result = await createDescuento({
      nombre: formData.nombre,
      porcentaje: formData.porcentaje,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || undefined,
      activo: formData.activo,
      productosIds: formData.productosIds,
    })
    if (result.data) {
      setDescuentos((prev) => [result.data as DescuentoDB, ...prev])
      setIsCreateOpen(false)
      resetForm()
    }
    setLoading(false)
  }

  // EDIT
  const openEdit = (d: DescuentoDB) => {
    setSelected(d)
    setFormData({
      nombre: d.nombre,
      porcentaje: toNum(d.porcentaje),
      fechaInicio: toDateInput(d.fechaInicio),
      fechaFin: toDateInput(d.fechaFin),
      activo: d.activo,
      productosIds: d.productos.map((dp: DescuentoProductoDB) => dp.productoId),
    })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!selected) return
    setLoading(true)
    const result = await updateDescuento(selected.id, {
      nombre: formData.nombre,
      porcentaje: formData.porcentaje,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || undefined,
      activo: formData.activo,
      productosIds: formData.productosIds,
    })
    if (result.data) {
      setDescuentos((prev) =>
        prev.map((d) => (d.id === (result.data as DescuentoDB).id ? (result.data as DescuentoDB) : d))
      )
      setIsEditOpen(false)
      setSelected(null)
      resetForm()
    }
    setLoading(false)
  }

  // TOGGLE
  const handleToggle = async (d: DescuentoDB) => {
    const result = await toggleDescuento(d.id)
    if (result.data) {
      setDescuentos((prev) =>
        prev.map((item) => (item.id === (result.data as DescuentoDB).id ? (result.data as DescuentoDB) : item))
      )
    }
  }

  // DELETE
  const openDelete = (d: DescuentoDB) => {
    setSelected(d)
    setIsDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!selected) return
    setLoading(true)
    const result = await deleteDescuento(selected.id)
    if (result.ok) {
      setDescuentos((prev) => prev.filter((d) => d.id !== selected.id))
      setIsDeleteOpen(false)
      setSelected(null)
    }
    setLoading(false)
  }

  const activos = descuentos.filter((d) => d.activo).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar descuento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 rounded-xl bg-card border-border/50"
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(o) => { setIsCreateOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Descuento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Crear Descuento de Merma</DialogTitle>
            </DialogHeader>
            <DescuentoForm
              formData={formData}
              setFormData={setFormData}
              mermaProducts={mermaProducts}
              onSubmit={handleCreate}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(o) => { setIsEditOpen(o); if (!o) { resetForm(); setSelected(null) } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Editar Descuento</DialogTitle>
          </DialogHeader>
          <DescuentoForm
            formData={formData}
            setFormData={setFormData}
            mermaProducts={mermaProducts}
            isEdit
            onSubmit={handleEdit}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar descuento
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{selected?.nombre}&quot;?
              Los productos asociados dejarán de tener este descuento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={loading}
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
              <Tags className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{descuentos.length}</p>
              <p className="text-sm text-muted-foreground">Total descuentos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl -py-6 border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500/20 to-emerald-400/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activos}</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl -py-6 border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500/20 to-red-400/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mermaProducts.length}</p>
              <p className="text-sm text-muted-foreground">Productos en merma</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de productos elegibles */}
      {mermaProducts.length > 0 && (
        <Card className="rounded-2xl border-amber-200 bg-amber-50/50 shadow-lg dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardHeader className="grid-rows-none">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
              <AlertTriangle className="w-5 h-5" />
              Productos próximos a vencer — elegibles para descuento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mermaProducts.map((product) => {
                const expiry = getNearestExpiry(product.fechasCaducidad)
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">{product.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {product.stockActual} · ${toNum(product.precioVenta).toFixed(2)}
                      </p>
                      {expiry && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Vence: {formatDate(expiry.toISOString())}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de descuentos */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Tags className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay descuentos registrados</p>
            <p className="text-sm mt-1">Crea un descuento para productos próximos a vencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const productNames = d.productos.map((dp: DescuentoProductoDB) => dp.producto.nombre)
            const mermaProductos = d.productos.filter((dp: DescuentoProductoDB) => dp.producto.esMerma)
            const hasMermaAgotada =
              mermaProductos.length > 0 &&
              mermaProductos.every((dp: DescuentoProductoDB) => dp.producto.stockActual === 0)

            return (
              <Card
                key={d.id}
                className={`rounded-2xl -py-6 border-border/50 shadow-lg transition-all ${!d.activo ? "opacity-60" : ""}`}
              >
                <CardContent className="p-0">
                  <div
                    className={`p-4 rounded-t-2xl bg-linear-to-r ${
                      d.activo ? "from-primary/10 to-accent/10" : "from-muted to-muted/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md">
                        <Tags className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <Switch checked={d.activo} onCheckedChange={() => handleToggle(d)} />
                    </div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{d.nombre}</h3>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        -{toNum(d.porcentaje)}%
                      </span>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground mb-1.5">Productos:</p>
                      <div className="flex flex-wrap gap-1">
                        {productNames.slice(0, 3).map((name: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-card px-2 py-0.5 rounded-full border border-border/50"
                          >
                            {name}
                          </span>
                        ))}
                        {productNames.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{productNames.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        {formatDate(d.fechaInicio)}
                        {" → "}
                        {d.fechaFin ? formatDate(d.fechaFin) : "Hasta agotar stock"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      {hasMermaAgotada ? (
                        <Badge className="border-transparent bg-muted text-muted-foreground text-xs">
                          Stock agotado
                        </Badge>
                      ) : d.activo ? (
                        <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="border-transparent bg-muted text-muted-foreground text-xs">
                          Inactivo
                        </Badge>
                      )}
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8"
                        onClick={() => openEdit(d)}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openDelete(d)}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
