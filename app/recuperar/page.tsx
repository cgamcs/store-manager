"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Mail, ArrowLeft, KeyRound, AlertCircle } from "lucide-react"
import { sendResetToken, type SendResetState } from "@/app/lib/actions/password"

const initialState: SendResetState = {}

export default function RecuperarPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(sendResetToken, initialState)

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-[oklch(0.6_0.15_145)]/20 to-[oklch(0.6_0.15_145)]/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-[oklch(0.6_0.15_145)]" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Revisa tu correo</h2>
            <p className="text-muted-foreground mb-6">
              Si ese correo está registrado, recibirás un código para restablecer tu contraseña.
            </p>

            <Button
              onClick={() => router.push("/cambiar-password")}
              className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
            >
              Continuar
            </Button>

            <p className="text-muted-foreground text-sm mt-6">
              ¿No recibiste el correo?{" "}
              <Link href="/recuperar" className="text-primary hover:text-primary/80 font-medium">
                Intentar de nuevo
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <KeyRound className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-muted-foreground">
              Ingresa tu correo electrónico y te enviaremos un código para restablecerla
            </p>
          </div>

          {state.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-foreground font-medium">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-12 h-12 rounded-xl bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                "Enviar Instrucciones"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
              <Link href="/" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">Abarrotes Don Tello</span>
        </div>
      </div>
    </div>
  )
}
