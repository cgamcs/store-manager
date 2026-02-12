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
import CategoryForm from "./categories/CategoryForm"

function NewCategory() {

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Nueva Categoría</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm md:max-w-lg">
          <Form method="POST" action={`categorias/nuevo`}>
            <DialogHeader>
              <DialogTitle>Registrar Categoría</DialogTitle>
            </DialogHeader>

            <CategoryForm />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose>
                <Button type="submit">Guardar Categoría</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewCategory