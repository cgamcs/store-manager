"use client"

import { useState, useMemo } from "react"
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
  Tag,
  Percent
} from "lucide-react"
import { productos, categorias } from "@/lib/mock-data"
import type { CartItem } from "@/lib/types"
import { LogoutButton } from "@/components/logout-button"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  const filteredProducts = useMemo(() => {
    return productos.filter(product => {
      const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === null || product.categoria_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const addToCart = (product: typeof productos[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...product, cantidad: 1 }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQuantity = item.cantidad + delta
          if (newQuantity <= 0) return null
          return { ...item, cantidad: newQuantity }
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const subtotal = cart.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0)
  const discount = cart.reduce((acc, item) => {
    if (item.descuento) {
      return acc + (item.precio_venta * item.cantidad * item.descuento / 100)
    }
    return acc
  }, 0)
  const total = subtotal - discount

  const clearCart = () => setCart([])

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg overflow-hidden">
              {/* <ShoppingCart className="w-5 h-5 text-primary-foreground" /> */}
              <img src="/icon-light.png" alt="Logotipo" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">Punto de Venta</h1>
              <p className="text-muted-foreground text-sm">Abarrotes Don Tello</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm">Juan Hernández</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Search and Categories */}
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
                className={`rounded-xl shrink-0 ${selectedCategory === null ? 'bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg' : 'bg-card'}`}
              >
                Todos
              </Button>
              {categorias.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl shrink-0 ${selectedCategory === cat.id ? 'bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg' : 'bg-card'}`}
                >
                  {cat.nombre}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-200 text-left group"
                >
                  <div className="w-full aspect-square rounded-xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center mb-3 group-hover:from-primary/10 group-hover:to-accent/10 transition-colors">
                    <Package className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">{product.nombre}</h3>
                  <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.descuento ? (
                        <>
                          <span className="text-xs text-muted-foreground line-through">${product.precio_venta.toFixed(2)}</span>
                          <span className="font-bold text-[oklch(0.6_0.15_145)] text-lg">${(product.precio_venta * (1 - product.descuento / 100)).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-primary text-lg">${product.precio_venta.toFixed(2)}</span>
                      )}
                    </div>
                    {product.descuento && (
                      <span className="text-xs bg-[oklch(0.6_0.15_145)]/20 text-[oklch(0.5_0.15_145)] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Percent className="w-3 h-3" />
                        -{product.descuento}%
                      </span>
                    )}
                  </div>
                  {product.stock_actual <= product.stock_minimo && (
                    <p className="text-xs text-destructive mt-1">Stock bajo: {product.stock_actual}</p>
                  )}
                </button>
              ))}
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
                {cart.map(item => {
                  const precioConDescuento = item.descuento
                    ? item.precio_venta * (1 - item.descuento / 100)
                    : item.precio_venta
                  const subtotalItem = precioConDescuento * item.cantidad

                  return (
                    <div key={item.id} className={`rounded-xl p-3 border ${item.descuento ? 'bg-[oklch(0.6_0.15_145)]/5 border-[oklch(0.6_0.15_145)]/30' : 'bg-muted/30 border-border/30'}`}>
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
                                <p className="text-xs text-muted-foreground line-through">${item.precio_venta.toFixed(2)}</p>
                                <p className="text-xs text-[oklch(0.6_0.15_145)] font-medium">${precioConDescuento.toFixed(2)} c/u</p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">${item.precio_venta.toFixed(2)} c/u</p>
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
                          <span className="w-10 text-center font-medium text-foreground">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-lg bg-card border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4 text-foreground" />
                          </button>
                        </div>
                        <span className={`font-bold ${item.descuento ? 'text-[oklch(0.6_0.15_145)]' : 'text-foreground'}`}>
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
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[oklch(0.6_0.15_145)]">
                  <span>Descuento</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border/50">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-xl bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg flex items-center justify-center gap-2 text-lg font-semibold hover:shadow-xl transition-shadow"
              disabled={cart.length === 0}
              onClick={() => {
                alert(`Venta generada exitosamente!\n\nTotal: $${total.toFixed(2)}\nProductos: ${cart.length}\nUnidades: ${cart.reduce((acc, item) => acc + item.cantidad, 0)}${discount > 0 ? `\nDescuentos aplicados: $${discount.toFixed(2)}` : ''}`)
                clearCart()
              }}
            >
              <CheckCircle className="w-6 h-6" />
              Finalizar Venta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
