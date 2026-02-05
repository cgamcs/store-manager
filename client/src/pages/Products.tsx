import { Link } from "react-router-dom"

function Products() {
  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-2xl text-letra-principal font-bold">Productos</h2>
        <Link
          to="productos/nuevo"
          className="bg-azul-claro font-bold p-4 rounded-md hover:bg-azul-claro/80"
        >
          Agregar Producto
        </Link>
      </div>
    </>
  )
}

export default Products