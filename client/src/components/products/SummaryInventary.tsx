import { DollarSign, Package, TrendingUp, TriangleAlert } from "lucide-react"
import { formatQuantity } from "@/utils"
import type { Product } from '@/types'

type ProductsProps = {
  // products: Product[]
  products: {
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
  }[]
}

function SummaryInventary({products}: ProductsProps) {
  let lowStock = 0
  let activesProducts = 0
  let totalInventary = 0
  
  products.map(product => {
    if(product.stock <= 10) {
      lowStock += 1
    }

    if(product.status === "Activo") {
      activesProducts += 1
    }

    totalInventary += product.cost * product.stock
  })

  return (
    <>
      <div className="grid grid-cols-4 gap-5 mt-10">
        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <Package className="text-gray-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Total de Productos</h3>
              <span className="text-4xl font-bold">{products.length}</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <TrendingUp className="text-green-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Activos</h3>
              <span className="text-4xl font-bold">{activesProducts}</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <TriangleAlert className="text-yellow-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Stock Bajo</h3>
              <span className="text-4xl font-bold">{lowStock}</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <DollarSign className="text-gray-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Valor Inventario</h3>
              <span className="text-4xl font-bold">{formatQuantity(totalInventary)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SummaryInventary