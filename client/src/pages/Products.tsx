import { Link, useLoaderData, type ActionFunctionArgs } from "react-router-dom"
import { getProducts, updateAvailability } from "@/services/ProductService"
import type { Product } from "@/types"
import ProductDetails from "@/components/ProductDetails"

export async function loader() {

  return await getProducts()
}

export async function action({request}: ActionFunctionArgs) {
  const data = Object.fromEntries(await request.formData())
  await updateAvailability(+data.id)

  return null
}

function Products() {
  const products = useLoaderData() as Product[]

  return (
    <>
    
      <div className="flex justify-between">
        <h2 className="text-2xl text-letra-principal font-bold">Productos</h2>
        <Link
          to="productos/nuevo"
          className="bg-azul-claro font-bold p-4 rounded-md hover:bg-azul-claro/80"
        >
          Agregar Producto
        </Link>
      </div>

      <div className="rounded-md overflow-hidden mt-10">
        <table className="w-full table-auto">
          <thead className="bg-azul-claro font-bold">
            <tr>
              <td className="p-2">Producto</td>
              <td className="p-2">Precio</td>
              <td className="p-2">Disponibilidad</td>
              <td className="p-2">Acciones</td>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <ProductDetails
                key={product.id}
                product={product}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Products