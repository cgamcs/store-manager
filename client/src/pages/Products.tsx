import { redirect, useLoaderData, type ActionFunctionArgs } from "react-router-dom"
import { addProduct, getProducts } from "@/services/ProductService"
import type { Product } from "@/types"
import ProductDetails from "@/components/ProductDetails"
import Header from "@/components/Header"
import SummaryInventary from "@/components/SummaryInventary"
import { toast } from "sonner"
import { DialogClose } from "@/components/ui/dialog"

export async function loader() {
  return await getProducts()
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request)
  const data = Object.fromEntries(await request.formData())

  if (Object.values(data).includes("")) {
    toast.error("Todos los campos son obligatorios")
    return
  }

  await addProduct(data)

  return redirect('/')
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