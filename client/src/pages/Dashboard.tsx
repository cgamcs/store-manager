import { ShoppingCart, DollarSign, TrendingUp, TriangleAlert } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Pie, PieChart, LabelList, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"


function Dashboard() {
  const chartData = [
    { month: "Ene", sales: 186 },
    { month: "Feb", sales: 305 },
    { month: "Mar", sales: 237 },
    { month: "Abr", sales: 73 },
    { month: "May", sales: 209 },
    { month: "Jun", sales: 214 },
  ]

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "#2563eb",
    },
    label: {
      color: "#fff"
    }
  } satisfies ChartConfig

  const chartData2 = [
    { browser: "Carnes Frias", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "Lacteos", visitors: 200, fill: "var(--color-safari)" },
    { browser: "Ultraprocesados", visitors: 187, fill: "var(--color-firefox)" },
    { browser: "Limpieza", visitors: 173, fill: "var(--color-edge)" },
    { browser: "Refrescos", visitors: 90, fill: "var(--color-other)" },
  ]
  const chartConfig2 = {
    visitors: {
      label: "Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "var(--chart-1)",
    },
    safari: {
      label: "Safari",
      color: "var(--chart-2)",
    },
    firefox: {
      label: "Firefox",
      color: "var(--chart-3)",
    },
    edge: {
      label: "Edge",
      color: "var(--chart-4)",
    },
    other: {
      label: "Other",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig

  return (
    <>
      <div className="grid grid-cols-4 gap-5 mt-10">
        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <DollarSign className="text-green-400 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-200 text-sm">Ingresos del Mes</h3>
              <span className="text-4xl font-bold">$6,127.12</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <ShoppingCart className="text-gray-400 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Ventas Realizadas</h3>
              <span className="text-4xl font-bold">28</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <TrendingUp className="text-green-400 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Venta Promedio</h3>
              <span className="text-4xl font-bold">$217.20</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <TriangleAlert className="text-yellow-400 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Stock Bajo</h3>
              <span className="text-4xl font-bold">3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-10">
        <div className="col-span-2 bg-claro-primario p-5 rounded-lg border border-borde">
            <div className="mb-5">
              <h3 className="text-xl">Ventas Mensuales</h3>
              <span className="text-gray-400">Enero - Junio 2026</span>
            </div>
            <div>
              <ChartContainer config={chartConfig}>
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    top: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={8}>
                    <LabelList
                      position="top"
                      offset={12}
                      className="text-white"
                      fontSize={12}
                      fill="var(--color-label)"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
        </div>

        <div className="col-span-1 bg-claro-primario p-5 rounded-lg border border-borde">
          <div className="mb-5">
            <h3 className="text-xl">Por Categoría</h3>
            <span className="text-gray-400">Distirbución de ventas</span>
          </div>
          <div>
            <ChartContainer
              config={chartConfig2}
              className="mx-auto aspect-square max-h-80"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData2}
                  dataKey="visitors"
                  nameKey="browser"
                  innerRadius={60}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="mt-5">
              <ul>
                <li className="flex gap-2 items-center"><span className="block w-4 h-4 rounded-full bg-[#f64900]"></span>Carnes Frias</li>
                <li className="flex gap-2 items-center"><span className="block w-4 h-4 rounded-full bg-[#009689]"></span>Lacteos</li>
                <li className="flex gap-2 items-center"><span className="block w-4 h-4 rounded-full bg-[#0f4e64]"></span>Ultraprocesados</li>
                <li className="flex gap-2 items-center"><span className="block w-4 h-4 rounded-full bg-[#ffba00]"></span>Limpieza</li>
                <li className="flex gap-2 items-center"><span className="block w-4 h-4 rounded-full bg-[#fe9900]"></span>Refrescos</li>
              </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-10">
        <div className="bg-claro-primario p-5 rounded-lg border border-borde">
          <div className="mb-5">
            <h3 className="text-xl">Ventas Recientes</h3>
            <span className="text-gray-400">Ultimas Transacciones Registradas</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                  <p className="">Mariana Garcia</p>
                  <span className="text-gray-400 text-xs">1 artículo - Tarjeta</span>
              </div>
              <span className="font-bold text-lg">
                $87.00
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                  <p className="">Mariana Garcia</p>
                  <span className="text-gray-400 text-xs">1 artículo - Tarjeta</span>
              </div>
              <span className="font-bold text-lg">
                $87.00
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                  <p className="">Mariana Garcia</p>
                  <span className="text-gray-400 text-xs">1 artículo - Tarjeta</span>
              </div>
              <span className="font-bold text-lg">
                $87.00
              </span>
            </div>
          </div>
        </div>

        <div className="bg-claro-primario p-5 rounded-lg border border-borde">
          <div className="mb-5">
            <h3 className="text-xl">Alertas de Stock</h3>
            <span className="text-gray-400">Productos por debajo del minimo</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <p className="">Jamon FUD 500gr</p>
                <span className="text-gray-400 text-xs">EST-001</span>
              </div>
              <span className="bg-red-600 rounded-full px-4 py-1">
                9
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                  <p className="">Coca-Cola 600ml</p>
                  <span className="text-gray-400 text-xs">AGU-003</span>
              </div>
              <span className="bg-red-600 rounded-full px-4 py-1">
                8
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                  <p className="">Lala Entera 1lt</p>
                  <span className="text-gray-400 text-xs">BOT-002</span>
              </div>
              <span className="bg-red-600 rounded-full px-4 py-1">
                3
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard