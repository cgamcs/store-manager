import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getProductosPOS, getCategoriasPOS } from "./actions"
import { POSClient } from "./pos-client"

export default async function POSPage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const [productos, categorias] = await Promise.all([
    getProductosPOS(),
    getCategoriasPOS(),
  ])

  return (
    <POSClient
      productos={productos}
      categorias={categorias}
      cajeroNombre={session.user.name ?? "Cajero"}
    />
  )
}
