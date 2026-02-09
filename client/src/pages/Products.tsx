import { useLoaderData } from "react-router-dom"
import { getProducts } from "@/services/ProductService"
import type { Product } from "@/types"
import ProductDetails from "@/components/ProductDetails"
import Header from "@/components/Header"
import SummaryInventary from "@/components/SummaryInventary"

export async function loader() {
  return await getProducts()
}

function Products() {
  const products = useLoaderData() as Product[]

  return (
    <>
      <Header />

      <SummaryInventary 
        products={products}
      />

      <div className="rounded-md overflow-hidden mt-10 border border-borde">
        <table className="w-full table-auto">
          <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
            <tr>
              <td className="p-3">Producto</td>
              <td className="p-3">Precio</td>
              <td className="p-3">Categoría</td>
              <td className="p-3">Stock</td>
              <td className="p-3">Estado</td>
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