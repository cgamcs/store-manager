import { getVentas } from "./actions"
import VentasClient from "./ventas-client"

export default async function VentasPage() {
  const ventas = await getVentas()
  return <VentasClient initialVentas={ventas} />
}
