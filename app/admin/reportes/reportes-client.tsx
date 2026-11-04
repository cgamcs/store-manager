"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { money } from "@/lib/utils"
import { Package, DollarSign, AlertTriangle, PackageX, TrendingDown, CalendarClock } from "lucide-react"
import {
  reporteCaducidades,
  type EstadisticasInventario,
  type NivelCaducidad,
  type ReporteCaducidades,
} from "./actions"

const NIVEL_CLASS: Record<NivelCaducidad, string> = {
  caducado: "bg-destructive/10 text-destructive",
  urgente: "bg-[oklch(0.75_0.15_55)]/20 text-[oklch(0.5_0.15_55)]",
  proximo: "bg-[oklch(0.75_0.15_75)]/20 text-[oklch(0.5_0.15_75)]",
  vigilancia: "bg-[oklch(0.65_0.15_250)]/15 text-[oklch(0.5_0.15_250)]",
}

export default function ReportesClient({ estadisticas }: { estadisticas: EstadisticasInventario }) {
  const [dias, setDias] = useState("30")
  const [reporte, setReporte] = useState<ReporteCaducidades | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const generar = () => {
    startTransition(async () => {
      const result = await reporteCaducidades(Number(dias))
      if ("error" in result) {
        setError(result.error)
        setReporte(null)
        return
      }
      setError(null)
      setReporte(result.data)
    })
  }

  const stats = [
    { label: "Total productos", value: String(estadisticas.totalProductos), icon: Package },
    { label: "Valor del inventario", value: money(estadisticas.valorInventario), icon: DollarSign },
    { label: "Stock bajo", value: String(estadisticas.productosStockBajo), icon: AlertTriangle },
    { label: "Sin stock", value: String(estadisticas.productosSinStock), icon: PackageX },
    { label: "Valor de merma", value: money(estadisticas.valorMerma), icon: TrendingDown },
  ]

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h3 className="font-bold text-foreground text-lg">Estadísticas de inventario</h3>
          <p className="text-xs text-muted-foreground font-mono">sp_calcular_estadisticas_inventario</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="rounded-2xl border-border/50 shadow-lg">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-foreground truncate">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CalendarClock className="w-5 h-5 text-primary" />
            Reporte de caducidades
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono">
            sp_reporte_caducidades_proximas (cursor)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <label htmlFor="dias" className="text-sm text-muted-foreground">Días</label>
              <Input
                id="dias"
                type="number"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                className="h-11 w-32 rounded-xl"
              />
            </div>
            <Button onClick={generar} disabled={isPending} className="h-11 rounded-xl">
              {isPending ? "Generando..." : "Generar reporte"}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {reporte && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-2xl font-bold text-foreground">{reporte.totalAlertas}</p>
                  <p className="text-sm text-muted-foreground">Alertas</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-2xl font-bold text-destructive">{reporte.yaCaducados}</p>
                  <p className="text-sm text-muted-foreground">Ya caducados</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-2xl font-bold text-foreground">{reporte.unidades}</p>
                  <p className="text-sm text-muted-foreground">Unidades en riesgo</p>
                </div>
              </div>

              {reporte.detalle.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Sin lotes por caducar en este rango</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Caducidad</TableHead>
                        <TableHead className="text-right">Cant. lote</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead>Descuento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.detalle.map((d) => (
                        <TableRow key={d.loteId}>
                          <TableCell className="font-medium text-foreground">{d.producto}</TableCell>
                          <TableCell className="text-muted-foreground">{d.proveedor}</TableCell>
                          <TableCell>{d.fecha}</TableCell>
                          <TableCell className="text-right">{d.cantidad}</TableCell>
                          <TableCell className="text-right">{d.stock}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`border-0 capitalize ${NIVEL_CLASS[d.nivel]}`}>
                              {d.nivel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {d.sugerirDescuento ? (
                              <Badge className="border-0">Sugerir descuento</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
