import { Form } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import UserForm from "./UserForm"

function NewUser() {

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Nuevo Usuario</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm md:max-w-lg">
          <Form method="POST" action={`usuarios/nuevo`}>
            <DialogHeader>
              <DialogTitle>Registrar Usuario</DialogTitle>
            </DialogHeader>

            <UserForm />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose>
                <Button type="submit">Guardar Producto</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewUser