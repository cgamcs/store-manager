"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { dbErrorMessage } from "@/lib/db-error"

const ROL_ADMIN = 1

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as { rolId?: number }).rolId !== ROL_ADMIN) {
    throw new Error("No autorizado")
  }
}

export type EstadisticasInventario = {
  totalProductos: number
  valorInventario: number
  productosStockBajo: number
  productosSinStock: number
  valorMerma: number
}

type EstadisticasRaw = {
  p_total_productos: number | bigint
  p_valor_inventario: unknown
  p_productos_stock_bajo: number | bigint
  p_productos_sin_stock: number | bigint
  p_valor_merma: unknown
}

export async function getEstadisticasInventario(): Promise<EstadisticasInventario> {
  await requireAdmin()
  const [r] = await prisma.$queryRaw<EstadisticasRaw[]>`
    CALL sp_calcular_estadisticas_inventario(NULL, NULL, NULL, NULL, NULL)
  `
  return {
    totalProductos: Number(r.p_total_productos),
    valorInventario: Number(r.p_valor_inventario),
    productosStockBajo: Number(r.p_productos_stock_bajo),
    productosSinStock: Number(r.p_productos_sin_stock),
    valorMerma: Number(r.p_valor_merma),
  }
}

export type NivelCaducidad = "caducado" | "urgente" | "proximo" | "vigilancia"

export type ReporteCaducidades = {
  totalAlertas: number
  yaCaducados: number
  unidades: number
  detalle: {
    loteId: number
    producto: string
    proveedor: string
    fecha: string
    cantidad: number
    stock: number
    nivel: NivelCaducidad
    sugerirDescuento: boolean
  }[]
}

type CaducidadesRaw = {
  p_total_alertas: number | bigint
  p_ya_caducados: number | bigint
  p_unidades: number | bigint
  p_detalle: ReporteCaducidades["detalle"] | null
}

export async function reporteCaducidades(
  dias: number
): Promise<{ data: ReporteCaducidades } | { error: string }> {
  await requireAdmin()
  // Sin validar rango: la excepción de sp_reporte_caducidades_proximas es la validación.
  const d = Math.trunc(Number(dias)) || 0
  try {
    const [r] = await prisma.$queryRaw<CaducidadesRaw[]>`
      CALL sp_reporte_caducidades_proximas(${d}::int, NULL, NULL, NULL, NULL)
    `
    return {
      data: {
        totalAlertas: Number(r.p_total_alertas),
        yaCaducados: Number(r.p_ya_caducados),
        unidades: Number(r.p_unidades),
        detalle: r.p_detalle ?? [],
      },
    }
  } catch (e) {
    return { error: dbErrorMessage(e, "No se pudo generar el reporte") }
  }
}
