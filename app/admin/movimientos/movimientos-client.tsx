"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  PencilRuler,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const TIPO_LABELS: Record<string, { label: string; icon: typeof ArrowDownLeft; color: string }> = {
  venta: { label: "Venta", icon: ArrowDownLeft, color: "text-red-600 bg-red-50" },
  compra: { label: "Compra", icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-50" },
  ajuste: { label: "Ajuste", icon: PencilRuler, color: "text-blue-600 bg-blue-50" },
  merma: { label: "Merma", icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  inicial: { label: "Inicial", icon: FileText, color: "text-purple-600 bg-purple-50" },
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function MovimientosClient({
  initialMovimientos,
  initialProductos,
  pagination,
  initialFilters,
}: {
  initialMovimientos: Array<{
    id: number
    productoId: number
    cantidad: number
    tipo: string
    motivo: string | null
    usuarioId: number | null
    fechaHora: string
    referencia: string | null
    producto: { id: number; nombre: string; sku: string | null }
    usuario: { id: number; nombre: string } | null
  }>
  initialProductos: Array<{ id: number; nombre: string }>
  pagination: { total: number; page: number; pageSize: number; totalPages: number }
  initialFilters: { productoId?: string; tipo?: string; desde?: string; hasta?: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState({
    productoId: initialFilters.productoId || "",
    tipo: initialFilters.tipo || "",
    desde: initialFilters.desde || "",
    hasta: initialFilters.hasta || "",
  })

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (filters.productoId) params.set("productoId", filters.productoId)
      if (filters.tipo) params.set("tipo", filters.tipo)
      if (filters.desde) params.set("desde", filters.desde)
      if (filters.hasta) params.set("hasta", filters.hasta)
      params.set("page", "1")
      router.push(`/admin/movimientos?${params.toString()}`)
    })
  }

  const goToPage = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", page.toString())
      router.push(`/admin/movimientos?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    setFilters({ productoId: "", tipo: "", desde: "", hasta: "" })
    router.push("/admin/movimientos")
  }

  const hasActiveFilters = filters.productoId || filters.tipo || filters.desde || filters.hasta

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Producto</label>
              <Select value={filters.productoId} onValueChange={(v) => setFilters((f) => ({ ...f, productoId: v }))}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {initialProductos.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Tipo</label>
              <Select value={filters.tipo} onValueChange={(v) => setFilters((f) => ({ ...f, tipo: v }))}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.entries(TIPO_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Desde</label>
              <Input
                type="date"
                value={filters.desde}
                onChange={(e) => setFilters((f) => ({ ...f, desde: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Hasta</label>
              <Input
                type="date"
                value={filters.hasta}
                onChange={(e) => setFilters((f) => ({ ...f, hasta: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={applyFilters}
                disabled={isPending}
                className="h-10 rounded-xl flex-1 bg-linear-to-r from-primary to-accent text-primary-foreground"
              >
                {isPending ? "Buscando..." : "Filtrar"}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="h-10 rounded-xl">
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-foreground">Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground font-medium">Fecha</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Producto</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Cantidad</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Motivo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialMovimientos.length > 0 ? (
                  initialMovimientos.map((mov) => {
                    const tipoInfo = TIPO_LABELS[mov.tipo] || { label: mov.tipo, icon: FileText, color: "text-gray-600 bg-gray-50" }
                    const isEntrada = mov.cantidad > 0
                    return (
                      <TableRow key={mov.id} className="border-border/30 hover:bg-muted/30 transition-colors">
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(mov.fechaHora)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-foreground text-sm">{mov.producto.nombre}</p>
                              {mov.producto.sku && (
                                <p className="font-mono text-xs text-muted-foreground">{mov.producto.sku}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1 border-transparent ${tipoInfo.color}`}>
                            <tipoInfo.icon className="w-3 h-3" />
                            {tipoInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${isEntrada ? "text-emerald-600" : "text-red-600"}`}>
                            {isEntrada ? "+" : ""}{mov.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {mov.motivo || mov.referencia || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {mov.usuario?.nombre || "Sistema"}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Sin movimientos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-1 mt-4">
              <p className="text-sm text-muted-foreground">
                {pagination.total === 0
                  ? "Sin resultados"
                  : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} de ${pagination.total} registros`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Pág. {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
