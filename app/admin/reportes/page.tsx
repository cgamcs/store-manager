import { getEstadisticasInventario } from "./actions"
import ReportesClient from "./reportes-client"

// Llama procedimientos almacenados en vivo, no al momento del build.
export const dynamic = "force-dynamic"

export default async function ReportesPage() {
  const estadisticas = await getEstadisticasInventario()
  return <ReportesClient estadisticas={estadisticas} />
}
