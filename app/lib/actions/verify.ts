"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

export type VerifyState = {
  error?: string
}

export async function verifyEmail(
  _prevState: VerifyState,
  formData: FormData
): Promise<VerifyState> {
  const correo = formData.get("correo") as string
  const token = formData.get("token") as string

  const registro = await prisma.token.findUnique({
    where: { token },
    include: { usuario: true },
  })

  if (!registro || registro.usuario.correo !== correo) {
    return { error: "Código inválido. Verifica que lo hayas ingresado correctamente." }
  }

  if (registro.expira < new Date()) {
    await prisma.token.delete({ where: { id: registro.id } })
    return { error: "El código expiró. Solicita uno nuevo." }
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { correoVerificado: true },
    }),
    prisma.token.delete({ where: { id: registro.id } }),
  ])

  redirect("/?verified=true")
}

export async function resendVerificationEmail(correo: string): Promise<{ error?: string }> {
  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  if (!usuario) return { error: "No se encontró una cuenta con ese correo." }
  if (usuario.correoVerificado) return { error: "Este correo ya fue verificado." }

  // Eliminar tokens anteriores
  await prisma.token.deleteMany({ where: { usuarioId: usuario.id } })

  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expira = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.token.create({ data: { token, usuarioId: usuario.id, expira } })

  try {
    await sendVerificationEmail(correo, usuario.nombre, token)
  } catch {
    return { error: "No se pudo enviar el correo. Intenta de nuevo." }
  }

  return {}
}
