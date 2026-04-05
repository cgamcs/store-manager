import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({ orderBy: { nombreComercial: "asc" } })
    return NextResponse.json(proveedores)
  } catch {
    return NextResponse.json({ error: "Error al obtener proveedores" }, { status: 500 })
  }
}
