"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, ShoppingCart, User, Mail, Lock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { registerUser, type RegisterState } from "@/app/lib/actions/auth"

const initialState: RegisterState = {}

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [state, formAction, isPending] = useActionState(registerUser, initialState)

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Una letra minúscula", met: /[a-z]/.test(password) },
    { label: "Un número", met: /[0-9]/.test(password) },
  ]

  const allRequirementsMet = passwordRequirements.every(r => r.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  return (
    <div className="min-h-screen flex">
      {/* Left side - Gradient background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[oklch(0.55_0.2_25)] via-[oklch(0.50_0.22_20)] to-[oklch(0.60_0.18_35)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTQiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center text-balance">Únete a <br></br> Abarrotes Don Tello</h1>
          <p className="text-xl text-white/80 text-center max-w-md text-pretty">
            Todo lo que necesitas en un solo lugar.
          </p>
          <div className="mt-12 space-y-4 text-left max-w-sm">
            {["Control total de inventario", "Reportes en tiempo real", "Gestión de proveedores", "Punto de venta integrado"].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-white/90 shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-br from-background to-muted/30 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Abarrotes Don Tello</h1>
          </div>

          <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Crear cuenta</h2>
              <p className="text-muted-foreground">Completa tus datos para registrarte</p>
            </div>

            {state.errors?.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.errors.general[0]}</AlertDescription>
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-foreground font-medium">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Juan"
                      className="pl-10 h-11 rounded-xl bg-muted/50 border-border/50"
                      required
                    />
                  </div>
                  {state.errors?.nombre && (
                    <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos" className="text-foreground font-medium">Apellidos</Label>
                  <Input
                    id="apellidos"
                    name="apellidos"
                    type="text"
                    placeholder="Pérez García"
                    className="h-11 rounded-xl bg-muted/50 border-border/50"
                    required
                  />
                  {state.errors?.apellidos && (
                    <p className="text-xs text-destructive">{state.errors.apellidos[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-foreground font-medium">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-10 h-11 rounded-xl bg-muted/50 border-border/50"
                    required
                  />
                </div>
                {state.errors?.correo && (
                  <p className="text-xs text-destructive">{state.errors.correo[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className={`flex items-center gap-1 text-xs ${req.met ? 'text-[oklch(0.6_0.15_145)]' : 'text-muted-foreground'}`}>
                        {req.met ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {req.label}
                      </div>
                    ))}
                  </div>
                )}
                {state.errors?.password && (
                  <p className="text-xs text-destructive">{state.errors.password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border/50 ${confirmPassword && (passwordsMatch ? 'border-[oklch(0.6_0.15_145)]' : 'border-destructive')}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
                {state.errors?.confirmPassword && (
                  <p className="text-xs text-destructive">{state.errors.confirmPassword[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending || !passwordsMatch || !allRequirementsMet}
                className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 mt-6"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
