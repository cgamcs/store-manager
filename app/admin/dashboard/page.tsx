"use client"

import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingBag,
  AlertTriangle,
  Tag,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardStats, productosMasVendidos, productos, descuentos } from "@/lib/mock-data"

export default function DashboardPage() {
  const lowStockProducts = productos.filter(p => p.stock_actual <= p.stock_minimo)
  const activePromotions = descuentos.filter(d => d.activo)

  const stats = [
    { 
      label: "Ventas Hoy", 
      value: `$${dashboardStats.ventasHoy.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-[oklch(0.55_0.2_25)] to-[oklch(0.65_0.18_35)]"
    },
    { 
      label: "Ventas Semana", 
      value: `$${dashboardStats.ventasSemana.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "from-[oklch(0.6_0.15_145)] to-[oklch(0.65_0.12_160)]"
    },
    { 
      label: "Productos Vendidos", 
      value: dashboardStats.productosVendidosHoy.toString(),
      change: "+23",
      trend: "up",
      icon: Package,
      color: "from-[oklch(0.65_0.18_35)] to-[oklch(0.7_0.15_45)]"
    },
    { 
      label: "Ticket Promedio", 
      value: `$${dashboardStats.ticketPromedio.toFixed(2)}`,
      change: "-2.1%",
      trend: "down",
      icon: ShoppingBag,
      color: "from-[oklch(0.75_0.15_75)] to-[oklch(0.7_0.12_85)]"
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
                  <div className={`flex items-center gap-1 text-sm mt-1 ${stat.trend === 'up' ? 'text-[oklch(0.6_0.15_145)]' : 'text-destructive'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{stat.change}</span>
                    <span className="text-muted-foreground ml-1">vs ayer</span>
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
            <div className="space-y-3">
              {productosMasVendidos.map((product, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold text-primary text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.nombre}</p>
                    <p className="text-sm text-muted-foreground">{product.cantidad} unidades</p>
                  </div>
                  <p className="font-bold text-foreground">${product.total.toLocaleString('es-MX')}</p>
                </div>
              ))}
            </div>
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
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl bg-[oklch(0.75_0.15_75)]/10 border border-[oklch(0.75_0.15_75)]/20">
                    <div className="w-10 h-10 rounded-xl bg-[oklch(0.75_0.15_75)]/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[oklch(0.6_0.15_75)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{product.nombre}</p>
                      <p className="text-sm text-muted-foreground">Mínimo: {product.stock_minimo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[oklch(0.6_0.15_75)]">{product.stock_actual}</p>
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
                      -{promo.porcentaje}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Válido hasta: {new Date(promo.fecha_fin).toLocaleDateString('es-MX')}
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
          <p className="text-2xl font-bold text-foreground">{dashboardStats.clientesAtendidos}</p>
          <p className="text-sm text-muted-foreground">Clientes atendidos hoy</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">{productos.length}</p>
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
