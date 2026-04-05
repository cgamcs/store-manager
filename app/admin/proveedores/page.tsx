import { getProviders } from "./actions"
import ProveedoresClient from "./proveedores-client"

export default async function ProveedoresPage() {
  const proveedores = await getProviders()
  return <ProveedoresClient initialProveedores={proveedores} />
}
