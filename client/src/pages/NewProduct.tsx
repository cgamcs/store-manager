import { Link, Form, useActionData, redirect, type ActionFunctionArgs, useNavigation } from "react-router-dom"
import ErrorMessage from "../components/ErrorMessage"
import { addProduct } from "../services/ProductService"

export async function action({request} : ActionFunctionArgs) {
  const data = Object.fromEntries(await request.formData())
  
  let error = ''
  if(Object.values(data).includes('')) {
    error = "Todos los campos son obligatorios"
  }
  if(error.length) {
    return error
  }

  await addProduct(data)
  
  return redirect('/')
}

function NewProduct() {
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting"
  const error = useActionData() as string

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-2xl text-letra-principal font-bold">Registrar Producto</h2>
        <Link
          to="/"
          className="bg-azul-claro font-bold p-4 rounded-md hover:bg-azul-claro/80"
        >
          Volver a Productos
        </Link>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

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
          />
        </div>
        <input
          type="submit"
          value="Registrar Producto"
          className={`mt-5 w-full bg-azul-claro hover:bg-azul-claro/80 p-2 font-bold text-lg  rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isSubmitting}
        />
      </Form>
    </>
  )
}

export default NewProduct