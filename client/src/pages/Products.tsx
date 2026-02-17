import { redirect, useLoaderData, type ActionFunctionArgs } from "react-router-dom"
import { addProduct, getProducts } from "@/services/ProductService"
import type { Product } from "@/types"
import ProductDetails from "@/components/products/ProductDetails"
import SummaryInventary from "@/components/products/SummaryInventary"
import { toast } from "sonner"
import NewProduct from "@/components/products/NewProduct"

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
  const productss = useLoaderData() as Product[]

  const products = [
    {
      id: 1,
      name: "Jamon FUD",
      sku: "12sku12",
      cost: 12,
      revenue: 18,
      category: "Carnes Frias",
      stock: 12,
      minstock: 2,
      status: "Activo",
      description: "Laptop Gamer"
    }
  ]

  return (
    <>
      <header className="bg-oscuro-secundario pb-7.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Productos</h2>
          
          <NewProduct />
        </div>
      </header>

      <SummaryInventary 
        products={products}
      />

      <div className="rounded-md overflow-hidden mt-10 border border-borde">
        <table className="w-full table-auto">
          <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
            <tr>
              <td className="p-3">Producto</td>
              <td className="p-3">SKU</td>
              <td className="p-3">Precio</td>
              <td className="p-3">Categoría</td>
              <td className="p-3">Stock</td>
              <td className="p-3 max-w-3">Estado</td>
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