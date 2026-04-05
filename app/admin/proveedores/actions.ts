"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { proveedorSchema } from "@/lib/validations/proveedor"
import { revalidatePath } from "next/cache"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

export async function getProviders() {
  await requireAdmin()
  const proveedores = await prisma.proveedor.findMany({
    orderBy: { nombreComercial: "asc" },
  })
  return JSON.parse(JSON.stringify(proveedores)).map((p: Record<string, unknown>) => ({
    ...p,
    codigo: p.codigo ?? "",
    cantidadMinimaOrden: p.cantidadMinimaOrden ?? 0,
    tiempoEntregaDias: p.tiempoEntregaDias ?? 1,
    metodosPago: Array.isArray(p.metodosPago) ? p.metodosPago : [],
  }))
}

export async function createProvider(data: unknown) {
  await requireAdmin()
  const parsed = proveedorSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors).flat()[0]
    return { error: firstError ?? "Datos inválidos" }
  }

  const existing = await prisma.proveedor.findFirst({
    where: {
      OR: [{ codigo: parsed.data.codigo }, { rfc: parsed.data.rfc }],
    },
  })
  if (existing) {
    if (existing.codigo === parsed.data.codigo) {
      return { error: "El código ya está en uso por otro proveedor" }
    }
    return { error: "El RFC ya está registrado por otro proveedor" }
  }

  const proveedor = await prisma.proveedor.create({ data: parsed.data })
  revalidatePath("/admin/proveedores")
  return { data: JSON.parse(JSON.stringify(proveedor)) }
}

export async function updateProvider(id: number, data: unknown) {
  await requireAdmin()
  const parsed = proveedorSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors).flat()[0]
    return { error: firstError ?? "Datos inválidos" }
  }

  const existing = await prisma.proveedor.findFirst({
    where: {
      AND: [
        { id: { not: id } },
        { OR: [{ codigo: parsed.data.codigo }, { rfc: parsed.data.rfc }] },
      ],
    },
  })
  if (existing) {
    if (existing.codigo === parsed.data.codigo) {
      return { error: "El código ya está en uso por otro proveedor" }
    }
    return { error: "El RFC ya está registrado por otro proveedor" }
  }

  const proveedor = await prisma.proveedor.update({
    where: { id },
    data: parsed.data,
  })
  revalidatePath("/admin/proveedores")
  return { data: JSON.parse(JSON.stringify(proveedor)) }
}

export async function deleteProvider(id: number) {
  await requireAdmin()
  await prisma.proveedor.delete({ where: { id } })
  revalidatePath("/admin/proveedores")
  return { ok: true }
}
