"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productoSchema } from "@/lib/validations/producto"
import { ajustarStockSchema, registrarMermaSchema } from "@/lib/validations/inventario"
import { revalidatePath } from "next/cache"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

export async function actualizarMermas(diasUmbral = 7) {
  await requireAdmin()
  const umbral = new Date()
  umbral.setDate(umbral.getDate() + diasUmbral)

  const proximos = await prisma.fechaCaducidad.findMany({
    where: { fechaCaducidad: { lte: umbral } },
    select: { productoId: true },
    distinct: ["productoId"],
  })
  const idsProximos = proximos.map((f) => f.productoId)

  await prisma.$transaction([
    prisma.producto.updateMany({
      where: { id: { in: idsProximos.length ? idsProximos : [-1] } },
      data: { esMerma: true },
    }),
    prisma.producto.updateMany({
      where: { id: { notIn: idsProximos } },
      data: { esMerma: false },
    }),
  ])
}

export async function getProducts() {
  await requireAdmin()
  const productos = await prisma.producto.findMany({
    include: {
      categoria: true,
      proveedor: true,
      _count: { select: { ventaDetalles: true, ordenDetalles: true } },
    },
    orderBy: { id: "asc" },
  })
  return JSON.parse(JSON.stringify(productos))
}

export async function getCategoriasAndProveedores() {
  await requireAdmin()
  const [categorias, proveedores] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.proveedor.findMany({ orderBy: { nombreComercial: "asc" } }),
  ])
  return {
    categorias: JSON.parse(JSON.stringify(categorias)),
    proveedores: JSON.parse(JSON.stringify(proveedores)),
  }
}

export async function createProduct(data: unknown) {
  await requireAdmin()
  const parsed = productoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }
  const { nombre, sku, categoriaId, proveedorId, precioCompra, precioVenta, stockActual, stockMinimo } =
    parsed.data

  const session = await auth()
  const usuarioId = session?.user?.id ? Number(session.user.id) : undefined

  const producto = await prisma.$transaction(async (tx) => {
    const created = await tx.producto.create({
      data: {
        nombre,
        sku: sku ?? null,
        categoriaId,
        proveedorId,
        precioCompra,
        precioVenta,
        stockActual,
        stockMinimo,
      },
      include: {
        categoria: true,
        proveedor: true,
        _count: { select: { ventaDetalles: true, ordenDetalles: true } },
      },
    })

    // Registrar movimiento de stock inicial
    if (stockActual > 0) {
      await tx.movimientoInventario.create({
        data: {
          productoId: created.id,
          cantidad: stockActual,
          tipo: "inicial",
          usuarioId: usuarioId ?? null,
          motivo: "Stock inicial al crear producto",
        },
      })
    }

    return created
  })

  revalidatePath("/admin/productos")
  return { data: JSON.parse(JSON.stringify(producto)) }
}

export async function updateProduct(id: number, data: unknown) {
  await requireAdmin()
  const parsed = productoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }
  const { nombre, sku, categoriaId, proveedorId, precioCompra, precioVenta, stockMinimo } =
    parsed.data
  const producto = await prisma.producto.update({
    where: { id },
    data: {
      nombre,
      sku: sku ?? null,
      categoriaId,
      proveedorId,
      precioCompra,
      precioVenta,
      stockMinimo,
    },
    include: {
      categoria: true,
      proveedor: true,
      _count: { select: { ventaDetalles: true, ordenDetalles: true } },
    },
  })
  revalidatePath("/admin/productos")
  return { data: JSON.parse(JSON.stringify(producto)) }
}

export async function deleteProduct(id: number) {
  await requireAdmin()

  const [ventaCount, ordenCount] = await Promise.all([
    prisma.ventaDetalle.count({ where: { productoId: id } }),
    prisma.ordenDetalle.count({ where: { productoId: id } }),
  ])

  if (ventaCount > 0 || ordenCount > 0) {
    return { ok: false, error: "No se puede eliminar un producto con ventas u órdenes de compra registradas." }
  }

  await prisma.$transaction([
    prisma.fechaCaducidad.deleteMany({ where: { productoId: id } }),
    prisma.producto.delete({ where: { id } }),
  ])

  revalidatePath("/admin/productos")
  return { ok: true }
}

export async function ajustarStock(data: unknown) {
  await requireAdmin()
  const parsed = ajustarStockSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { error: firstError ?? "Datos inválidos" }
  }

  const { productoId, nuevaCantidad, motivo } = parsed.data
  const session = await auth()
  const usuarioId = session?.user?.id ? Number(session.user.id) : undefined

  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { stockActual: true, nombre: true },
  })

  if (!producto) return { error: "Producto no encontrado" }

  const diferencia = nuevaCantidad - producto.stockActual
  if (diferencia === 0) return { error: "La cantidad es igual al stock actual" }

  await prisma.$transaction(async (tx) => {
    await tx.producto.update({
      where: { id: productoId },
      data: { stockActual: nuevaCantidad },
    })

    await tx.movimientoInventario.create({
      data: {
        productoId,
        cantidad: diferencia,
        tipo: "ajuste",
        usuarioId: usuarioId ?? null,
        motivo,
      },
    })
  })

  revalidatePath("/admin/productos")
  return { ok: true }
}

export async function registrarMerma(data: unknown) {
  await requireAdmin()
  const parsed = registrarMermaSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0]
    return { error: firstError ?? "Datos inválidos" }
  }

  const { productoId, cantidad, motivo } = parsed.data
  const session = await auth()
  const usuarioId = session?.user?.id ? Number(session.user.id) : undefined

  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { stockActual: true, nombre: true },
  })

  if (!producto) return { error: "Producto no encontrado" }
  if (producto.stockActual < cantidad) {
    return { error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stockActual}` }
  }

  await prisma.$transaction(async (tx) => {
    await tx.producto.update({
      where: { id: productoId },
      data: { stockActual: { decrement: cantidad } },
    })

    await tx.movimientoInventario.create({
      data: {
        productoId,
        cantidad: -cantidad,
        tipo: "merma",
        usuarioId: usuarioId ?? null,
        motivo,
      },
    })
  })

  revalidatePath("/admin/productos")
  return { ok: true }
}

export async function getMovimientos(filters?: {
  productoId?: number
  tipo?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}) {
  await requireAdmin()

  const { productoId, tipo, desde, hasta, page = 1, pageSize = 20 } = filters ?? {}

  const where: Record<string, unknown> = {}
  if (productoId) where.productoId = productoId
  if (tipo) where.tipo = tipo
  if (desde || hasta) {
    where.fechaHora = {}
    if (desde) (where.fechaHora as Record<string, unknown>).gte = new Date(desde)
    if (hasta) (where.fechaHora as Record<string, unknown>).lte = new Date(hasta)
  }

  const [total, movimientos] = await Promise.all([
    prisma.movimientoInventario.count({ where }),
    prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, sku: true } },
        usuario: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaHora: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    movimientos: JSON.parse(JSON.stringify(movimientos)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getMovimientosByProducto(productoId: number, page = 1, pageSize = 20) {
  await requireAdmin()

  const where = { productoId }

  const [total, movimientos] = await Promise.all([
    prisma.movimientoInventario.count({ where }),
    prisma.movimientoInventario.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, sku: true } },
        usuario: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaHora: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return {
    movimientos: JSON.parse(JSON.stringify(movimientos)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
