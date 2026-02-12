import { Form, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router-dom"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getProductById, updateProduct } from "@/services/ProductService"
// import ProductForm from "@/components/ProductForm"
// import type { Product } from "@/types"
import UserForm from "@/components/users/UserForm"

type EditUserProps = {
  user: {
    id: number
    name: string
    lastname: string
    email: string
    password: string
    rol: string
    status: boolean
  }
}

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
    return redirect("/")
  }

  if (params.id !== undefined) {
    await updateProduct(data, +params.id)

    return redirect("/")
  }
}

function EditUser({user}: EditUserProps) {

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            <Pencil className="w-4 h-4"/>
            
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <Form
            method="POST"
            action={`usuarios/${user.id}/editar`}
          >
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>

            <UserForm user={user} />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose>
                <Button type="submit">Guardar</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditUser