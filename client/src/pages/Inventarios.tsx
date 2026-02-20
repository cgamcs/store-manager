import { ShoppingCart } from "lucide-react"

function Inventarios() {
  return (
    <>
      <header className="bg-oscuro-secundario pb-8.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Inventarios</h2>
        </div>
      </header>

      <div className="rounded-md overflow-hidden mt-10 border border-borde">
        <table className="w-full table-auto">
          <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
            <tr>
              <td className="p-3">Producto</td>
              <td className="p-3">SKU</td>
              <td className="p-3">Categoría</td>
              <td className="p-3">Stock</td>
              <td className="p-3"></td>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Coca-Cola 600ml</td>
              <td className="p-3">sku-1002345890123-coca600</td>
              <td className="p-3 text-gray-400">Refrescos</td>
              <td className="p-3 text-green-400">12</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>

            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Pepsi 600ml</td>
              <td className="p-3">sku-1002345890124-pepsi600</td>
              <td className="p-3 text-gray-400">Refrescos</td>
              <td className="p-3 text-green-400">15</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>

            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Sabritas Original 45g</td>
              <td className="p-3">sku-1002345890125-sabritas45</td>
              <td className="p-3 text-gray-400">Ultraprocesados</td>
              <td className="p-3 text-green-400">20</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>

            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Doritos Nacho 46g</td>
              <td className="p-3">sku-1002345890126-doritos46</td>
              <td className="p-3 text-gray-400">Ultraprocesados</td>
              <td className="p-3 text-yellow-400">8</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>

            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Pan Bimbo Blanco Chico</td>
              <td className="p-3">sku-1002345890127-bimboBlanco</td>
              <td className="p-3 text-gray-400">Panaderia</td>
              <td className="p-3 text-green-400">12</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>

            <tr className="bg-claro-primario/50 border-b border-borde">
              <td className="p-3">Tortillinas Tía Rosa 10 pzas</td>
              <td className="p-3">sku-1002345890128-tortillinas</td>
              <td className="p-3 text-gray-400">Panaderia</td>
              <td className="p-3 text-red-400">0</td>
              <td><ShoppingCart className="bg-blue-600 p-2 w-8 h-8 rounded-md" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Inventarios
