import { Link } from "react-router-dom"
import { Plus } from "lucide-react"

function Header() {
  return (
    <>
      <header className="bg-oscuro-secundario pb-7.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Productos</h2>
          <Link
            to="productos/nuevo"
            className="bg-indigo-600 flex gap-3 font-bold p-2 rounded-md hover:bg-indigo-700"
          >
            <Plus />

            Nuevo Producto
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header