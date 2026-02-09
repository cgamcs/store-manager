import { Form, useNavigate, type ActionFunctionArgs, redirect } from "react-router-dom"
import type { Product } from "@/types"
import { formatCurrency } from "@/utils"
import { deleteProduct } from "@/services/ProductService"

type ProductDetailsType = {
  product: Product
}

export async function action({params} : ActionFunctionArgs) {
  if(params.id !== undefined) {
    await deleteProduct(+params.id)

    return redirect('/')
  }
}

function ProductDetails({product}: ProductDetailsType) {
  const navigate = useNavigate()

  return (
    <>
      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">{product.name}</td>
        <td className="p-3">{formatCurrency(product.price)}</td>
        <td className="p-3 text-gray-400">{product.category}</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3">
          <span className={`text-xs rounded-full border px-3 py-1 ${product.status === "Activo" ? 'border-green-500 bg-green-600/10 text-green-500' : product.status === "Archivado" ? 'border-red-500 bg-red-600/10 text-red-500' : 'border-gray-500 bg-gray-600/10 text-gray-500'}`}>{product.status}</span>
        </td>
        <td className="p-3">
          <div className="flex gap-2 item-center">
            <button
              onClick={() => navigate(`/productos/${product.id}/editar`, {
                state: {
                  product
                }
              })}
              className="bg-azul-medio p-2 w-full rounded-sm uppercase font-bold text-xs text-center cursor-pointer hover:bg-azul-medio/80"
            >Editar</button>

            <Form
              className="w-full"
              method="POST"
              action={`productos/${product.id}/eliminar`}
            >
              <input
                type="submit"
                value="Eliminar"
                className="bg-red-500 p-2 w-full rounded-sm uppercase font-bold text-xs text-center cursor-pointer hover:bg-red-500/80"  
              />
            </Form>
          </div>
        </td>
      </tr>
    </>
  )
}

export default ProductDetails