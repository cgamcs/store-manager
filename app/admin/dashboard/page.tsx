import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  AlertTriangle,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns"
import { Prisma } from "@/src/generated/prisma/client"

function calcChange(current: number, previous: number): { label: string; trend: "up" | "down" } {
  if (previous === 0) return { label: current > 0 ? "+100%" : "0%", trend: "up" }
  const pct = ((current - previous) / previous) * 100
  const sign = pct >= 0 ? "+" : ""
  return {
    label: `${sign}${pct.toFixed(1)}%`,
    trend: pct >= 0 ? "up" : "down",
  }
}

function calcChangeAbs(current: number, previous: number): { label: string; trend: "up" | "down" } {
  const diff = current - previous
  const sign = diff >= 0 ? "+" : ""
  return {
    label: `${sign}${diff}`,
    trend: diff >= 0 ? "up" : "down",
  }
}

type TopProductoRaw = {
  productoId: number
  nombre: string
  totalCantidad: bigint
  totalGanancia: Prisma.Decimal
}

export default async function DashboardPage() {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const yesterdayStart = startOfDay(subDays(now, 1))
  const yesterdayEnd = endOfDay(subDays(now, 1))
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfDay(now)
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })

  const [
    ventasHoy,
    ventasAyer,
    ventasSemana,
    ventasSemanaAnterior,
    productosVendidosHoy,
    productosVendidosAyer,
    topProductos,
    lowStockProducts,
    activePromotions,
    totalProductos,
  ] = await Promise.all([
    prisma.venta.aggregate({
      where: { fechaHora: { gte: todayStart, lte: todayEnd } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.venta.aggregate({
      where: { fechaHora: { gte: yesterdayStart, lte: yesterdayEnd } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.venta.aggregate({
      where: { fechaHora: { gte: weekStart, lte: weekEnd } },
      _sum: { total: true },
    }),
    prisma.venta.aggregate({
      where: { fechaHora: { gte: lastWeekStart, lte: lastWeekEnd } },
      _sum: { total: true },
    }),
    prisma.ventaDetalle.aggregate({
      where: { venta: { fechaHora: { gte: todayStart, lte: todayEnd } } },
      _sum: { cantidad: true },
    }),
    prisma.ventaDetalle.aggregate({
      where: { venta: { fechaHora: { gte: yesterdayStart, lte: yesterdayEnd } } },
      _sum: { cantidad: true },
    }),
    prisma.$queryRaw<TopProductoRaw[]>`
      SELECT
        vd."productoId",
        p.nombre,
        SUM(vd.cantidad)::bigint AS "totalCantidad",
        SUM(vd.cantidad * vd."precioUnitario") AS "totalGanancia"
      FROM "VentaDetalle" vd
      JOIN "Producto" p ON p.id = vd."productoId"
      GROUP BY vd."productoId", p.nombre
      ORDER BY SUM(vd.cantidad) DESC
      LIMIT 5
    `,
    prisma.producto.findMany({
      where: { stockActual: { lte: prisma.producto.fields.stockMinimo } },
      select: { id: true, nombre: true, stockActual: true, stockMinimo: true },
      orderBy: { stockActual: "asc" },
    }),
    prisma.descuento.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, porcentaje: true, fechaFin: true },
      orderBy: { fechaInicio: "desc" },
    }),
    prisma.producto.count(),
  ])

  const ventasHoyTotal = Number(ventasHoy._sum.total ?? 0)
  const ventasAyerTotal = Number(ventasAyer._sum.total ?? 0)
  const ventasSemanaTotal = Number(ventasSemana._sum.total ?? 0)
  const ventasSemanaAnteriorTotal = Number(ventasSemanaAnterior._sum.total ?? 0)
  const prodVendidosHoy = productosVendidosHoy._sum.cantidad ?? 0
  const prodVendidosAyer = productosVendidosAyer._sum.cantidad ?? 0
  const ticketHoy = ventasHoy._count.id > 0 ? ventasHoyTotal / ventasHoy._count.id : 0
  const ticketAyer = ventasAyer._count.id > 0 ? ventasAyerTotal / ventasAyer._count.id : 0

  const ventasHoyChange = calcChange(ventasHoyTotal, ventasAyerTotal)
  const ventasSemanaChange = calcChange(ventasSemanaTotal, ventasSemanaAnteriorTotal)
  const prodVendidosChange = calcChangeAbs(prodVendidosHoy, prodVendidosAyer)
  const ticketChange = calcChange(ticketHoy, ticketAyer)

  const stats = [
    {
      label: "Ventas Hoy",
      value: `$${ventasHoyTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      change: ventasHoyChange.label,
      trend: ventasHoyChange.trend,
      compareLabel: "vs ayer",
      icon: DollarSign,
      color: "from-[oklch(0.55_0.2_25)] to-[oklch(0.65_0.18_35)]",
    },
    {
      label: "Ventas Semana",
      value: `$${ventasSemanaTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      change: ventasSemanaChange.label,
      trend: ventasSemanaChange.trend,
      compareLabel: "vs semana pasada",
      icon: TrendingUp,
      color: "from-[oklch(0.6_0.15_145)] to-[oklch(0.65_0.12_160)]",
    },
    {
      label: "Productos Vendidos",
      value: prodVendidosHoy.toString(),
      change: prodVendidosChange.label,
      trend: prodVendidosChange.trend,
      compareLabel: "vs ayer",
      icon: Package,
      color: "from-[oklch(0.65_0.18_35)] to-[oklch(0.7_0.15_45)]",
    },
    {
      label: "Ticket Promedio",
      value: `$${ticketHoy.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      change: ticketChange.label,
      trend: ticketChange.trend,
      compareLabel: "vs ayer",
      icon: ShoppingBag,
      color: "from-[oklch(0.75_0.15_75)] to-[oklch(0.7_0.12_85)]",
    },
  ]

  const lowStockFiltered = lowStockProducts.filter(
    (p) => p.stockActual <= p.stockMinimo
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-2xl border-border/50 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-stretch">
                <div className={`w-2 bg-linear-to-b ${stat.color}`} />
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">{stat.label}</span>
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className={`flex items-center gap-1 text-sm mt-1 ${stat.trend === "up" ? "text-[oklch(0.6_0.15_145)]" : "text-destructive"}`}>
                    {stat.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{stat.change}</span>
                    <span className="text-muted-foreground ml-1">{stat.compareLabel}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Productos Más Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sin ventas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProductos.map((product, i) => (
                  <div key={product.productoId} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">{Number(product.totalCantidad)} unidades</p>
                    </div>
                    <p className="font-bold text-foreground">
                      ${Number(product.totalGanancia).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-[oklch(0.75_0.15_75)]" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockFiltered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay productos con stock bajo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockFiltered.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.75_0.15_75)]/10 border border-[oklch(0.75_0.15_75)]/20">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.75_0.15_75)]/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[oklch(0.6_0.15_75)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">Mínimo: {product.stockMinimo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[oklch(0.6_0.15_75)]">{product.stockActual}</p>
                      <p className="text-xs text-muted-foreground">en stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Promotions */}
      <Card className="rounded-2xl border-border/50 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Tag className="w-5 h-5 text-primary" />
            Promociones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePromotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay promociones activas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePromotions.map((promo) => (
                <div key={promo.id} className="p-4 rounded-xl bg-linear-to-br from-primary/5 to-accent/5 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{promo.nombre}</span>
                    <span className="px-2 py-1 rounded-full bg-linear-to-r from-primary to-accent text-primary-foreground text-xs font-bold">
                      -{Number(promo.porcentaje)}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Válido hasta:{" "}
                    {promo.fechaFin
                      ? new Date(promo.fechaFin).toLocaleDateString("es-MX")
                      : "No aplica"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">{ventasHoy._count.id}</p>
          <p className="text-sm text-muted-foreground">Clientes atendidos hoy</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">{totalProductos}</p>
          <p className="text-sm text-muted-foreground">Productos en catálogo</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-[oklch(0.75_0.15_75)]" />
          <p className="text-2xl font-bold text-foreground">{lowStockFiltered.length}</p>
          <p className="text-sm text-muted-foreground">Productos bajo stock</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center">
          <Tag className="w-8 h-8 mx-auto mb-2 text-[oklch(0.6_0.15_145)]" />
          <p className="text-2xl font-bold text-foreground">{activePromotions.length}</p>
          <p className="text-sm text-muted-foreground">Promociones activas</p>
        </div>
      </div>
    </div>
  )
}
