"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  AlertTriangle,
  Tag,
  DollarSign,
  TrendingUp,
  Barcode,
} from "lucide-react"
import {
  getProducts,
  getCategoriasAndProveedores,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./actions"

type CategoriaDB = {
  id: number
  nombre: string
  porcentajeGanancia: number | string
}

type ProveedorDB = {
  id: number
  nombreComercial: string
}

type ProductoDB = {
  id: number
  nombre: string
  sku: string | null
  categoriaId: number
  proveedorId: number
  precioCompra: number | string
  precioVenta: number | string
  stockActual: number
  stockMinimo: number
  categoria: CategoriaDB
  proveedor: ProveedorDB
}

type FormData = {
  nombre: string
  sku: string
  categoriaId: string
  proveedorId: string
  precioCompra: string
  precioVenta: string
  stockActual: string
  stockMinimo: string
}

const emptyForm: FormData = {
  nombre: "",
  sku: "",
  categoriaId: "",
  proveedorId: "",
  precioCompra: "",
  precioVenta: "",
  stockActual: "",
  stockMinimo: "10",
}

function toNumber(val: number | string): number {
  return typeof val === "string" ? parseFloat(val) : val
}

function generateSKU(nombre: string, existingSKUs: string[]): string {
  const words = nombre.trim().split(/\s+/)
  let prefix = words[0].substring(0, 3).toUpperCase()
  prefix = prefix.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  let counter = 1
  let sku = `${prefix}-${counter.toString().padStart(5, "0")}`
  while (existingSKUs.includes(sku)) {
    counter++
    sku = `${prefix}-${counter.toString().padStart(5, "0")}`
  }
  return sku
}

function ProductoForm({
  formData,
  setFormData,
  categorias,
  proveedores,
  existingSKUs,
  isEdit,
  onSubmit,
  loading,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  categorias: CategoriaDB[]
  proveedores: ProveedorDB[]
  existingSKUs: string[]
  isEdit?: boolean
  onSubmit: () => void
  loading: boolean
}) {
  const selectedCategoria = categorias.find((c) => c.id.toString() === formData.categoriaId)
  const margen = selectedCategoria ? toNumber(selectedCategoria.porcentajeGanancia) : null
  const precioCompraNum = parseFloat(formData.precioCompra) || 0
  const precioSugerido =
    margen !== null && precioCompraNum > 0
      ? (precioCompraNum * (1 + margen / 100)).toFixed(2)
      : null

  // autoSku: mientras true, el SKU se genera automáticamente al cambiar el nombre
  const [autoSku, setAutoSku] = useState(!isEdit)
  const [autoPrice, setAutoPrice] = useState(true)

  // Auto-generate SKU — corre en create Y edit, sólo si autoSku está activo
  useEffect(() => {
    if (!autoSku || formData.nombre.trim().length < 2) return
    setFormData((prev) => ({
      ...prev,
      sku: generateSKU(prev.nombre, existingSKUs),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nombre, autoSku])

  // Auto-fill precio venta
  useEffect(() => {
    if (!autoPrice || precioSugerido === null) return
    setFormData((prev) => ({ ...prev, precioVenta: precioSugerido }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precioSugerido, autoPrice])

  const handleCategoriaChange = (v: string) => {
    setAutoPrice(true)
    setFormData((prev) => ({ ...prev, categoriaId: v, precioVenta: "" }))
  }

  const handlePrecioCompraChange = (v: string) => {
    setAutoPrice(true)
    setFormData((prev) => ({ ...prev, precioCompra: v }))
  }

  const handlePrecioVentaChange = (v: string) => {
    setAutoPrice(false)
    setFormData((prev) => ({ ...prev, precioVenta: v }))
  }

  const handleSkuChange = (v: string) => {
    setAutoSku(false)
    setFormData((prev) => ({ ...prev, sku: v }))
  }

  const handleRegenSku = () => {
    setAutoSku(true)
    if (formData.nombre.trim().length >= 2) {
      setFormData((prev) => ({ ...prev, sku: generateSKU(prev.nombre, existingSKUs) }))
    }
  }

  const isValid =
    formData.nombre.trim() !== "" &&
    formData.sku.trim() !== "" &&
    formData.categoriaId !== "" &&
    formData.proveedorId !== "" &&
    parseFloat(formData.precioCompra) > 0 &&
    parseFloat(formData.precioVenta) > 0 &&
    parseInt(formData.stockActual) >= 0

  return (
    <div className="space-y-4 mt-4 max-h-[65vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="col-span-2 space-y-2">
          <Label className="font-medium">Nombre del producto</Label>
          <Input
            placeholder="Arroz 1kg"
            value={formData.nombre}
            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>

        {/* SKU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-medium">SKU</Label>
            {!autoSku && (
              <button
                type="button"
                onClick={handleRegenSku}
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                Regenerar desde nombre
              </button>
            )}
          </div>
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ARR-00001"
              value={formData.sku}
              onChange={(e) => handleSkuChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          {autoSku && formData.sku && (
            <p className="text-xs text-muted-foreground">Generado automáticamente. Puedes editarlo.</p>
          )}
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label className="font-medium">Categoría</Label>
          <Select value={formData.categoriaId} onValueChange={handleCategoriaChange}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre} (+{toNumber(cat.porcentajeGanancia)}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Proveedor */}
        <div className="col-span-2 space-y-2">
          <Label className="font-medium">Proveedor</Label>
          <Select
            value={formData.proveedorId}
            onValueChange={(v) => setFormData((prev) => ({ ...prev, proveedorId: v }))}
          >
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.nombreComercial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precio Compra */}
        <div className="space-y-2">
          <Label className="font-medium">Precio Compra</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.precioCompra}
              onChange={(e) => handlePrecioCompraChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
        </div>

        {/* Stock Actual */}
        <div className="space-y-2">
          <Label className="font-medium">Stock Actual</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={formData.stockActual}
            onChange={(e) => setFormData((prev) => ({ ...prev, stockActual: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Stock Mínimo */}
        <div className="space-y-2">
          <Label className="font-medium">Stock Mínimo</Label>
          <Input
            type="number"
            min="0"
            placeholder="10"
            value={formData.stockMinimo}
            onChange={(e) => setFormData((prev) => ({ ...prev, stockMinimo: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Precio Venta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Precio de Venta</Label>
            {precioSugerido && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                {margen}% → ${precioSugerido}
              </span>
            )}
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.precioVenta}
              onChange={(e) => handlePrecioVentaChange(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          {precioSugerido && formData.precioVenta !== precioSugerido && formData.precioVenta !== "" && (
            <p className="text-xs text-[oklch(0.6_0.15_75)]">
              Modificado. Sugerido: ${precioSugerido}
            </p>
          )}
          {precioSugerido && formData.precioVenta === precioSugerido && (
            <p className="text-xs text-[oklch(0.5_0.15_145)]">
              Calculado automáticamente. Puedes modificarlo.
            </p>
          )}
        </div>
      </div>

      <Button
        className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
        onClick={onSubmit}
        disabled={!isValid || loading}
      >
        {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar Producto"}
      </Button>
    </div>
  )
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoDB[]>([])
  const [categorias, setCategorias] = useState<CategoriaDB[]>([])
  const [proveedores, setProveedores] = useState<ProveedorDB[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<ProductoDB | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)

  // Fetch initial data
  useEffect(() => {
    async function load() {
      setLoadingData(true)
      try {
        const [productos, { categorias, proveedores }] = await Promise.all([
          getProducts(),
          getCategoriasAndProveedores(),
        ])
        setProductos(productos)
        setCategorias(categorias)
        setProveedores(proveedores)
      } catch {
        // unauthorized or server error — leave lists empty
      }
      setLoadingData(false)
    }
    load()
  }, [])

  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = p.nombre.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === "all" || p.categoriaId === parseInt(selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [productos, searchQuery, selectedCategory])

  const resetForm = () => setFormData(emptyForm)

  // CREATE
  const handleCreate = async () => {
    setLoadingAction(true)
    const result = await createProduct({
      nombre: formData.nombre,
      sku: formData.sku,
      categoriaId: formData.categoriaId,
      proveedorId: formData.proveedorId,
      precioCompra: parseFloat(formData.precioCompra),
      precioVenta: parseFloat(formData.precioVenta),
      stockActual: parseInt(formData.stockActual),
      stockMinimo: parseInt(formData.stockMinimo),
    })
    if (result.data) {
      setProductos((prev) => [...prev, result.data!])
      setIsDialogOpen(false)
      resetForm()
    }
    setLoadingAction(false)
  }

  // EDIT
  const openEdit = (producto: ProductoDB) => {
    setSelectedProducto(producto)
    setFormData({
      nombre: producto.nombre,
      sku: producto.sku ?? "",
      categoriaId: producto.categoriaId.toString(),
      proveedorId: producto.proveedorId.toString(),
      precioCompra: toNumber(producto.precioCompra).toString(),
      precioVenta: toNumber(producto.precioVenta).toString(),
      stockActual: producto.stockActual.toString(),
      stockMinimo: producto.stockMinimo.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedProducto) return
    setLoadingAction(true)
    const result = await updateProduct(selectedProducto.id, {
      nombre: formData.nombre,
      sku: formData.sku,
      categoriaId: formData.categoriaId,
      proveedorId: formData.proveedorId,
      precioCompra: parseFloat(formData.precioCompra),
      precioVenta: parseFloat(formData.precioVenta),
      stockActual: parseInt(formData.stockActual),
      stockMinimo: parseInt(formData.stockMinimo),
    })
    if (result.data) {
      setProductos((prev) => prev.map((p) => (p.id === result.data!.id ? result.data! : p)))
      setIsEditDialogOpen(false)
      setSelectedProducto(null)
      resetForm()
    }
    setLoadingAction(false)
  }

  // DELETE
  const openDelete = (producto: ProductoDB) => {
    setSelectedProducto(producto)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedProducto) return
    setLoadingAction(true)
    const result = await deleteProduct(selectedProducto.id)
    if (result.ok) {
      setProductos((prev) => prev.filter((p) => p.id !== selectedProducto.id))
      setIsDeleteDialogOpen(false)
      setSelectedProducto(null)
    }
    setLoadingAction(false)
  }

  const columns: ColumnDef<ProductoDB>[] = [
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.nombre}</p>
            {row.original.sku && (
              <p className="font-mono text-xs text-muted-foreground">{row.original.sku}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-muted rounded-lg text-sm text-muted-foreground">
          {row.original.categoria?.nombre}
        </span>
      ),
    },
    {
      accessorKey: "proveedor",
      header: "Proveedor",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.proveedor?.nombreComercial}</span>
      ),
    },
    {
      accessorKey: "precioVenta",
      header: () => <span className="block text-right">Precio</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <p className="font-bold text-foreground">
            ${toNumber(row.original.precioVenta).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            Compra: ${toNumber(row.original.precioCompra).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "stockActual",
      header: () => <span className="block text-right">Stock</span>,
      cell: ({ row }) => {
        const { stockActual, stockMinimo } = row.original
        const isLow = stockActual <= stockMinimo
        return (
          <div className="text-right">
            <p className={`font-bold ${isLow ? "text-destructive" : "text-foreground"}`}>
              {stockActual}
            </p>
            <p className="text-xs text-muted-foreground">Mín: {stockMinimo}</p>
          </div>
        )
      },
    },
    {
      id: "estado",
      header: () => <span className="block text-center">Estado</span>,
      cell: ({ row }) => {
        const { stockActual, stockMinimo } = row.original
        const isLow = stockActual <= stockMinimo
        const isNear = !isLow && stockActual <= Math.ceil(stockMinimo * 1.5)
        return (
          <div className="flex justify-center">
            {isLow ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Bajo
              </Badge>
            ) : isNear ? (
              <Badge className="gap-1 border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100">
                <AlertTriangle className="w-3 h-3" />
                Cercano
              </Badge>
            ) : (
              <Badge className="border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                OK
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "acciones",
      header: () => <span className="block text-center">Acciones</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg h-8 w-8"
            onClick={() => openEdit(row.original)}
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
            onClick={() => openDelete(row.original)}
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 rounded-xl bg-card border-border/50"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 h-11 rounded-xl">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Agregar Producto</DialogTitle>
            </DialogHeader>
            <ProductoForm
              formData={formData}
              setFormData={setFormData}
              categorias={categorias}
              proveedores={proveedores}
              existingSKUs={productos.map((p) => p.sku ?? "").filter(Boolean)}
              onSubmit={handleCreate}
              loading={loadingAction}
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
            setSelectedProducto(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Editar Producto</DialogTitle>
          </DialogHeader>
          <ProductoForm
            formData={formData}
            setFormData={setFormData}
            categorias={categorias}
            proveedores={proveedores}
            existingSKUs={productos.filter((p) => p.id !== selectedProducto?.id).map((p) => p.sku ?? "").filter(Boolean)}
            isEdit
            onSubmit={handleEdit}
            loading={loadingAction}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar producto
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{selectedProducto?.nombre}&quot;?
              Esta acción no se puede deshacer.
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{productos.length}</p>
              <p className="text-xs text-muted-foreground">Total productos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[oklch(0.75_0.15_75)]/20 to-[oklch(0.75_0.15_75)]/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.6_0.15_75)]" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {productos.filter((p) => p.stockActual <= p.stockMinimo).length}
              </p>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{categorias.length}</p>
              <p className="text-xs text-muted-foreground">Categorías</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-foreground">Catálogo de Productos</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingData ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Cargando productos...
            </div>
          ) : (
            <DataTable columns={columns} data={filteredProductos} pageSize={10} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
