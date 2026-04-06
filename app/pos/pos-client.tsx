"use client"

import { useState, useMemo, useTransition, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  User,
  Package,
  Percent,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { registrarVenta } from "./actions"
import type { ProductoPOS, CategoriaPOS } from "./actions"

const SYNC_INTERVAL_MS = 30_000 // 30 segundos

type CartItem = ProductoPOS & { cantidad: number }

interface POSClientProps {
  productos: ProductoPOS[]
  categorias: CategoriaPOS[]
  cajeroNombre: string
}

export function POSClient({ productos, categorias, cajeroNombre }: POSClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [confirmacion, setConfirmacion] = useState<{ ventaId: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const router = useRouter()

  const syncData = useCallback(() => {
    setIsSyncing(true)
    router.refresh()
    setLastSync(new Date())
    setTimeout(() => setIsSyncing(false), 800)
  }, [router])

  useEffect(() => {
    const interval = setInterval(syncData, SYNC_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [syncData])

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === null || p.categoriaId === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [productos, searchQuery, selectedCategory])

  const addToCart = (product: ProductoPOS) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.cantidad >= product.stockActual) return prev
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [...prev, { ...product, cantidad: 1 }]
    })
  }

  const updateQuantity = (productoId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productoId) return item
          const nuevaCantidad = item.cantidad + delta
          if (nuevaCantidad <= 0) return null
          if (nuevaCantidad > item.stockActual) return item
          return { ...item, cantidad: nuevaCantidad }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productoId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productoId))
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((acc, item) => {
    const precio = item.descuento
      ? item.precioVenta * (1 - item.descuento / 100)
      : item.precioVenta
    return acc + precio * item.cantidad
  }, 0)

  const descuentoTotal = cart.reduce((acc, item) => {
    if (!item.descuento) return acc
    return acc + item.precioVenta * item.cantidad * (item.descuento / 100)
  }, 0)

  const total = subtotal

  const handleFinalizarVenta = () => {
    setError(null)
    startTransition(async () => {
      const items = cart.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        precioUnitario: item.descuento
          ? item.precioVenta * (1 - item.descuento / 100)
          : item.precioVenta,
      }))

      const resultado = await registrarVenta(items, total)

      if (resultado.success) {
        setConfirmacion({ ventaId: resultado.ventaId, total })
        clearCart()
      } else {
        setError(resultado.error)
      }
    })
  }

  const handleNuevaVenta = () => {
    setConfirmacion(null)
    setError(null)
  }

  if (confirmacion) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="bg-card rounded-3xl p-12 shadow-xl border border-border/50 flex flex-col items-center gap-6 max-w-md w-full mx-4">
          <div className="w-24 h-24 rounded-full bg-[oklch(0.6_0.15_145)]/20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[oklch(0.6_0.15_145)]" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-1">¡Venta Registrada!</h2>
            <p className="text-muted-foreground">Folio #{confirmacion.ventaId}</p>
          </div>
          <div className="bg-muted/50 rounded-2xl px-8 py-4 text-center w-full">
            <p className="text-sm text-muted-foreground mb-1">Total cobrado</p>
            <p className="text-4xl font-bold text-foreground">${confirmacion.total.toFixed(2)}</p>
          </div>
          <Button
            onClick={handleNuevaVenta}
            className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg text-base font-semibold"
          >
            Nueva Venta
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/icon-light.png" alt="Logotipo" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Punto de Venta</h1>
              <p className="text-muted-foreground text-sm">Abarrotes Don Tello</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={syncData}
              disabled={isSyncing}
              title={`Última sync: ${lastSync.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Sincronizando..." : lastSync.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm">{cajeroNombre}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar producto por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-card border-border/50 shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-xl shrink-0 ${selectedCategory === null ? "bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg" : "bg-card"}`}
              >
                Todos
              </Button>
              {categorias.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl shrink-0 ${selectedCategory === cat.id ? "bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg" : "bg-card"}`}
                >
                  {cat.nombre}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const precioFinal = product.descuento
                  ? product.precioVenta * (1 - product.descuento / 100)
                  : product.precioVenta
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stockActual === 0}
                    className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-full aspect-square rounded-xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center mb-3 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors">
                      <Package className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                      {product.nombre}
                    </h3>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.descuento ? (
                          <>
                            <span className="text-xs text-muted-foreground line-through">
                              ${product.precioVenta.toFixed(2)}
                            </span>
                            <span className="font-bold text-[oklch(0.6_0.15_145)] text-lg">
                              ${precioFinal.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-primary text-lg">
                            ${product.precioVenta.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.descuento && (
                        <span className="text-xs bg-[oklch(0.6_0.15_145)]/20 text-[oklch(0.5_0.15_145)] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                          <Percent className="w-3 h-3" />
                          -{product.descuento}%
                        </span>
                      )}
                    </div>
                    {product.stockActual <= product.stockMinimo && (
                      <p className="text-xs text-destructive mt-1">
                        Stock bajo: {product.stockActual}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-card border-l border-border/50 flex flex-col shadow-xl">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">Resumen de Venta</h2>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <p className="font-medium">Carrito vacío</p>
                <p className="text-sm">Selecciona productos para agregar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const precioConDescuento = item.descuento
                    ? item.precioVenta * (1 - item.descuento / 100)
                    : item.precioVenta
                  const subtotalItem = precioConDescuento * item.cantidad
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-3 border ${item.descuento ? "bg-[oklch(0.6_0.15_145)]/5 border-[oklch(0.6_0.15_145)]/30" : "bg-muted/30 border-border/30"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-sm">{item.nombre}</h4>
                            {item.descuento && (
                              <span className="text-[10px] bg-[oklch(0.6_0.15_145)] text-white px-1.5 py-0.5 rounded-full font-medium">
                                -{item.descuento}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.descuento ? (
                              <>
                                <p className="text-xs text-muted-foreground line-through">
                                  ${item.precioVenta.toFixed(2)}
                                </p>
                                <p className="text-xs text-[oklch(0.6_0.15_145)] font-medium">
                                  ${precioConDescuento.toFixed(2)} c/u
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                ${item.precioVenta.toFixed(2)} c/u
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="w-10 text-center font-medium text-foreground">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                        </div>
                        <span
                          className={`font-bold ${item.descuento ? "text-[oklch(0.6_0.15_145)]" : "text-foreground"}`}
                        >
                          ${subtotalItem.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="p-4 border-t border-border/50 bg-linear-to-t from-muted/50 to-transparent">
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${(subtotal + descuentoTotal).toFixed(2)}</span>
              </div>
              {descuentoTotal > 0 && (
                <div className="flex justify-between text-[oklch(0.6_0.15_145)]">
                  <span>Descuento</span>
                  <span>-${descuentoTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border/50">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg flex items-center justify-center gap-2 text-lg font-semibold hover:shadow-xl transition-shadow disabled:opacity-70"
              disabled={cart.length === 0 || isPending}
              onClick={handleFinalizarVenta}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Finalizar Venta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
