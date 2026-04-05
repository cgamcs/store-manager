import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { productoSchema } from "@/lib/validations/producto"

const ROL_ADMIN = 1

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        proveedor: true,
      },
      orderBy: { id: "asc" },
    })
    return NextResponse.json(productos)
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
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
      },
    })
    return NextResponse.json(producto, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
