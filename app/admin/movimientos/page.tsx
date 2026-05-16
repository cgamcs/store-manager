import { getMovimientos, getProducts } from "../productos/actions"
import MovimientosClient from "./movimientos-client"

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ productoId?: string; tipo?: string; desde?: string; hasta?: string; page?: string }>
}) {
  const params = await searchParams
  const [{ movimientos, total, page, pageSize, totalPages }, productos] = await Promise.all([
    getMovimientos({
      productoId: params.productoId ? Number(params.productoId) : undefined,
      tipo: params.tipo,
      desde: params.desde,
      hasta: params.hasta,
      page: params.page ? Number(params.page) : 1,
    }),
    getProducts(),
  ])

  return (
    <MovimientosClient
      initialMovimientos={movimientos}
      initialProductos={productos}
      pagination={{ total, page, pageSize, totalPages }}
      initialFilters={{
        productoId: params.productoId,
        tipo: params.tipo,
        desde: params.desde,
        hasta: params.hasta,
      }}
    />
  )
}
