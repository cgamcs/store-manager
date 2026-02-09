import { type ActionFunctionArgs, redirect, Form } from "react-router-dom"
import type { Product } from "@/types"
import { Ellipsis } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatCurrency } from "@/utils"
import { deleteProduct } from "@/services/ProductService"
import EditProduct from "@/pages/EditProduct"
import { DeleteProductModal } from '@/components/DeleteProductModal'

type ProductDetailsType = {
  product: Product
}

export async function action({params} : ActionFunctionArgs) {
  console.log(params.id)
  if(params.id !== undefined) {
    await deleteProduct(+params.id)

    return redirect('/')
  }
}

function ProductDetails({product}: ProductDetailsType) {

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
          <Popover>
            <PopoverTrigger asChild>
              <Ellipsis />
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="flex flex-col">
                <EditProduct product={product} />

                {/* <Form
                  className="w-full"
                  method="POST"
                  action={`productos/${product.id}/eliminar`}
                >
                  <div className="flex gap-2 text-red-500 p-3 w-full rounded-sm font-bold text-xs text-center cursor-pointer hover:bg-oscuro-primario">
                    <Trash2 className="w-4 h-4"/>

                    <input
                      type="submit"
                      value="Eliminar"
                    />
                  </div>
                </Form> */}
                <DeleteProductModal product={product} />
              </div>
            </PopoverContent>
          </Popover>
        </td>
      </tr>
    </>
  )
}

export default ProductDetails