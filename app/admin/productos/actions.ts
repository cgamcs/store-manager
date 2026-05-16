"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productoSchema } from "@/lib/validations/producto"
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
  const producto = await prisma.producto.create({
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
  revalidatePath("/admin/productos")
  return { data: JSON.parse(JSON.stringify(producto)) }
}

export async function updateProduct(id: number, data: unknown) {
  await requireAdmin()
  const parsed = productoSchema.safeParse(data)
  if (!parsed.success) {
    return { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors }
  }
  const { nombre, sku, categoriaId, proveedorId, precioCompra, precioVenta, stockActual, stockMinimo } =
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
      stockActual,
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
