import { Package, LayoutDashboard, Tags, ChartColumn, Settings } from "lucide-react"

function SideBar() {
  return (
    <>
      <aside className="group top-0 left-0 z-50 flex h-screen w-21.25 flex-col overflow-hidden bg-oscuro-primario/80 py-6 px-5 transition-[width] duration-500 ease-in-out hover:w-75">
        <div className="flex items-center">
          <div className="bg-indigo-600 min-w-10.5 p-2 rounded-lg flex justify-center">
            <Package className="text-white size-6 rounded-full" />
          </div>
          <h2 className="text-xl font-semibold text-gray-200 whitespace-nowrap mx-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:delay-100">
            Store Manager
          </h2>
        </div>

        <ul className="mt-5 flex h-[80%] flex-col gap-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <h4 className="relative my-2 font-medium text-gray-200 whitespace-nowrap">
            <span className="text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-100">
              Menú
            </span>
            <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 origin-right bg-border/20 transition-transform duration-300 delay-200 group-hover:scale-x-0 group-hover:delay-0"></div>
          </h4>

          {/* Menu Items */}
          {[
            { icon: <LayoutDashboard />, label: "Dashboard" },
            { icon: <Package />, label: "Productos" },
            { icon: <Tags />, label: "Categorías" },
            { icon: <ChartColumn />, label: "Reportes" },
            { icon: <Settings />, label: "Configuración" },
          ].map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className="flex items-center gap-x-5 rounded-lg p-2.5 text-gray-200 transition-colors duration-200 hover:bg-indigo-600/20 hover:text-indigo-500"
              >
                <span className="material-symbols-outlined flex min-w-6 items-center justify-center">
                  {item.icon}
                </span>
                <span className="font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:delay-100">
                  {item.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
        
        {/* <div className="mt-auto -ml-2.5 p-3 rounded transition-colors hover:bg-white group/user">
          <div className="flex items-center gap-x-6 text-[#161a2d] group-hover/user:text-current">
          </div>
        </div> */}
      </aside>
    </>
  )
}

export default SideBar
