"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

// ── 1. Enviar token de recuperación 

export type SendResetState = {
  error?: string
  success?: boolean
}

export async function sendResetToken(
  _prevState: SendResetState,
  formData: FormData
): Promise<SendResetState> {
  const correo = (formData.get("correo") as string).trim()

  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  // No revelamos si el correo existe o no (seguridad)
  if (!usuario) return { success: true }

  // Borrar tokens previos del usuario
  await prisma.token.deleteMany({ where: { usuarioId: usuario.id } })

  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expira = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.token.create({ data: { token, usuarioId: usuario.id, expira } })

  try {
    await sendPasswordResetEmail(correo, usuario.nombre, token)
  } catch {
    return { error: "No se pudo enviar el correo. Intenta de nuevo." }
  }

  return { success: true }
}

// ── 2. Verificar token (paso 1) ──

export type VerifyTokenState = {
  error?: string
  valid?: boolean
}

export async function verifyResetToken(
  _prevState: VerifyTokenState,
  formData: FormData
): Promise<VerifyTokenState> {
  const token = (formData.get("token") as string).trim()

  const registro = await prisma.token.findUnique({ where: { token } })

  if (!registro) return { error: "Código inválido." }

  if (registro.expira < new Date()) {
    await prisma.token.delete({ where: { id: registro.id } })
    return { error: "El código expiró. Solicita uno nuevo." }
  }

  return { valid: true }
}

// ── 3. Cambiar contraseña (paso 2) ──

const changePasswordSchema = z.object({
  token: z.string().length(6, "El código debe tener 6 dígitos"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayúscula")
    .regex(/[a-z]/, "Debe contener una minúscula")
    .regex(/[0-9]/, "Debe contener un número"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type ChangePasswordState = {
  errors?: {
    token?: string[]
    password?: string[]
    confirmPassword?: string[]
    general?: string[]
  }
}

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { token, password } = parsed.data

  const registro = await prisma.token.findUnique({
    where: { token },
    include: { usuario: true },
  })

  if (!registro) {
    return { errors: { token: ["Código inválido."] } }
  }

  if (registro.expira < new Date()) {
    await prisma.token.delete({ where: { id: registro.id } })
    return { errors: { token: ["El código expiró. Solicita uno nuevo."] } }
  }

  const contrasena = await bcrypt.hash(password, 10)

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { contrasena },
    }),
    prisma.token.delete({ where: { id: registro.id } }),
  ])

  redirect("/?passwordChanged=true")
}
