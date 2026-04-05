import { getCategories } from "./actions"
import CategoriasClient from "./categorias-client"

export default async function CategoriasPage() {
  const categorias = await getCategories()
  return <CategoriasClient initialCategorias={categorias} />
}
