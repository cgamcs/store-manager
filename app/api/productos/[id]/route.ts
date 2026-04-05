import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productoSchema } from "@/lib/validations/producto"
import { z } from "zod"

const ROL_ADMIN = 1
const idSchema = z.coerce.number().int().positive("ID de producto inválido")

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    return null
  }
  return session
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id: rawId } = await params
  const idParsed = idSchema.safeParse(rawId)
  if (!idParsed.success) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 })
  }

  const parsed = productoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { nombre, sku, categoriaId, proveedorId, precioCompra, precioVenta, stockActual, stockMinimo } =
    parsed.data

  try {
    const producto = await prisma.producto.update({
      where: { id: idParsed.data },
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
      },
    })
    return NextResponse.json(producto)
  } catch {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id: rawId } = await params
  const idParsed = idSchema.safeParse(rawId)
  if (!idParsed.success) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    await prisma.producto.delete({ where: { id: idParsed.data } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
  }
}
