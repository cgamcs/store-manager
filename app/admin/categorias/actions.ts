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
  return {}
}
