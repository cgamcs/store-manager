import { getProducts, getCategoriasAndProveedores } from "./actions"
import ProductosClient from "./productos-client"

export default async function ProductosPage() {
  const [productos, { categorias, proveedores }] = await Promise.all([
    getProducts(),
    getCategoriasAndProveedores(),
  ])
  return (
    <ProductosClient
      initialProductos={productos}
      initialCategorias={categorias}
      initialProveedores={proveedores}
    />
  )
}
