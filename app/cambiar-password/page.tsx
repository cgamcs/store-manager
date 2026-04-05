"use client"

import { useActionState, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShoppingCart, Lock, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import {
  verifyResetToken, type VerifyTokenState,
  changePassword, type ChangePasswordState,
} from "@/app/lib/actions/password"

const initialVerify: VerifyTokenState = {}
const initialChange: ChangePasswordState = {}

export default function CambiarPasswordPage() {
  const [step, setStep] = useState<"token" | "password">("token")
  const [verifiedToken, setVerifiedToken] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Step 1 — verify token
  const handleVerify = async (prevState: VerifyTokenState, formData: FormData) => {
    const token = code.join("")
    formData.set("token", token)
    const result = await verifyResetToken(prevState, formData)
    if (result.valid) {
      setVerifiedToken(token)
      setStep("password")
    }
    return result
  }
  const [verifyState, verifyAction, verifyPending] = useActionState(handleVerify, initialVerify)

  // Step 2 — change password
  const handleChange = async (prevState: ChangePasswordState, formData: FormData) => {
    formData.set("token", verifiedToken)
    formData.set("password", password)
    formData.set("confirmPassword", confirmPassword)
    return changePassword(prevState, formData)
  }
  const [changeState, changeAction, changePending] = useActionState(handleChange, initialChange)

  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", met: password.length >= 8 },
    { label: "Una letra mayúscula", met: /[A-Z]/.test(password) },
    { label: "Una letra minúscula", met: /[a-z]/.test(password) },
    { label: "Un número", met: /[0-9]/.test(password) },
  ]
  const allRequirementsMet = passwordRequirements.every(r => r.met)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isCodeComplete = code.every(d => d !== "")

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, "").slice(0, 6).split("")
      const newCode = [...code]
      chars.forEach((char, i) => { if (index + i < 6) newCode[index + i] = char })
      setCode(newCode)
      inputRefs.current[Math.min(index + chars.length, 5)]?.focus()
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

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-linear-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <Link
          href="/recuperar"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-primary transition-colors" />
            <div className={`w-12 h-1 rounded-full transition-colors duration-500 ${step === "password" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${step === "password" ? "bg-primary" : "bg-muted"}`} />
          </div>

          {/* ── Paso 1: código ── */}
          <div className={`transition-all duration-500 ${step === "token" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 absolute pointer-events-none"}`}>
            {step === "token" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Ingresa el código</h2>
                  <p className="text-muted-foreground">
                    Introduce el código de 6 dígitos que enviamos a tu correo
                  </p>
                </div>

                {verifyState.error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{verifyState.error}</AlertDescription>
                  </Alert>
                )}

                <form action={verifyAction} className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-muted/50 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={verifyPending || !isCodeComplete}
                    className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300"
                  >
                    {verifyPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verificando...
                      </span>
                    ) : (
                      "Verificar Código"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>

          {/* ── Paso 2: nueva contraseña ── */}
          <div className={`transition-all duration-500 ${step === "password" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 absolute pointer-events-none"}`}>
            {step === "password" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Nueva contraseña</h2>
                  <p className="text-muted-foreground">Crea una nueva contraseña segura para tu cuenta</p>
                </div>

                {changeState.errors?.general && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{changeState.errors.general[0]}</AlertDescription>
                  </Alert>
                )}

                <form action={changeAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">Nueva contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
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
                          <div key={i} className={`flex items-center gap-1 text-xs ${req.met ? "text-[oklch(0.6_0.15_145)]" : "text-muted-foreground"}`}>
                            {req.met ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {req.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {changeState.errors?.password && (
                      <p className="text-xs text-destructive">{changeState.errors.password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="********"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 h-11 rounded-xl bg-muted/50 border-border/50 ${confirmPassword && (passwordsMatch ? "border-[oklch(0.6_0.15_145)]" : "border-destructive")}`}
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
                    {changeState.errors?.confirmPassword && (
                      <p className="text-xs text-destructive">{changeState.errors.confirmPassword[0]}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={changePending || !passwordsMatch || !allRequirementsMet}
                    className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 transition-all duration-300 mt-4"
                  >
                    {changePending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cambiando contraseña...
                      </span>
                    ) : (
                      "Cambiar Contraseña"
                    )}
                  </Button>
                </form>
              </>
            )}
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
