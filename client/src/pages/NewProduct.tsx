import { Link, Form, redirect, type ActionFunctionArgs, useNavigation } from "react-router-dom"
import { toast } from "sonner"
import { addProduct } from "../services/ProductService"
import ProductForm from "@/components/ProductForm"

export async function action({request} : ActionFunctionArgs) {
  const data = Object.fromEntries(await request.formData())

  if(Object.values(data).includes('')) {
    toast.error("Todos los campos son obligatorios")
    return
  }

  await addProduct(data)
  
  return redirect('/')
}

function NewProduct() {
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting"

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

      <Form
        className="mt-10"
        method="POST"
      >
        <ProductForm />

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