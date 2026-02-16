import Counter from "@/components/Counter";
import { Banknote, Search, ShoppingCart, Trash2 } from "lucide-react";

// POSView.tsx
export default function POSView() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Punto de Venta</h2>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 flex flex-col gap-5">
          <div className="bg-claro-primario p-5 rounded-lg border border-borde">
            <div className="flex items-center gap-2 bg-oscuro-primario rounded-md px-6 py-3">
              <Search className="h-4 w-4 text-gray-400" />

              <input
                type="text"
                name="seach"
                id="search"
                placeholder="Escribe el nombre o el SKU del producto..."
                className="w-full focus-visible:outline-0"
              />
            </div>
          </div>

          <div className="bg-oscuro-primario rounded-lg border overflow-hidden border-borde">
            <table className="w-full table-auto">
              <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
                <tr>
                  <td className="p-3">Producto</td>
                  <td className="p-3">Cantidad</td>
                  <td className="p-3">Precio</td>
                  <td className="p-3">Total</td>
                  <td className="p-3"></td>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-claro-primario/50 border-b border-borde">
                  <td className="p-3">Hilo de Algodón Blanco</td>
                  <td className="p-3"><Counter /></td>
                  <td className="p-3">$35</td>
                  <td className="p-3">$70</td>
                  <td className="p-3"><Trash2 className="text-red-500 cursor-pointer" /></td>
                </tr>

                <tr className="bg-claro-primario/50 border-b border-borde">
                  <td className="p-3">Hilo de Poliéster Negro</td>
                  <td className="p-3"><Counter /></td>
                  <td className="p-3">$30</td>
                  <td className="p-3">$30</td>
                  <td className="p-3"><Trash2 className="text-red-500 cursor-pointer" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-claro-primario p-5 rounded-lg border border-borde">
          <div className="">
            <div className="flex items-center gap-5">
              <ShoppingCart />

              <h3 className="text-2xl">Resumen de Venta</h3>
            </div>
            <span className="text-gray-400">2 artículos en el carrito</span>
          </div>

          <div className="flex flex-col mt-5 pb-2.5 border-b border-borde">
            <div className="flex justify-between items-center">
              <p className="text-gray-400">Subtotal</p>
              <span className="text-md">$100.00</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-400">IVA (16%)</p>
              <span className="text-md">$16.00</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center font-bold text-xl mt-2.5">
            <span>Total</span>
            <span>$116.00</span>
          </div>

          <h4 className="mt-5 mb-2 text-md">Método de Pago</h4>

          <div className="grid grid-cols-2 gap-5">
            <button className="bg-oscuro-primario/50 p-5 rounded-md border border-borde col-span-2 flex flex-col gap-2 justify-center items-center">
              <Banknote />

              Efectivo
            </button>
          </div>

          <p className="mt-5  text-gray-400">Vendedor: <span className="text-white">María García</span></p>

          <button className="mt-5 bg-oscuro-secundario w-full p-5 rounded-md border border-borde col-span-2 flex gap-2 justify-center items-center cursor-pointer">
              <ShoppingCart />

              Completar Venta
            </button>
        </div>
      </div>
    </>
  );
}