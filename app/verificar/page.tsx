"use client"

import { useActionState, useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Mail, ArrowLeft, AlertCircle } from "lucide-react"
import { verifyEmail, resendVerificationEmail, type VerifyState } from "@/app/lib/actions/verify"

const initialState: VerifyState = {}

function VerificarContent() {
  const searchParams = useSearchParams()
  const correo = searchParams.get("correo") ?? ""

  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [resendTimer, setResendTimer] = useState(300) // 5 minutos
  const [resendError, setResendError] = useState("")
  const [resendPending, setResendPending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const verifyWithCorreo = async (prevState: VerifyState, formData: FormData) => {
    formData.set("correo", correo)
    formData.set("token", code.join(""))
    return verifyEmail(prevState, formData)
  }

  const [state, formAction, isPending] = useActionState(verifyWithCorreo, initialState)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, "").slice(0, 6).split("")
      const newCode = [...code]
      chars.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char
      })
      setCode(newCode)
      const nextIndex = Math.min(index + chars.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      const newCode = [...code]
      newCode[index] = value.replace(/\D/g, "")
      setCode(newCode)
      if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResend = async () => {
    setResendError("")
    setResendPending(true)
    const result = await resendVerificationEmail(correo)
    setResendPending(false)
    if (result.error) {
      setResendError(result.error)
    } else {
      setCode(["", "", "", "", "", ""])
      setResendTimer(300)
      inputRefs.current[0]?.focus()
    }
  }

  const isCodeComplete = code.every(digit => digit !== "")

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <Link href="/registro" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al registro
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Verifica tu correo</h2>
            <p className="text-muted-foreground">
              Hemos enviado un código de 6 dígitos a
            </p>
            {correo && (
              <p className="text-foreground font-medium mt-1">{correo}</p>
            )}
          </div>

          {(state.error || resendError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error ?? resendError}</AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-6">
            <div className="flex justify-center gap-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isPending || !isCodeComplete}
              className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Verificar Cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿No recibiste el código?{" "}
              {resendTimer > 0 ? (
                <span className="text-foreground">
                  Reenviar en {formatTimer(resendTimer)}
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendPending}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors disabled:opacity-50"
                >
                  {resendPending ? "Enviando..." : "Reenviar código"}
                </button>
              )}
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

export default function VerificarPage() {
  return (
    <Suspense>
      <VerificarContent />
    </Suspense>
  )
}
