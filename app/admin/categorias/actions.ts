"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// rolId 1 = administrador (seed.ts)
const ADMIN_ROL_ID = 1

async function requireAdmin() {
  const session = await auth()
  const rolId = (session?.user as { rolId?: number })?.rolId
  if (rolId !== ADMIN_ROL_ID) {
    throw new Error("No autorizado: se requiere rol de Administrador")
  }
}

// Tipos
export type CategoriaDB = {
  id: number
  nombre: string
  margen_ganancia: number
  productCount: number
}

export type CreateCategoryState = {
  error?: string
}

// getCategories
export async function getCategories(): Promise<CategoriaDB[]> {
  await requireAdmin()

  const rows = await prisma.categoria.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { productos: true } } },
  })

  return rows.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    margen_ganancia: Number(c.porcentajeGanancia),
    productCount: c._count.productos,
  }))
}

// createCategory
const createSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  margen_ganancia: z
    .number({ invalid_type_error: "El margen debe ser un número" })
    .positive("El margen debe ser mayor a 0"),
})

export async function createCategory(
  data: { nombre: string; margen_ganancia: number }
): Promise<CreateCategoryState> {
  await requireAdmin()

  const parsed = createSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  await prisma.categoria.create({
    data: {
      nombre: parsed.data.nombre.trim(),
      porcentajeGanancia: parsed.data.margen_ganancia,
    },
  })

  revalidatePath("/admin/categorias")
  revalidatePath("/pos")
  return {}
}

// updateCategory
const updateSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, "El nombre es requerido"),
  margen_ganancia: z
    .number({ invalid_type_error: "El margen debe ser un número" })
    .positive("El margen debe ser mayor a 0"),
})

export async function updateCategory(
  data: { id: number; nombre: string; margen_ganancia: number }
): Promise<{ error?: string }> {
  await requireAdmin()

  const parsed = updateSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  await prisma.categoria.update({
    where: { id: parsed.data.id },
    data: {
      nombre: parsed.data.nombre.trim(),
      porcentajeGanancia: parsed.data.margen_ganancia,
    },
  })

  revalidatePath("/admin/categorias")
  revalidatePath("/pos")
  return {}
}

// deleteCategory
export async function deleteCategory(id: number): Promise<{ error?: string }> {
  await requireAdmin()

  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: { _count: { select: { productos: true } } },
  })

  if (!categoria) return { error: "Categoría no encontrada" }

  if (categoria._count.productos > 0) {
    return {
      error: `No se puede eliminar: tiene ${categoria._count.productos} producto(s) asociado(s). Reasígnalos primero.`,
    }
  }

  await prisma.categoria.delete({ where: { id } })

  revalidatePath("/admin/categorias")
  revalidatePath("/pos")
  return {}
}
