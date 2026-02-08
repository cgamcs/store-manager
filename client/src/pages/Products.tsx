import { useLoaderData, type ActionFunctionArgs } from "react-router-dom"
import { getProducts, updateAvailability } from "@/services/ProductService"
import type { Product } from "@/types"
import ProductDetails from "@/components/ProductDetails"
import Header from "@/components/Header"

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
      <Header />

      <div className="rounded-md overflow-hidden mt-10 border border-borde">
        <table className="w-full table-auto">
          <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
            <tr>
              <td className="p-3">Producto</td>
              <td className="p-3">Precio</td>
              <td className="p-3">Disponibilidad</td>
              <td className="p-3">Acciones</td>
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