"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Trash2,
  Edit,
  AlertTriangle,
  ChevronRight,
  ShoppingCart,
  Building2,
} from "lucide-react"
import {
  createOrden,
  updateOrdenEstado,
  deleteOrden,
} from "./actions"

const statusColors = {
  pendiente: { bg: "bg-[oklch(0.75_0.15_75)]/10", text: "text-[oklch(0.6_0.15_75)]", icon: Clock },
  enviada:   { bg: "bg-[oklch(0.65_0.15_250)]/10", text: "text-[oklch(0.55_0.15_250)]", icon: Truck },
  recibida:  { bg: "bg-[oklch(0.6_0.15_145)]/10",  text: "text-[oklch(0.5_0.15_145)]",  icon: CheckCircle2 },
  cancelada: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
}

const unidades = ["tarima", "bulto", "pieza", "caja"] as const
const estados  = ["pendiente", "enviada", "recibida", "cancelada"] as const

type EstadoOrden = typeof estados[number]

type ProveedorDB = {
  id: number
  nombreComercial: string
  correo: string
  cantidadMinimaOrden: number | string
  tiempoEntregaDias: number
}

type ProductoDB = {
  id: number
  nombre: string
  precioCompra: number | string
  precioVenta: number | string
  categoriaId: number
  proveedorId: number
  categoria: { id: number; nombre: string; porcentajeGanancia: number | string }
}

type DetalleDB = {
  id: number
  productoId: number
  cantidad: number
  unidad: string
  piezasPorUnidad: number
  precioCompra: number | string
  precioVenta: number | string | null
  fechaCaducidad: string | null
  producto: { id: number; nombre: string }
}

type OrdenDB = {
  id: number
  proveedorId: number
  usuarioId: number
  fechaOrden: string
  estado: EstadoOrden
  total: number | string
  proveedor: { id: number; nombreComercial: string; correo: string }
  detalles: DetalleDB[]
}

type OrderItem = {
  productoId: number
  productoNombre: string
  categoriaId: number
  categoriaNombre: string
  categoriaMargen: number
  cantidad: number
  unidad: typeof unidades[number]
  piezasPorUnidad: number
  precioCompra: number
  precioVenta: number
  fechaCaducidad: string
}

function toNum(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v
}

function calcSuggestedPrice(precioCompra: number, margen: number): number {
  return parseFloat((precioCompra * (1 + margen / 100)).toFixed(2))
}

export default function OrdenesClient({
  initialOrdenes,
  initialProveedores,
  initialProductos,
}: {
  initialOrdenes: OrdenDB[]
  initialProveedores: ProveedorDB[]
  initialProductos: ProductoDB[]
}) {
  const [searchQuery, setSearchQuery]     = useState("")
  const [ordenes, setOrdenes]             = useState<OrdenDB[]>(initialOrdenes)
  const [isPending, startTransition]      = useTransition()

  const [isDialogOpen, setIsDialogOpen]             = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen]     = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPriceConfirmOpen, setIsPriceConfirmOpen] = useState(false)
  const [selectedOrden, setSelectedOrden]           = useState<OrdenDB | null>(null)
  const [pendingItemIndex, setPendingItemIndex]     = useState<number | null>(null)
  const [selectedProveedor, setSelectedProveedor]   = useState("")
  const [editEstado, setEditEstado]                 = useState<EstadoOrden>("pendiente")
  const [orderItems, setOrderItems]                 = useState<OrderItem[]>([])
  const [error, setError]                           = useState<string | null>(null)

  const productosDelProveedor = selectedProveedor
    ? initialProductos.filter((p) => p.proveedorId === parseInt(selectedProveedor))
    : []

  const proveedorSeleccionado = initialProveedores.find(
    (p) => p.id === parseInt(selectedProveedor)
  )

  const handleProveedorChange = (value: string) => {
    setSelectedProveedor(value)
    setOrderItems([])
  }

  const filteredOrders = ordenes.filter((order) =>
    order.proveedor.nombreComercial.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        productoId: 0,
        productoNombre: "",
        categoriaId: 0,
        categoriaNombre: "",
        categoriaMargen: 0,
        cantidad: 1,
        unidad: "pieza",
        piezasPorUnidad: 1,
        precioCompra: 0,
        precioVenta: 0,
        fechaCaducidad: "",
      },
    ])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: string, value: string | number) => {
    setOrderItems(
      orderItems.map((item, i) => {
        if (i !== index) return item

        if (field === "productoId") {
          const product = productosDelProveedor.find((p) => p.id === Number(value))
          if (product) {
            const margen = toNum(product.categoria.porcentajeGanancia)
            const precioSugerido = calcSuggestedPrice(toNum(product.precioCompra), margen)
            return {
              ...item,
              productoId: Number(value),
              productoNombre: product.nombre,
              categoriaId: product.categoriaId,
              categoriaNombre: product.categoria.nombre,
              categoriaMargen: margen,
              precioCompra: toNum(product.precioCompra),
              precioVenta: precioSugerido,
            }
          }
        }
        if (field === "precioCompra") {
          const newPrecio = parseFloat(value as string) || 0
          const precioSugerido = calcSuggestedPrice(newPrecio, item.categoriaMargen)
          return { ...item, precioCompra: newPrecio, precioVenta: precioSugerido }
        }
        if (field === "precioVenta") {
          const newPrecio = parseFloat(value as string) || 0
          const precioSugerido = calcSuggestedPrice(item.precioCompra, item.categoriaMargen)
          if (newPrecio !== precioSugerido) {
            setPendingItemIndex(index)
            setIsPriceConfirmOpen(true)
          }
          return { ...item, precioVenta: newPrecio }
        }
        if (field === "cantidad" || field === "piezasPorUnidad") {
          return { ...item, [field]: parseInt(value as string) || 1 }
        }
        return { ...item, [field]: value }
      })
    )
  }

  const total = orderItems.reduce(
    (acc, item) => acc + item.cantidad * item.precioCompra,
    0
  )

  const resetDialog = () => {
    setOrderItems([])
    setSelectedProveedor("")
    setError(null)
  }

  const handleCreateOrder = () => {
    setError(null)
    startTransition(async () => {
      const result = await createOrden({
        proveedorId: parseInt(selectedProveedor),
        detalles: orderItems.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          unidad: item.unidad,
          piezasPorUnidad: item.piezasPorUnidad,
          precioCompra: item.precioCompra,
          precioVenta: item.precioVenta || null,
          fechaCaducidad: item.fechaCaducidad || null,
        })),
      })
      if (result.error) { setError(result.error); return }
      setOrdenes((prev) => [result.data, ...prev])
      setIsDialogOpen(false)
      resetDialog()
    })
  }

  const openEditDialog = (orden: OrdenDB) => {
    setSelectedOrden(orden)
    setEditEstado(orden.estado)
    setIsEditDialogOpen(true)
  }

  const handleEditOrder = () => {
    if (!selectedOrden) return
    setError(null)
    startTransition(async () => {
      const result = await updateOrdenEstado(selectedOrden.id, { estado: editEstado })
      if (result.error) { setError(result.error); return }
      setOrdenes((prev) =>
        prev.map((o) => o.id === selectedOrden.id ? { ...o, estado: editEstado } : o)
      )
      setIsEditDialogOpen(false)
      setSelectedOrden(null)
    })
  }

  const openDeleteDialog = (orden: OrdenDB) => {
    setSelectedOrden(orden)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteOrder = () => {
    if (!selectedOrden) return
    startTransition(async () => {
      await deleteOrden(selectedOrden.id)
      setOrdenes((prev) => prev.filter((o) => o.id !== selectedOrden.id))
      setIsDeleteDialogOpen(false)
      setSelectedOrden(null)
    })
  }

  const columns: ColumnDef<OrdenDB>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-foreground">
          #{row.original.id.toString().padStart(4, "0")}
        </span>
      ),
    },
    {
      accessorKey: "proveedor",
      header: "Proveedor",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.proveedor.nombreComercial}</p>
            <p className="text-sm text-muted-foreground">{row.original.proveedor.correo}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "fechaOrden",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(row.original.fechaOrden).toLocaleDateString("es-MX")}</span>
        </div>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const status = statusColors[row.original.estado] ?? statusColors.pendiente
        const StatusIcon = status.icon
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="capitalize">{row.original.estado}</span>
          </span>
        )
      },
    },
    {
      accessorKey: "total",
      header: () => <span className="block text-right">Total</span>,
      cell: ({ row }) => (
        <span className="block text-right font-bold text-foreground">
          ${toNum(row.original.total).toLocaleString("es-MX")}
        </span>
      ),
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
            onClick={() => openEditDialog(row.original)}
            disabled={row.original.estado === "recibida" || row.original.estado === "cancelada"}
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg h-8 w-8 hover:text-destructive hover:bg-destructive/10"
            onClick={() => openDeleteDialog(row.original)}
            disabled={row.original.estado === "recibida"}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 rounded-xl bg-card border-border/50"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetDialog() }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Nueva Orden
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
            {/* Modal header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Nueva Orden de Compra
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className={`flex items-center gap-1.5 font-medium ${selectedProveedor ? "text-[oklch(0.5_0.15_145)]" : "text-primary"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${selectedProveedor ? "bg-[oklch(0.6_0.15_145)]/20 text-[oklch(0.5_0.15_145)]" : "bg-primary text-primary-foreground"}`}>1</span>
                  Proveedor
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className={`flex items-center gap-1.5 font-medium ${orderItems.length > 0 ? "text-[oklch(0.5_0.15_145)]" : selectedProveedor ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${orderItems.length > 0 ? "bg-[oklch(0.6_0.15_145)]/20 text-[oklch(0.5_0.15_145)]" : selectedProveedor ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</span>
                  Productos
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className={`flex items-center gap-1.5 font-medium ${orderItems.length > 0 && selectedProveedor ? "text-primary" : "text-muted-foreground"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${orderItems.length > 0 && selectedProveedor ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</span>
                  Confirmar
                </span>
              </div>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Sección 1: Proveedor */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Proveedor</h3>
                </div>

                <Select value={selectedProveedor} onValueChange={handleProveedorChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialProveedores.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.nombreComercial}</span>
                          <span className="text-xs text-muted-foreground">
                            Entrega: {p.tiempoEntregaDias} días · Min: ${toNum(p.cantidadMinimaOrden).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {proveedorSeleccionado && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">{proveedorSeleccionado.nombreComercial}</p>
                      <p className="text-xs text-muted-foreground truncate">{proveedorSeleccionado.correo}</p>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-xs text-muted-foreground">Productos disponibles</p>
                      <p className="text-sm font-bold text-primary">{productosDelProveedor.length}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sección 2: Productos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Productos</h3>
                    {orderItems.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {orderItems.length}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOrderItem}
                    disabled={!selectedProveedor || productosDelProveedor.length === 0}
                    className="rounded-lg h-8 text-xs gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar producto
                  </Button>
                </div>

                {!selectedProveedor ? (
                  <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Selecciona un proveedor primero</p>
                  </div>
                ) : productosDelProveedor.length === 0 ? (
                  <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Este proveedor no tiene productos registrados</p>
                  </div>
                ) : orderItems.length === 0 ? (
                  <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">Agrega los productos que deseas ordenar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/40">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            {item.categoriaNombre && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {item.categoriaNombre} · +{item.categoriaMargen}%
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeOrderItem(index)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-4 space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Producto</Label>
                            <Select
                              value={item.productoId ? item.productoId.toString() : ""}
                              onValueChange={(v) => updateOrderItem(index, "productoId", v)}
                            >
                              <SelectTrigger className="h-10 rounded-lg">
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {productosDelProveedor.map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Cantidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={(e) => updateOrderItem(index, "cantidad", e.target.value)}
                                className="h-10 rounded-lg"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Unidad</Label>
                              <Select
                                value={item.unidad}
                                onValueChange={(v) => updateOrderItem(index, "unidad", v)}
                              >
                                <SelectTrigger className="h-10 rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidades.map((u) => (
                                    <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Pzas por unidad</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.piezasPorUnidad}
                                onChange={(e) => updateOrderItem(index, "piezasPorUnidad", e.target.value)}
                                className="h-10 rounded-lg"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Precio compra</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.precioCompra}
                                  onChange={(e) => updateOrderItem(index, "precioCompra", e.target.value)}
                                  className="h-10 rounded-lg pl-7"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Precio venta</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.precioVenta}
                                  onChange={(e) => updateOrderItem(index, "precioVenta", e.target.value)}
                                  className="h-10 rounded-lg pl-7"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">Fecha caducidad</Label>
                              <Input
                                type="date"
                                value={item.fechaCaducidad}
                                onChange={(e) => updateOrderItem(index, "fechaCaducidad", e.target.value)}
                                className="h-10 rounded-lg"
                              />
                            </div>
                          </div>

                          {item.productoId > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs text-muted-foreground">
                              <span>
                                {item.cantidad} {item.unidad}(s) × {item.piezasPorUnidad} pzas =&nbsp;
                                <span className="font-medium text-foreground">{item.cantidad * item.piezasPorUnidad} pzas totales</span>
                              </span>
                              <span>
                                Subtotal:&nbsp;
                                <span className="font-semibold text-foreground">${(item.cantidad * item.precioCompra).toFixed(2)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer fijo */}
            <div className="px-6 py-4 border-t border-border/50 bg-card shrink-0 space-y-3">
              {orderItems.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {orderItems.length} producto(s) · {orderItems.reduce((a, i) => a + i.cantidad * i.piezasPorUnidad, 0)} pzas totales
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Total compra</span>
                    <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <Button
                className="w-full h-11 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground"
                disabled={!selectedProveedor || orderItems.length === 0 || isPending}
                onClick={handleCreateOrder}
              >
                {isPending ? "Guardando..." : "Crear Orden de Compra"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Price Confirmation Dialog */}
      <AlertDialog open={isPriceConfirmOpen} onOpenChange={setIsPriceConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.6_0.15_75)]" />
              Confirmar precio de venta
            </AlertDialogTitle>
            <AlertDialogDescription>
              El precio de venta es diferente al sugerido por la categoría. ¿Deseas mantenerlo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              if (pendingItemIndex !== null) {
                setOrderItems((prev) =>
                  prev.map((item, i) =>
                    i !== pendingItemIndex ? item
                      : { ...item, precioVenta: calcSuggestedPrice(item.precioCompra, item.categoriaMargen) }
                  )
                )
              }
              setPendingItemIndex(null)
            }}>
              Usar sugerido
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setIsPriceConfirmOpen(false); setPendingItemIndex(null) }}
              className="bg-primary"
            >
              Mantener ajuste
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setError(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Editar Orden #{selectedOrden?.id.toString().padStart(4, "0")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Estado de la orden</Label>
              <Select value={editEstado} onValueChange={(v: EstadoOrden) => setEditEstado(v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((e) => {
                    const status = statusColors[e]
                    const StatusIcon = status.icon
                    return (
                      <SelectItem key={e} value={e}>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${status.text}`} />
                          <span className="capitalize">{e}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {editEstado === "recibida" && (
                <p className="text-xs text-[oklch(0.5_0.15_145)] bg-[oklch(0.6_0.15_145)]/10 px-3 py-2 rounded-lg">
                  Al marcar como recibida se incrementará el stock y se registrarán las fechas de caducidad.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleEditOrder} disabled={isPending} className="bg-linear-to-r from-primary to-accent">
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Eliminar orden de compra
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la orden #{selectedOrden?.id.toString().padStart(4, "0")}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ordenes.length}</p>
              <p className="text-sm text-muted-foreground">Total órdenes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.75_0.15_75)]/20 to-[oklch(0.75_0.15_75)]/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-[oklch(0.6_0.15_75)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {ordenes.filter((o) => o.estado === "pendiente").length}
              </p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {ordenes.filter((o) => o.estado === "recibida").length}
              </p>
              <p className="text-sm text-muted-foreground">Recibidas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-foreground">Órdenes de Compra</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable columns={columns} data={filteredOrders} pageSize={10} />
        </CardContent>
      </Card>
    </div>
  )
}
