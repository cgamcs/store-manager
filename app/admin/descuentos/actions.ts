"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/src/generated/prisma/client"
import { z } from "zod"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

const descuentoSchema = z.object({
  nombre: z.string().min(1),
  porcentaje: z.number().min(1).max(100),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().optional(),
  activo: z.boolean(),
  productosIds: z.array(z.number()).min(1),
})

export type DescuentoWithProductos = Prisma.DescuentoGetPayload<{
  include: {
    productos: {
      include: {
        producto: {
          include: { categoria: true; fechasCaducidad: true }
        }
      }
    }
  }
}>

export type ProductoMerma = Prisma.ProductoGetPayload<{
  include: { categoria: true; fechasCaducidad: true; proveedor: true }
}>

// Desactiva descuentos cuya fecha fin ya pasó o cuyos productos merma tienen stock = 0
export async function checkAndDeactivateExpiredDiscounts() {
  await requireAdmin()

  const activeDiscounts = await prisma.descuento.findMany({
    where: { activo: true },
    include: {
      productos: {
        include: { producto: true },
      },
    },
  })

  const toDeactivate: number[] = []

  for (const d of activeDiscounts) {
    if (d.fechaFin && d.fechaFin < new Date()) {
      toDeactivate.push(d.id)
      continue
    }
    // Si todos los productos merma del descuento tienen stock = 0, se cierra
    const mermaProducts = d.productos.filter((dp) => dp.producto.esMerma)
    if (
      mermaProducts.length > 0 &&
      mermaProducts.every((dp) => dp.producto.stockActual === 0)
    ) {
      toDeactivate.push(d.id)
    }
  }

  if (toDeactivate.length > 0) {
    await prisma.descuento.updateMany({
      where: { id: { in: toDeactivate } },
      data: { activo: false },
    })
  }
}

export async function getDescuentos(): Promise<DescuentoWithProductos[]> {
  await requireAdmin()
  const descuentos = await prisma.descuento.findMany({
    include: {
      productos: {
        include: {
          producto: {
            include: { categoria: true, fechasCaducidad: true },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  })
  return JSON.parse(JSON.stringify(descuentos))
}

export async function getMermaProducts(): Promise<ProductoMerma[]> {
  await requireAdmin()
  const productos = await prisma.producto.findMany({
    where: { esMerma: true },
    include: { categoria: true, fechasCaducidad: true, proveedor: true },
    orderBy: { nombre: "asc" },
  })
  return JSON.parse(JSON.stringify(productos))
}

export async function createDescuento(data: unknown) {
  await requireAdmin()
  const parsed = descuentoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }
  const { nombre, porcentaje, fechaInicio, fechaFin, activo, productosIds } = parsed.data

  const descuento = await prisma.descuento.create({
    data: {
      nombre,
      porcentaje,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      activo,
      productos: {
        create: productosIds.map((id) => ({ productoId: id })),
      },
    },
    include: {
      productos: {
        include: {
          producto: { include: { categoria: true, fechasCaducidad: true } },
        },
      },
    },
  })

  revalidatePath("/admin/descuentos")
  return { data: JSON.parse(JSON.stringify(descuento)) }
}

export async function updateDescuento(id: number, data: unknown) {
  await requireAdmin()
  const parsed = descuentoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }
  const { nombre, porcentaje, fechaInicio, fechaFin, activo, productosIds } = parsed.data

  // Reemplazar productos asociados
  await prisma.descuentoProducto.deleteMany({ where: { descuentoId: id } })

  const descuento = await prisma.descuento.update({
    where: { id },
    data: {
      nombre,
      porcentaje,
      fechaInicio: new Date(fechaInicio),
      fechaFin: fechaFin ? new Date(fechaFin) : null,
      activo,
      productos: {
        create: productosIds.map((pid) => ({ productoId: pid })),
      },
    },
    include: {
      productos: {
        include: {
          producto: { include: { categoria: true, fechasCaducidad: true } },
        },
      },
    },
  })

  revalidatePath("/admin/descuentos")
  return { data: JSON.parse(JSON.stringify(descuento)) }
}

export async function toggleDescuento(id: number) {
  await requireAdmin()
  const current = await prisma.descuento.findUnique({ where: { id }, select: { activo: true } })
  if (!current) return { error: "No encontrado" }

  const descuento = await prisma.descuento.update({
    where: { id },
    data: { activo: !current.activo },
    include: {
      productos: {
        include: {
          producto: { include: { categoria: true, fechasCaducidad: true } },
        },
      },
    },
  })

  revalidatePath("/admin/descuentos")
  return { data: JSON.parse(JSON.stringify(descuento)) }
}

export async function deleteDescuento(id: number) {
  await requireAdmin()
  await prisma.descuento.delete({ where: { id } })
  revalidatePath("/admin/descuentos")
  return { ok: true }
}
