"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Search,
  Receipt,
  TrendingUp,
  Calendar,
  Package,
  ShoppingCart,
  User,
  Clock,
  Filter,
} from "lucide-react"

type VentaDetalleDB = {
  id: number
  ventaId: number
  productoId: number
  cantidad: number
  precioUnitario: number | string
  producto: { id: number; nombre: string }
}

type VentaDB = {
  id: number
  cajeroId: number
  fechaHora: string
  total: number | string
  cajero: { id: number; nombre: string; correo: string }
  detalles: VentaDetalleDB[]
}

function toNum(v: number | string): number {
  return typeof v === "string" ? parseFloat(v) : v
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export default function VentasClient({ initialVentas }: { initialVentas: VentaDB[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom]       = useState("")
  const [dateTo, setDateTo]           = useState("")
  const [isResumenOpen, setIsResumenOpen] = useState(false)
  const [resumenVenta, setResumenVenta]   = useState<VentaDB | null>(null)

  const hoy = new Date()

  const ventasHoy = initialVentas.filter(
    (v) => new Date(v.fechaHora) >= startOfDay(hoy)
  )
  const ventasMes = initialVentas.filter(
    (v) => new Date(v.fechaHora) >= startOfMonth(hoy)
  )
  const totalHoy  = ventasHoy.reduce((a, v) => a + toNum(v.total), 0)
  const totalMes  = ventasMes.reduce((a, v) => a + toNum(v.total), 0)
  const promedio  = initialVentas.length
    ? initialVentas.reduce((a, v) => a + toNum(v.total), 0) / initialVentas.length
    : 0

  const filteredVentas = initialVentas.filter((v) => {
    const matchesCajero = v.cajero.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    const fecha = new Date(v.fechaHora)
    const matchesFrom = dateFrom ? fecha >= new Date(dateFrom) : true
    const matchesTo   = dateTo   ? fecha <= new Date(dateTo + "T23:59:59") : true
    return matchesCajero && matchesFrom && matchesTo
  })

  const openResumen = (venta: VentaDB) => {
    setResumenVenta(venta)
    setIsResumenOpen(true)
  }

  const columns: ColumnDef<VentaDB>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <button
          onClick={() => openResumen(row.original)}
          className="font-mono text-sm text-primary hover:underline underline-offset-2"
        >
          #{row.original.id.toString().padStart(4, "0")}
        </button>
      ),
    },
    {
      accessorKey: "cajero",
      header: "Cajero",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.cajero.nombre}</p>
            <p className="text-xs text-muted-foreground">{row.original.cajero.correo}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "fechaHora",
      header: "Fecha y hora",
      cell: ({ row }) => {
        const fecha = new Date(row.original.fechaHora)
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-sm text-foreground">{fecha.toLocaleDateString("es-MX")}</p>
              <p className="text-xs">{fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: "productos",
      header: () => <span className="block text-center">Productos</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
          <Package className="w-4 h-4" />
          <span className="text-sm">{row.original.detalles.length}</span>
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: () => <span className="block text-right">Total</span>,
      cell: ({ row }) => (
        <span className="block text-right font-bold text-foreground">
          ${toNum(row.original.total).toFixed(2)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cajero..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-11 rounded-xl bg-card border-border/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-card border border-border/50 rounded-xl px-4 h-11">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border-0 shadow-none h-auto p-0 bg-transparent text-sm w-36 focus-visible:ring-0"
            />
            <span className="text-muted-foreground text-sm">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border-0 shadow-none h-auto p-0 bg-transparent text-sm w-36 focus-visible:ring-0"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo("") }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{initialVentas.length}</p>
              <p className="text-sm text-muted-foreground">Total ventas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.65_0.15_250)]/20 to-[oklch(0.65_0.15_250)]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[oklch(0.55_0.15_250)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{ventasHoy.length}</p>
              <p className="text-sm text-muted-foreground">Ventas hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[oklch(0.5_0.15_145)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalHoy.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Ingresos hoy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[oklch(0.75_0.15_75)]/20 to-[oklch(0.75_0.15_75)]/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-[oklch(0.6_0.15_75)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalMes.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Ingresos del mes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-0 flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Historial de Ventas</CardTitle>
          {filteredVentas.length !== initialVentas.length && (
            <span className="text-sm text-muted-foreground">
              {filteredVentas.length} de {initialVentas.length} ventas
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          <DataTable columns={columns} data={filteredVentas} pageSize={15} />
        </CardContent>
      </Card>

      {/* Resumen Sheet */}
      <Sheet open={isResumenOpen} onOpenChange={setIsResumenOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
            <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Venta #{resumenVenta?.id.toString().padStart(4, "0")}
            </SheetTitle>
            {resumenVenta && (
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{resumenVenta.cajero.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(resumenVenta.fechaHora).toLocaleDateString("es-MX")}{" "}
                    {new Date(resumenVenta.fechaHora).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )}
          </SheetHeader>

          <div className="overflow-y-auto flex-1 px-6 py-5">
            {resumenVenta && (
              resumenVenta.detalles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Sin productos registrados</p>
              ) : (
                <div className="rounded-xl border border-border/60 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/40">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Producto</th>
                        <th className="text-center px-4 py-3 font-medium text-muted-foreground">Cant.</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">P. unitario</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {resumenVenta.detalles.map((d) => {
                        const subtotal = toNum(d.precioUnitario) * d.cantidad
                        return (
                          <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{d.producto.nombre}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">{d.cantidad}</td>
                            <td className="px-4 py-3 text-right text-muted-foreground">${toNum(d.precioUnitario).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">${subtotal.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {resumenVenta && resumenVenta.detalles.length > 0 && (
            <div className="px-6 py-4 border-t border-border/50 bg-card shrink-0 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {resumenVenta.detalles.length} producto(s) ·{" "}
                {resumenVenta.detalles.reduce((a, d) => a + d.cantidad, 0)} unidades
              </span>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Total venta</span>
                <span className="text-2xl font-bold text-primary">
                  ${toNum(resumenVenta.total).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
