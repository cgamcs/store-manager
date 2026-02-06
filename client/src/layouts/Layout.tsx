import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

function Layout() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid #32435e',
          },
        }}
      />
      <header className="bg-azul-claro">
        <div className="mx-auto max-w-6xl py-10">
          <h1 className="text-4xl font-extrabold">Administrador de Productos</h1>
        </div>
      </header>

      <main className="mt-10 mx-auto max-w-6xl p-10 bg-azul-medio rounded-lg shadow-sm">
        <Outlet />
      </main>
    </>
  )
}

export default Layout