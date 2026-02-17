import CategoryDetails from "@/components/categories/CategoryDetails"
import NewCategory from "@/components/categories/NewCategory"
import { description } from "valibot"

function Categories() {
  const categories = [
    {
      id: 1,
      name: "Carnes Frias",
      description: "Productos de carniceria",
      color: "#f64900"
    },
    {
      id: 2,
      name: "Lacteos",
      description: "Derivados de la leche",
      color: "#009689"
    },
    {
      id: 3,
      name: "Ultraprocesados",
      description: "Comida chatarra como papas, galletas, etc.",
      color: "#0f4e64"
    },
    {
      id: 4,
      name: "Limpieza",
      description: "Productos de limpieza para cocina, baño, etc.",
      color: "#EC4899"
    },
  ]

  return (
    <>
      <header className="bg-oscuro-secundario pb-7.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Categorías</h2>
          
          <NewCategory />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-5 mt-10">
        {categories.map(category => (
          <CategoryDetails category={category} />
        ))}
      </div>
    </>
  )
}

export default Categories