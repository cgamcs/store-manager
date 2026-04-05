"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { Prisma } from "@/src/generated/prisma/client"

const registerSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  correo: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener una mayúscula")
    .regex(/[a-z]/, "Debe contener una minúscula")
    .regex(/[0-9]/, "Debe contener un número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export type RegisterState = {
  errors?: {
    nombre?: string[]
    apellidos?: string[]
    correo?: string[]
    password?: string[]
    confirmPassword?: string[]
    general?: string[]
  }
}

function generarToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    nombre: formData.get("nombre"),
    apellidos: formData.get("apellidos"),
    correo: formData.get("correo"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { nombre, apellidos, correo, password } = parsed.data

  const rolCajero = await prisma.rol.findFirst({ where: { nombre: "cajero" } })
  if (!rolCajero) {
    return { errors: { general: ["Rol 'Cajero' no encontrado. Contacta al administrador."] } }
  }

  const contrasena = await bcrypt.hash(password, 10)

  let usuario
  try {
    usuario = await prisma.usuario.create({
      data: {
        nombre: `${nombre} ${apellidos}`,
        correo,
        contrasena,
        rolId: rolCajero.id,
      },
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { correo: ["Este correo ya está registrado."] } }
    }
    return { errors: { general: ["Ocurrió un error al crear la cuenta. Intenta de nuevo."] } }
  }

  // Generar token y guardarlo con expiración de 5 minutos
  const token = generarToken()
  const expira = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.token.create({
    data: { token, usuarioId: usuario.id, expira },
  })

  try {
    await sendVerificationEmail(correo, nombre, token)
  } catch {
    // Si el correo falla, eliminar usuario para no dejar registros sin verificar huérfanos
    await prisma.usuario.delete({ where: { id: usuario.id } })
    return { errors: { general: ["No se pudo enviar el correo de verificación. Intenta de nuevo."] } }
  }

  redirect(`/verificar?correo=${encodeURIComponent(correo)}`)
}
