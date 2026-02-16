import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"


function SaleSummary() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Eye />
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm space-y-4">
            <div className="flex flex-col">
              <h2 className="text-xl">Detalles de la Venta</h2>
              <p className="text-gray-400">sale-1770870357545-tov2g - 2026-02-12</p>
            </div>

            <p className="text-gray-400">Vendedor: <span className="text-white">María García</span></p>

            <div>
              <div className="flex flex-col gap-1 pb-2.5">
                <div className="flex justify-between items-center">
                  <p>Hilo de Algodón Blanco <span className="text-gray-400">x 2</span></p>

                  <span>$70.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <p>Hilo de Poliéster Negro <span className="text-gray-400">x 1</span></p>

                  <span>$30.00</span>
                </div>
              </div>

              <div className="flex flex-col mb-5 pt-2.5 border-t border-borde">
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
            </div>

            <span className="px-3 py-1 bg-claro-primario rounded-full w-fit">Efectivo</span>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SaleSummary