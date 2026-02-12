import SaleSummary from "@/components/SaleSummary";
import { BookMarked, Percent, TrendingUp } from "lucide-react";

// HistoryView.tsx
export default function HistoryView() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Historial de Ventas</h2>

      <div className="grid grid-cols-3 gap-5">
        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <BookMarked className="text-blue-500 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Total de Ventas</h3>
              <span className="text-4xl font-bold">31</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <TrendingUp className="text-green-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Ingresos Totales</h3>
              <span className="text-4xl font-bold">$1364.50</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <Percent className="text-yellow-400 w-10 h-10"/>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Promedio por Venta</h3>
              <span className="text-4xl font-bold">$205.39</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-oscuro-primario rounded-lg border overflow-hidden border-borde">
            <table className="w-full table-auto">
              <thead className="bg-claro-primario text-gray-300 font-bold border-b border-borde">
                <tr>
                  <td className="p-3">Id</td>
                  <td className="p-3">Fecha</td>
                  <td className="p-3">Vendedor</td>
                  <td className="p-3">Articulos</td>
                  <td className="p-3">Metodo</td>
                  <td className="p-3">Total</td>
                  <td className="p-3"></td>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-claro-primario/50 border-b border-borde">
                  <td className="p-3">sale-1770870357545-tov2g</td>
                  <td className="p-3">2026-01-23</td>
                  <td className="p-3">María García</td>
                  <td className="p-3">2</td>
                  <td className="p-3"><span className="py-1 px-3 bg-claro-primario rounded-full">Efectivo</span></td>
                  <td className="p-3">$350.00</td>
                  <td className="p-3">
                    <SaleSummary />
                  </td>
                </tr>

                <tr className="bg-claro-primario/50 border-b border-borde">
                  <td className="p-3">sale-1770870341886-22alc</td>
                  <td className="p-3">2026-02-12</td>
                  <td className="p-3">Carlos López</td>
                  <td className="p-3">5</td>
                  <td className="p-3"><span className="py-1 px-3 bg-claro-primario rounded-full">Efectivo</span></td>
                  <td className="p-3">$350.00</td>
                  <td className="p-3">
                    <SaleSummary />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
    </>
  );
}