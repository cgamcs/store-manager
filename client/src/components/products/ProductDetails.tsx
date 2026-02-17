import { type ActionFunctionArgs, redirect } from "react-router-dom"
import type { Product } from "@/types"
import { CircleCheck, CircleX, Ellipsis, Loader } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatCurrency } from "@/utils"
import { deleteProduct } from "@/services/ProductService"
import EditProduct from "@/components/products/EditProduct"
import { DeleteProductModal } from '@/components/products/DeleteProductModal'

type ProductDetailsType = {
  // product: Product
  product: {
    id: number,
    name: string,
    sku: string,
    cost: number,
    revenue: number,
    category: string,
    stock: number,
    minstock: number,
    status: string,
    description: string
  }
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
        <td className="p-3">Coca-Cola 600ml</td>
        <td className="p-3">sku-1002345890123-coca600</td>
        <td className="p-3">$25.50</td>
        <td className="p-3 text-gray-400">Refrescos</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3">
          <Popover>
            <PopoverTrigger asChild>
              <span className="text-xs rounded-full bg-green-600/60 border border-green-400 text-green-400 px-3 py-1 select-none">Aceptado</span>
            </PopoverTrigger>
            <PopoverContent align="center">
              <div className="flex flex-col gap-4 text-white">
                <span className="flex items-center justify-left text-green-400 gap-2 text-xs text-center select-none">
                  <CircleCheck className="w-5 h-5 text-green-500" />
                  Aceptado
                </span>

                <span className="flex items-center justify-left text-orange-400 gap-2 text-xs text-center select-none">
                  <Loader className="w-5 h-5 text-orange-500" />
                  En proceso
                </span>

                <span className="flex items-center justify-left text-red-400 gap-2 text-xs text-center select-none">
                  <CircleX className="w-5 h-5 text-red-500" />
                  Cancelado
                </span>
                {/* <DeleteProductModal product={product} /> */}
              </div>
            </PopoverContent>
          </Popover>
        </td>
      </tr>

      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">Pepsi 600ml</td>
        <td className="p-3">sku-1002345890124-pepsi600</td>
        <td className="p-3">$20.50</td>
        <td className="p-3 text-gray-400">Refrescos</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3 max-w-fit">
          <span className="text-xs rounded-full bg-green-600/60 border border-green-400 text-green-400 px-3 py-1">Aceptado</span>
        </td>
      </tr>

      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">Sabritas Original 45g</td>
        <td className="p-3">sku-1002345890125-sabritas45</td>
        <td className="p-3">$45.50</td>
        <td className="p-3 text-gray-400">Ultraprocesados</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3 max-w-fit">
          <span className="text-xs rounded-full bg-red-600/50 border border-red-400 text-red-400 px-3 py-1">Cancelado</span>
        </td>
      </tr>

      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">Doritos Nacho 46g</td>
        <td className="p-3">sku-1002345890126-doritos46</td>
        <td className="p-3">$55.90</td>
        <td className="p-3 text-gray-400">Ultraprocesados</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3 max-w-fit">
          <span className="text-xs rounded-full bg-green-600/60 border border-green-400 text-green-400 px-3 py-1">Aceptado</span>
        </td>
      </tr>

      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">Pan Bimbo Blanco Chico</td>
        <td className="p-3">sku-1002345890127-bimboBlanco</td>
        <td className="p-3">$35.50</td>
        <td className="p-3 text-gray-400">Panaderia</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3 max-w-fit">
          <span className="text-xs rounded-full bg-green-600/60 border border-green-400 text-green-400 px-3 py-1">Aceptado</span>
        </td>
      </tr>

      <tr className="bg-claro-primario/50 border-b border-borde">
        <td className="p-3">Tortillinas Tía Rosa 10 pzas</td>
        <td className="p-3">sku-1002345890128-tortillinas</td>
        <td className="p-3">$25.50</td>
        <td className="p-3 text-gray-400">Panaderia</td>
        <td className={`${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : ''} p-3`}>{product.stock}</td>
        <td className="p-3 max-w-fit">
          <span className="text-xs rounded-full bg-orange-600/60 border border-orange-400 text-orange-400 px-3 py-1">En proceso</span>
        </td>
      </tr>
    </>
  )
}

export default ProductDetails