"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ClipboardList,
  Tags,
  LayoutGrid,
  ChevronLeft,
  Bell,
  Menu
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/logout-button"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/ordenes", label: "Órdenes de Compra", icon: ClipboardList },
  { href: "/admin/descuentos", label: "Descuentos", icon: Tags },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/30 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} hidden lg:flex flex-col bg-card border-r border-border/50 shadow-xl transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              {/* <ShoppingCart className="w-5 h-5 text-primary-foreground" /> */}
              <img src="/icon-light.png" alt="Logotipo" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-foreground">Abarrotes Don Tello</h1>
                <p className="text-xs text-muted-foreground">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${collapsed ? 'justify-center px-3' : ''}
                `}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'group-hover:text-primary'}`} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full rounded-xl ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span className="ml-2">Colapsar</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-card border-r border-border/50 shadow-xl z-50 transform transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">Abarrotes Don Tello</h1>
              <p className="text-xs text-muted-foreground">Panel Admin</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-linear-to-r from-primary to-accent text-primary-foreground shadow-lg' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-bold text-foreground text-lg">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-muted-foreground text-sm hidden sm:block">
                Gestiona tu tienda de abarrotes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="font-bold text-primary">AP</span>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
