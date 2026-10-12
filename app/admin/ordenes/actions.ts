"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { ordenSchema, updateEstadoSchema } from "@/lib/validations/orden"
import { revalidatePath } from "next/cache"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
  return session.user as { id?: string; rolId?: number }
}

export async function getOrdenes() {
  await requireAdmin()
  const ordenes = await prisma.ordenCompra.findMany({
    include: {
      proveedor: { select: { id: true, nombreComercial: true, correo: true } },
      detalles: {
        include: { producto: { select: { id: true, nombre: true } } },
      },
    },
    orderBy: { fechaOrden: "desc" },
  })
  return JSON.parse(JSON.stringify(ordenes))
}

export async function getProveedoresYProductos() {
  await requireAdmin()
  const [proveedores, productos] = await Promise.all([
    prisma.proveedor.findMany({
      orderBy: { nombreComercial: "asc" },
      select: {
        id: true,
        nombreComercial: true,
        correo: true,
        cantidadMinimaOrden: true,
        tiempoEntregaDias: true,
      },
    }),
    prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        precioCompra: true,
        precioVenta: true,
        categoriaId: true,
        proveedorId: true,
        categoria: { select: { id: true, nombre: true, porcentajeGanancia: true } },
      },
    }),
  ])
  return {
    proveedores: JSON.parse(JSON.stringify(proveedores)),
    productos: JSON.parse(JSON.stringify(productos)),
  }
}

export async function createOrden(data: unknown) {
  const user = await requireAdmin()
  const parsed = ordenSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { error: firstError ?? "Datos inválidos" }
  }

  const { proveedorId, detalles } = parsed.data
  const total = detalles.reduce(
    (acc, d) => acc + d.precioCompra * d.cantidad * (d.piezasPorUnidad ?? 1),
    0
  )

  const usuarioId = parseInt(user.id ?? "0")
  if (!usuarioId) return { error: "No se pudo obtener el usuario" }

  const orden = await prisma.ordenCompra.create({
    data: {
      proveedorId,
      usuarioId,
      estado: "pendiente",
      total,
      detalles: {
        create: detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          unidad: d.unidad,
          piezasPorUnidad: d.piezasPorUnidad ?? 1,
          precioCompra: d.precioCompra,
          precioVenta: d.precioVenta ?? null,
          fechaCaducidad: d.fechaCaducidad ? new Date(d.fechaCaducidad) : null,
        })),
      },
    },
    include: {
      proveedor: { select: { id: true, nombreComercial: true, correo: true } },
      detalles: {
        include: { producto: { select: { id: true, nombre: true } } },
      },
    },
  })

  revalidatePath("/admin/ordenes")
  return { data: JSON.parse(JSON.stringify(orden)) }
}

export async function updateOrdenEstado(id: number, data: unknown) {
  await requireAdmin()
  const parsed = updateEstadoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Estado inválido" }
  }

  const { estado } = parsed.data

  // Al pasar a "recibida", el trigger trg_recibir_orden_compra
  // (AFTER UPDATE ON "OrdenCompra") suma las piezas al stock, registra el
  // MovimientoInventario y crea el lote en FechaCaducidad. Aquí sólo se cambia
  // el estado y se sincroniza el precio de compra, que el trigger no toca.
  if (estado === "recibida") {
    const ordenActual = await prisma.ordenCompra.findUnique({
      where: { id },
      select: { estado: true, detalles: true },
    })

    if (!ordenActual) return { error: "Orden no encontrada" }
    if (ordenActual.estado === "recibida") {
      return { error: "La orden ya fue marcada como recibida" }
    }

    await prisma.$transaction(async (tx) => {
      await tx.ordenCompra.update({ where: { id }, data: { estado } })

      for (const detalle of ordenActual.detalles) {
        if (!detalle.precioCompra) continue

        const producto = await tx.producto.findUnique({
          where: { id: detalle.productoId },
          select: { precioCompra: true },
        })
        if (
          producto &&
          Number(producto.precioCompra) !== Number(detalle.precioCompra)
        ) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { precioCompra: detalle.precioCompra },
          })
        }
      }
    })
  } else {
    await prisma.ordenCompra.update({ where: { id }, data: { estado } })
  }

  revalidatePath("/admin/ordenes")
  return { ok: true }
}

export async function deleteOrden(id: number) {
  await requireAdmin()
  // detalles se borran en cascada por onDelete: Cascade
  await prisma.ordenCompra.delete({ where: { id } })
  revalidatePath("/admin/ordenes")
  return { ok: true }
}
