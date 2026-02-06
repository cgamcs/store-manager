import { useNavigate } from "react-router-dom"
import type { Product } from "@/types"
import { formatCurrency } from "@/utils"

type ProductDetailsType = {
  product: Product
}

function ProductDetails({product}: ProductDetailsType) {
  const navigate = useNavigate()
  const isAvailable = product.availability

  return (
    <>
      <tr className="bg-azul-oscuro">
        <td className="p-3">{product.name}</td>
        <td className="p-3">{formatCurrency(product.price)}</td>
        <td className="p-3">{isAvailable ? "Disponible" : "No Disponible"}</td>
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

            <button
              className="bg-red-500 p-2 w-full rounded-sm uppercase font-bold text-xs text-center cursor-pointer hover:bg-red-500/80"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}

export default ProductDetails