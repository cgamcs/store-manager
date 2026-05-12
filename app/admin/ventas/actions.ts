"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

export async function getVentas() {
  await requireAdmin()
  const ventas = await prisma.venta.findMany({
    include: {
      cajero: { select: { id: true, nombre: true, correo: true } },
      detalles: {
        include: { producto: { select: { id: true, nombre: true } } },
      },
    },
    orderBy: { fechaHora: "desc" },
  })
  return JSON.parse(JSON.stringify(ventas))
}
