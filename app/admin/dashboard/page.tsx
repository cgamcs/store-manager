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
import { money } from "@/lib/utils"

// El dashboard lee vistas y agregados en vivo; sin esto Next lo prerenderiza
// y muestra los números del momento del build.
export const dynamic = "force-dynamic"

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

type VentaCategoriaRaw = {
  categoria_id: number
  categoria_nombre: string
  margen_ganancia: Prisma.Decimal
  total_ventas: bigint
  cantidad_total_unidades: bigint
  ingreso_bruto_total: Prisma.Decimal
  ganancia_estimada: Prisma.Decimal
}

type StockBajoRaw = {
  producto_id: number
  producto_nombre: string
  stockActual: number
  stockMinimo: number
  deficit_stock: number
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
    ventasPorCategoria,
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
    // vista_ventas_por_categoria ya agrupa y calcula la ganancia estimada;
    // aquí sólo se reordena para responder qué categoría deja más dinero.
    prisma.$queryRaw<VentaCategoriaRaw[]>`
      SELECT categoria_id, categoria_nombre, margen_ganancia, total_ventas,
             cantidad_total_unidades, ingreso_bruto_total, ganancia_estimada
      FROM vista_ventas_por_categoria
      ORDER BY ganancia_estimada DESC
    `,
    // vista_productos_stock_bajo ya resuelve el filtro y el orden por déficit
    prisma.$queryRaw<StockBajoRaw[]>`
      SELECT producto_id, producto_nombre, "stockActual", "stockMinimo", deficit_stock
      FROM vista_productos_stock_bajo
    `,
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
      value: money(ventasHoyTotal),
      change: ventasHoyChange.label,
      trend: ventasHoyChange.trend,
      compareLabel: "vs ayer",
      icon: DollarSign,
      color: "from-[oklch(0.55_0.2_25)] to-[oklch(0.65_0.18_35)]",
    },
    {
      label: "Ventas Semana",
      value: money(ventasSemanaTotal),
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
      value: money(ticketHoy),
      change: ticketChange.label,
      trend: ticketChange.trend,
      compareLabel: "vs ayer",
      icon: ShoppingBag,
      color: "from-[oklch(0.75_0.15_75)] to-[oklch(0.7_0.12_85)]",
    },
  ]

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
        {/* Categorías más rentables — vista_ventas_por_categoria */}
        <Card className="rounded-2xl border-border/50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              Categorías Más Rentables
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ventasPorCategoria.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Sin ventas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ventasPorCategoria.map((categoria, i) => (
                  <div key={categoria.categoria_id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{categoria.categoria_nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {Number(categoria.total_ventas)} ventas · {Number(categoria.cantidad_total_unidades)} unidades · margen {Number(categoria.margen_ganancia)}%
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-[oklch(0.6_0.15_145)]">
                        {money(categoria.ganancia_estimada)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        de {money(categoria.ingreso_bruto_total)}
                      </p>
                    </div>
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
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay productos con stock bajo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.producto_id} className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.75_0.15_75)]/10 border border-[oklch(0.75_0.15_75)]/20">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.75_0.15_75)]/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[oklch(0.6_0.15_75)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.producto_nombre}</p>
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
          <p className="text-2xl font-bold text-foreground">{lowStockProducts.length}</p>
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
