import { getOrdenes, getProveedoresYProductos } from "./actions"
import OrdenesClient from "./ordenes-client"

export default async function OrdenesPage() {
  const [ordenes, { proveedores, productos }] = await Promise.all([
    getOrdenes(),
    getProveedoresYProductos(),
  ])
  return (
    <OrdenesClient
      initialOrdenes={ordenes}
      initialProveedores={proveedores}
      initialProductos={productos}
    />
  )
}
