import type { Product } from "@/types"
import { formatCurrency } from "@/utils"

type ProductDetailsType = {
  product: Product
}

function ProductDetails({product}: ProductDetailsType) {
  const isAvailable = product.availability

  return (
    <>
      <tr className="bg-azul-oscuro">
        <td className="p-3">{product.name}</td>
        <td className="p-3">{formatCurrency(product.price)}</td>
        <td className="p-3">{isAvailable ? "Disponible" : "No Disponible"}</td>
        <td className="p-3"></td>
      </tr>
    </>
  )
}

export default ProductDetails