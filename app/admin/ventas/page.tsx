import { getVentas, getRendimientoCajeros } from "./actions"
import VentasClient from "./ventas-client"

// Lee vista_rendimiento_cajeros en vivo, no al momento del build.
export const dynamic = "force-dynamic"

export default async function VentasPage() {
  const [ventas, rendimiento] = await Promise.all([
    getVentas(),
    getRendimientoCajeros(),
  ])
  return <VentasClient initialVentas={ventas} rendimiento={rendimiento} />
}
