"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { proveedorSchema } from "@/lib/validations/proveedor"
import { revalidatePath } from "next/cache"

const ROL_ADMIN = 1

// Los métodos de pago viven en ProveedorMetodoPago (1FN); la UI sigue
// trabajando con string[].
const includeProveedor = {
  _count: { select: { productos: true, ordenes: true } },
  metodosPago: { select: { metodo: true } },
} as const

function toCliente(p: { metodosPago: { metodo: string }[] }) {
  return { ...JSON.parse(JSON.stringify(p)), metodosPago: p.metodosPago.map((m) => m.metodo) }
}

function metodosCreate(metodos: string[]) {
  return { create: [...new Set(metodos)].map((metodo) => ({ metodo })) }
}

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
    include: includeProveedor,
  })
  return proveedores.map(toCliente)
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

  const { metodosPago, ...datos } = parsed.data
  const proveedor = await prisma.proveedor.create({
    data: { ...datos, metodosPago: metodosCreate(metodosPago) },
    include: includeProveedor,
  })
  revalidatePath("/admin/proveedores")
  return { data: toCliente(proveedor) }
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

  const { metodosPago, ...datos } = parsed.data
  const proveedor = await prisma.proveedor.update({
    where: { id },
    data: { ...datos, metodosPago: { deleteMany: {}, ...metodosCreate(metodosPago) } },
    include: includeProveedor,
  })
  revalidatePath("/admin/proveedores")
  return { data: toCliente(proveedor) }
}

export async function deleteProvider(id: number) {
  await requireAdmin()

  const [productoCount, ordenCount] = await Promise.all([
    prisma.producto.count({ where: { proveedorId: id } }),
    prisma.ordenCompra.count({ where: { proveedorId: id } }),
  ])

  if (productoCount > 0 || ordenCount > 0) {
    return {
      ok: false,
      error: "No se puede eliminar un proveedor con productos u órdenes de compra registradas.",
    }
  }

  await prisma.proveedor.delete({ where: { id } })
  revalidatePath("/admin/proveedores")
  return { ok: true }
}
