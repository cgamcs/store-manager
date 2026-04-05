import { getCajeros } from "./actions"
import UsuariosClient from "./usuarios-client"

export default async function UsuariosPage() {
  const cajeros = await getCajeros()
  return <UsuariosClient initialCajeros={cajeros} />
}
