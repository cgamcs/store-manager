"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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
  Tags,
  Calendar,
  Percent,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
  Info
} from "lucide-react"
import { descuentos as initialDescuentos, productos } from "@/lib/mock-data"
import type { Descuento, Producto } from "@/lib/types"

type DescuentoFormData = {
  nombre: string
  porcentaje: number
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  productos_ids: number[]
}

function DescuentoForm({
  formData,
  setFormData,
  isEdit = false,
  onSubmit,
  toggleProductSelection,
  eligibleProducts,
}: {
  formData: DescuentoFormData
  setFormData: (data: DescuentoFormData) => void
  isEdit?: boolean
  onSubmit: () => void
  toggleProductSelection: (productId: number) => void
  eligibleProducts: Producto[]
}) {
  return (
    <div className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label className="text-foreground font-medium">Nombre del descuento</Label>
        <Input
          placeholder="Ej: Merma Lácteos Lote A"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="h-11 rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground font-medium">Porcentaje de descuento</Label>
        <div className="relative">
          <Input
            type="number"
            min="1"
            max="100"
            value={formData.porcentaje}
            onChange={(e) => setFormData({ ...formData, porcentaje: parseInt(e.target.value) || 0 })}
            className="h-11 rounded-xl pr-10"
          />
          <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Fecha inicio</Label>
          <Input
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Fecha fin</Label>
          <Input
            type="date"
            value={formData.fecha_fin}
            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            className="h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-foreground font-medium">Productos con este descuento</Label>
        <div className="bg-muted/30 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
          {eligibleProducts.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <Info className="w-5 h-5 mx-auto mb-2" />
              No hay productos elegibles para descuento
            </div>
          ) : (
            eligibleProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 bg-card rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
              >
                <Checkbox
                  id={`product-${product.id}`}
                  checked={formData.productos_ids.includes(product.id)}
                  onCheckedChange={() => toggleProductSelection(product.id)}
                />
                <label
                  htmlFor={`product-${product.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <p className="font-medium text-foreground text-sm">{product.nombre}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>${product.precio_venta}</span>
                    {product.es_merma && (
                      <span className="bg-[oklch(0.75_0.15_75)]/20 text-[oklch(0.55_0.15_75)] px-1.5 py-0.5 rounded">Merma</span>
                    )}
                    {product.stock_actual <= product.stock_minimo && (
                      <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">Stock bajo</span>
                    )}
                  </div>
                </label>
              </div>
            ))
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formData.productos_ids.length} producto(s) seleccionado(s)
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <span className="font-medium text-foreground">Activar inmediatamente</span>
        <Switch
          checked={formData.activo}
          onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
        />
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
        onClick={onSubmit}
        disabled={!formData.nombre || !formData.fecha_inicio || !formData.fecha_fin || formData.productos_ids.length === 0}
      >
        {isEdit ? 'Guardar cambios' : 'Crear Descuento'}
      </Button>
    </div>
  )
}

export default function DescuentosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [localDescuentos, setLocalDescuentos] = useState(initialDescuentos)
  const [selectedDescuento, setSelectedDescuento] = useState<Descuento | null>(null)
  const [formData, setFormData] = useState<DescuentoFormData>({
    nombre: "",
    porcentaje: 10,
    fecha_inicio: "",
    fecha_fin: "",
    activo: true,
    productos_ids: []
  })

  // Products that can have discounts (marked as merma or low stock)
  const eligibleProducts = productos.filter(p => p.es_merma || p.stock_actual <= p.stock_minimo)

  const filteredDescuentos = localDescuentos.filter(d =>
    d.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleDescuento = (id: number) => {
    setLocalDescuentos(prev => prev.map(d =>
      d.id === id ? { ...d, activo: !d.activo } : d
    ))
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      porcentaje: 10,
      fecha_inicio: "",
      fecha_fin: "",
      activo: true,
      productos_ids: []
    })
  }

  const handleCreateDescuento = () => {
    const newId = Math.max(...localDescuentos.map(d => d.id), 0) + 1
    setLocalDescuentos([...localDescuentos, {
      id: newId,
      nombre: formData.nombre,
      porcentaje: formData.porcentaje,
      fecha_inicio: new Date(formData.fecha_inicio),
      fecha_fin: new Date(formData.fecha_fin),
      activo: formData.activo,
      productos_ids: formData.productos_ids
    }])
    setIsDialogOpen(false)
    resetForm()
  }

  const openEditDialog = (descuento: Descuento) => {
    setSelectedDescuento(descuento)
    setFormData({
      nombre: descuento.nombre,
      porcentaje: descuento.porcentaje,
      fecha_inicio: new Date(descuento.fecha_inicio).toISOString().split('T')[0],
      fecha_fin: new Date(descuento.fecha_fin).toISOString().split('T')[0],
      activo: descuento.activo,
      productos_ids: descuento.productos_ids
    })
    setIsEditDialogOpen(true)
  }

  const handleEditDescuento = () => {
    if (selectedDescuento) {
      setLocalDescuentos(prev => prev.map(d =>
        d.id === selectedDescuento.id ? {
          ...d,
          nombre: formData.nombre,
          porcentaje: formData.porcentaje,
          fecha_inicio: new Date(formData.fecha_inicio),
          fecha_fin: new Date(formData.fecha_fin),
          activo: formData.activo,
          productos_ids: formData.productos_ids
        } : d
      ))
    }
    setIsEditDialogOpen(false)
    setSelectedDescuento(null)
    resetForm()
  }

  const openDeleteDialog = (descuento: Descuento) => {
    setSelectedDescuento(descuento)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteDescuento = () => {
    if (selectedDescuento) {
      setLocalDescuentos(prev => prev.filter(d => d.id !== selectedDescuento.id))
    }
    setIsDeleteDialogOpen(false)
    setSelectedDescuento(null)
  }

  const toggleProductSelection = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      productos_ids: prev.productos_ids.includes(productId)
        ? prev.productos_ids.filter(id => id !== productId)
        : [...prev.productos_ids, productId]
    }))
  }

  const getProductNames = (productIds: number[]) => {
    return productIds.map(id => productos.find(p => p.id === id)?.nombre).filter(Boolean)
  }

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
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Descuento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Crear Descuento</DialogTitle>
            </DialogHeader>
            <DescuentoForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateDescuento}
              toggleProductSelection={toggleProductSelection}
              eligibleProducts={eligibleProducts}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { resetForm(); setSelectedDescuento(null); }}}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Editar Descuento</DialogTitle>
          </DialogHeader>
          <DescuentoForm
            formData={formData}
            setFormData={setFormData}
            isEdit
            onSubmit={handleEditDescuento}
            toggleProductSelection={toggleProductSelection}
            eligibleProducts={eligibleProducts}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar descuento
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el descuento &quot;{selectedDescuento?.nombre}&quot;?
              Los productos asociados ya no tendrán este descuento aplicado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDescuento} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Eligible Products Alert */}
      <Card className="rounded-2xl border-[oklch(0.75_0.15_75)]/30 bg-[oklch(0.75_0.15_75)]/5 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-[oklch(0.55_0.15_75)]">
            <AlertTriangle className="w-5 h-5" />
            Productos Elegibles para Descuento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Estos productos están marcados como merma o tienen stock bajo y pueden venderse con descuento.
          </p>
          {eligibleProducts.length === 0 ? (
            <p className="text-muted-foreground">No hay productos marcados como merma o con stock bajo</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {eligibleProducts.map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-[oklch(0.75_0.15_75)]/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[oklch(0.55_0.15_75)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.nombre}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">${product.precio_venta.toFixed(2)}</p>
                      {product.es_merma && (
                        <span className="text-[10px] bg-[oklch(0.75_0.15_75)]/30 text-[oklch(0.45_0.15_75)] px-1.5 py-0.5 rounded">Merma</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descuentos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDescuentos.map(descuento => {
          const productNames = getProductNames(descuento.productos_ids)
          return (
            <Card key={descuento.id} className={`rounded-2xl border-border/50 shadow-lg transition-all ${descuento.activo ? '' : 'opacity-60'}`}>
              <CardContent className="p-0">
                <div className={`p-4 rounded-t-2xl bg-linear-to-r ${descuento.activo ? 'from-primary/10 to-accent/10' : 'from-muted to-muted/80'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-md">
                      <Tags className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <Switch
                      checked={descuento.activo}
                      onCheckedChange={() => toggleDescuento(descuento.id)}
                    />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{descuento.nombre}</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">-{descuento.porcentaje}%</span>
                  </div>

                  {/* Associated Products */}
                  <div className="bg-muted/30 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-1">Productos asociados:</p>
                    <div className="flex flex-wrap gap-1">
                      {productNames.slice(0, 3).map((name, idx) => (
                        <span key={idx} className="text-xs bg-card px-2 py-0.5 rounded-full border border-border/50">
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
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(descuento.fecha_inicio).toLocaleDateString('es-MX')} - {new Date(descuento.fecha_fin).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${descuento.activo ? 'bg-[oklch(0.6_0.15_145)]/10 text-[oklch(0.5_0.15_145)]' : 'bg-muted text-muted-foreground'}`}>
                      {descuento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg h-8 w-8"
                      onClick={() => openEditDialog(descuento)}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(descuento)}
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
    </div>
  )
}
