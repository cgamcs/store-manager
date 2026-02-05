import { Link, Form, useActionData } from "react-router-dom"

export async function action({request}) {
  const data = Object.fromEntries(await request.formData())
  
  let error = ''
  if(Object.values(data).includes('')) {
    error = "Todos los campos son obligatorios"
  }
  if(error.length) {
    return error
  }

  console.log(data)
  return data
}

function NewProduct() {
  const error = useActionData()
  console.log(error)

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
            type="text"
            className="mt-2 block w-full bg-[#10131e] focus-visible:outline-0 p-3 rounded-md"
            placeholder="Precio del Producto"
            name="price"
          />
        </div>
        <input
          type="submit"
          className="mt-5 w-full bg-azul-claro hover:bg-azul-claro/80 p-2 font-bold text-lg cursor-pointer rounded-md"
          value="Registrar Producto"
        />
      </Form>
    </>
  )
}

export default NewProduct