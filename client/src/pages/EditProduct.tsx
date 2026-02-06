import { Link, Form, redirect, type ActionFunctionArgs, useNavigation, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { addProduct } from "../services/ProductService"

export async function action({request} : ActionFunctionArgs) {
  const data = Object.fromEntries(await request.formData())

  if(Object.values(data).includes('')) {
    toast.error("Todos los campos son obligatorios")
    return
  }

  await addProduct(data)
  
  return redirect('/')
}

function EditProduct() {
  const navigation = useNavigation()
  const { state } = useLocation()
  
  const isSubmitting = navigation.state === "submitting"

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-2xl text-letra-principal font-bold">Editar Producto</h2>
        <Link
          to="/"
          className="bg-azul-claro font-bold p-4 rounded-md hover:bg-azul-claro/80"
        >
          Volver a Productos
        </Link>
      </div>

      <Form
        className="mt-10"
        method="POST"
      >
        <div className="mb-4">
          <label htmlFor="name">Nombre Producto:</label>
          <input
            type="text"
            className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
            placeholder="Nombre del Producto"
            name="name"
            defaultValue={state.product.name}
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
            defaultValue={state.product.price}
          />
        </div>
        <input
          type="submit"
          value="Editar Producto"
          className={`mt-5 w-full bg-azul-claro hover:bg-azul-claro/80 p-2 font-bold text-lg  rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isSubmitting}
        />
      </Form>
    </>
  )
}

export default EditProduct