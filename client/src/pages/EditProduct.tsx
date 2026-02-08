import { Link, Form, redirect, type ActionFunctionArgs, useNavigation, type LoaderFunctionArgs, useLoaderData } from "react-router-dom"
import { toast } from "sonner"
import { getProductById, updateProduct } from "../services/ProductService"
import type { Product } from "@/types"

const availabilityOptions = [
  { name: "Disponible", value: true },
  { name: "No Disponible", value: false },
]

export async function loader({ params }: LoaderFunctionArgs) {
  if (params.id !== undefined) {
    const product = await getProductById(+params.id)

    if (!product) {
      return redirect("/")
    }

    return product
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const data = Object.fromEntries(await request.formData())

  if (Object.values(data).includes("")) {
    toast.error("Todos los campos son obligatorios")
    return
  }

  if (params.id !== undefined) {
    await updateProduct(data, +params.id)

    return redirect("/")
  }
}

function EditProduct() {
  const navigation = useNavigation()
  const product = useLoaderData() as Product

  const isSubmitting = navigation.state === "submitting"

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-2xl text-letra-principal font-bold">
          Editar Producto
        </h2>
        <Link
          to="/"
          className="bg-azul-claro font-bold p-4 rounded-md hover:bg-azul-claro/80"
        >
          Volver a Productos
        </Link>
      </div>

      <Form className="mt-10" method="POST">
        <div className="mb-4">
          <label htmlFor="name">Nombre Producto:</label>
          <input
            type="text"
            className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
            placeholder="Nombre del Producto"
            name="name"
            defaultValue={product.name}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price">Precio:</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
            placeholder="Precio del Producto"
            name="price"
            defaultValue={product.price}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="availability">
            Disponibilidad:
          </label>
          <div className="mt-2 block w-full p-3 bg-[#10131e] rounded-md">
            <select
              id="availability"
              name="availability"
              className="w-full focus-visible:outline-0"
              defaultValue={product?.availability.toString()}
            >
              {availabilityOptions.map((option) => (
                <option key={option.name} value={option.value.toString()}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input
          type="submit"
          value="Editar Producto"
          className={`mt-5 w-full bg-azul-claro hover:bg-azul-claro/80 p-2 font-bold text-lg  rounded-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={isSubmitting}
        />
      </Form>
    </>
  )
}

export default EditProduct