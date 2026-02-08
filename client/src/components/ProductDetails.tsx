import { Form, useNavigate, type ActionFunctionArgs, redirect, useFetcher } from "react-router-dom"
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
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const isAvailable = product.availability

  return (
    <>
      <tr className="bg-azul-oscuro">
        <td className="p-3">{product.name}</td>
        <td className="p-3">{formatCurrency(product.price)}</td>
        <td className="p-3">
          <fetcher.Form action="" method="post">
            <button
              type="submit"
              name="id"
              value={product.id}
              className={`${isAvailable ? '' : 'text-red-500'} rounded-sm p-2 text-xs uppercase font-bold w-full border border-azul-medio cursor-pointer`}
            >
              {isAvailable ? "Disponible" : "No Disponible"}
            </button>
          </fetcher.Form>
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