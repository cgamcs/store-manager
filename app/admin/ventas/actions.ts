"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Prisma } from "@/src/generated/prisma/client"

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

export type RendimientoCajero = {
  cajeroId: number
  nombre: string
  correo: string
  turno: string | null
  totalVentas: number
  totalItemsVendidos: number
  ingresoTotal: number
  ticketPromedio: number
  ventaMinima: number
  ventaMaxima: number
  unidadesTotales: number
  diasConVentas: number
  ventasPorDiaPromedio: number
  ranking: number
}

// Los COUNT/RANK de la vista llegan como bigint y los SUM/AVG como Decimal;
// ninguno de los dos cruza el límite servidor-cliente, así que se normalizan
// a number acá.
type RendimientoCajeroRaw = {
  cajero_id: number
  cajero_nombre: string
  cajero_correo: string
  turno: string | null
  total_ventas: bigint
  total_items_vendidos: Prisma.Decimal
  ingreso_total: Prisma.Decimal
  ticket_promedio: Prisma.Decimal
  venta_minima: Prisma.Decimal
  venta_maxima: Prisma.Decimal
  unidades_totales: Prisma.Decimal
  dias_con_ventas: bigint
  ventas_por_dia_promedio: Prisma.Decimal
  ranking_ingresos: bigint
}

export async function getRendimientoCajeros(): Promise<RendimientoCajero[]> {
  await requireAdmin()
  const filas = await prisma.$queryRaw<RendimientoCajeroRaw[]>`
    SELECT cajero_id, cajero_nombre, cajero_correo, turno, total_ventas,
           total_items_vendidos, ingreso_total, ticket_promedio,
           venta_minima, venta_maxima, unidades_totales, dias_con_ventas,
           ventas_por_dia_promedio, ranking_ingresos
    FROM vista_rendimiento_cajeros
  `

  return filas.map((f) => ({
    cajeroId: f.cajero_id,
    nombre: f.cajero_nombre,
    correo: f.cajero_correo,
    turno: f.turno,
    totalVentas: Number(f.total_ventas),
    totalItemsVendidos: Number(f.total_items_vendidos),
    ingresoTotal: Number(f.ingreso_total),
    ticketPromedio: Number(f.ticket_promedio),
    ventaMinima: Number(f.venta_minima),
    ventaMaxima: Number(f.venta_maxima),
    unidadesTotales: Number(f.unidades_totales),
    diasConVentas: Number(f.dias_con_ventas),
    ventasPorDiaPromedio: Number(f.ventas_por_dia_promedio),
    ranking: Number(f.ranking_ingresos),
  }))
}
