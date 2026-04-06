"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { cajeroSchema } from "@/lib/validations/usuario"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

const ROL_CAJERO = 2
const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

export async function getCajeros() {
  await requireAdmin()
  const cajeros = await prisma.usuario.findMany({
    where: { rolId: ROL_CAJERO },
    include: { perfilCajero: true },
    orderBy: { id: "asc" },
  })
  return JSON.parse(JSON.stringify(cajeros))
}

export async function searchUserByEmail(correo: string) {
  await requireAdmin()
  const usuario = await prisma.usuario.findUnique({
    where: { correo: correo.toLowerCase().trim() },
  })
  return usuario ? JSON.parse(JSON.stringify(usuario)) : null
}

export async function createCajero(data: unknown) {
  await requireAdmin()
  const parsed = cajeroSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }

  const { nombre, correo, contrasena, direccion, telefono, turno, nss, rfc, fechaIngreso, sueldo, horasSemana } = parsed.data

  const existingUser = await prisma.usuario.findUnique({ where: { correo } })

  let usuarioId: number

  if (existingUser) {
    if (existingUser.rolId !== ROL_CAJERO) {
      await prisma.usuario.update({
        where: { id: existingUser.id },
        data: { rolId: ROL_CAJERO },
      })
    }
    usuarioId = existingUser.id
  } else {
    const hashedPassword = await bcrypt.hash(contrasena || "cajero123", 10)
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasena: hashedPassword,
        rolId: ROL_CAJERO,
      },
    })
    usuarioId = newUser.id
  }

  await prisma.perfilCajero.upsert({
    where: { usuarioId },
    create: {
      usuarioId,
      direccion,
      telefono,
      turno,
      nss,
      rfc,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
      sueldo: sueldo ?? null,
      horasSemana: horasSemana ?? null,
    },
    update: {
      direccion,
      telefono,
      turno,
      nss,
      rfc,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
      sueldo: sueldo ?? null,
      horasSemana: horasSemana ?? null,
    },
  })

  revalidatePath("/admin/usuarios")
  return { ok: true }
}

export async function updateCajero(id: number, data: unknown) {
  await requireAdmin()
  const parsed = cajeroSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }

  const { nombre, correo, direccion, telefono, turno, nss, rfc, fechaIngreso, sueldo, horasSemana } = parsed.data

  await prisma.usuario.update({
    where: { id },
    data: { nombre, correo },
  })

  await prisma.perfilCajero.upsert({
    where: { usuarioId: id },
    create: {
      usuarioId: id,
      direccion,
      telefono,
      turno,
      nss,
      rfc,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
      sueldo: sueldo ?? null,
      horasSemana: horasSemana ?? null,
    },
    update: {
      direccion,
      telefono,
      turno,
      nss,
      rfc,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
      sueldo: sueldo ?? null,
      horasSemana: horasSemana ?? null,
    },
  })

  revalidatePath("/admin/usuarios")
  return { ok: true }
}

export async function toggleActivoCajero(id: number) {
  await requireAdmin()

  const perfil = await prisma.perfilCajero.findUnique({ where: { usuarioId: id } })
  if (!perfil) return { error: "El cajero no tiene perfil registrado" }

  await prisma.perfilCajero.update({
    where: { usuarioId: id },
    data: { activo: !perfil.activo },
  })

  revalidatePath("/admin/usuarios")
  return { ok: true, activo: !perfil.activo }
}

export async function deleteCajero(id: number) {
  await requireAdmin()

  const ventasCount = await prisma.venta.count({ where: { cajeroId: id } })
  if (ventasCount > 0) {
    return { error: `No se puede eliminar: el cajero tiene ${ventasCount} venta(s) registrada(s).` }
  }

  await prisma.perfilCajero.deleteMany({ where: { usuarioId: id } })
  await prisma.usuario.delete({ where: { id } })
  revalidatePath("/admin/usuarios")
  return { ok: true }
}
