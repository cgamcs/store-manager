import NewProduct from "@/pages/NewProduct"

function Header() {
  return (
    <>
      <header className="bg-oscuro-secundario pb-7.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Productos</h2>
          
          <NewProduct />
        </div>
      </header>
    </>
  )
}

export default Header