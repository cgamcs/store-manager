"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export type ProductoPOS = {
  id: number
  nombre: string
  sku: string | null
  precioVenta: number
  stockActual: number
  stockMinimo: number
  categoriaId: number
  descuento: number | null
}

export type CategoriaPOS = {
  id: number
  nombre: string
}

export type ItemVenta = {
  productoId: number
  cantidad: number
  precioUnitario: number
}

export async function getProductosPOS(): Promise<ProductoPOS[]> {
  const productos = await prisma.producto.findMany({
    where: { stockActual: { gt: 0 } },
    select: {
      id: true,
      nombre: true,
      sku: true,
      precioVenta: true,
      stockActual: true,
      stockMinimo: true,
      categoriaId: true,
      descuentos: {
        where: { descuento: { activo: true } },
        select: { descuento: { select: { porcentaje: true } } },
        take: 1,
      },
    },
    orderBy: { nombre: "asc" },
  })

  return productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    sku: p.sku,
    precioVenta: Number(p.precioVenta),
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    categoriaId: p.categoriaId,
    descuento: p.descuentos[0]?.descuento.porcentaje
      ? Number(p.descuentos[0].descuento.porcentaje)
      : null,
  }))
}

export async function getCategoriasPOS(): Promise<CategoriaPOS[]> {
  return prisma.categoria.findMany({
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })
}

export async function registrarVenta(
  items: ItemVenta[],
  total: number
): Promise<{ success: true; ventaId: number } | { success: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "No autorizado" }
  }
  const cajeroId = Number(session.user.id)

  try {
    const ventaId = await prisma.$transaction(async (tx) => {
      // 1. Verificar stock suficiente
      for (const item of items) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          select: { stockActual: true, nombre: true },
        })
        if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`)
        if (producto.stockActual < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stockActual}`
          )
        }
      }

      // 2. Crear Venta
      const venta = await tx.venta.create({
        data: { cajeroId, total },
      })

      // 3. Crear VentaDetalles y reducir stock con lógica FEFO
      for (const item of items) {
        await tx.ventaDetalle.create({
          data: {
            ventaId: venta.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          },
        })

        // FEFO: consumir del lote más cercano a vencer primero
        const lotes = await tx.fechaCaducidad.findMany({
          where: { productoId: item.productoId },
          orderBy: { fechaCaducidad: "asc" },
        })

        let restante = item.cantidad
        for (const lote of lotes) {
          if (restante <= 0) break
          if (lote.cantidad <= restante) {
            restante -= lote.cantidad
            await tx.fechaCaducidad.delete({ where: { id: lote.id } })
          } else {
            await tx.fechaCaducidad.update({
              where: { id: lote.id },
              data: { cantidad: lote.cantidad - restante },
            })
            restante = 0
          }
        }

        // Actualizar stock general del producto
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: item.cantidad } },
        })
      }

      return venta.id
    })

    revalidatePath("/pos")
    return { success: true, ventaId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al registrar la venta",
    }
  }
}
