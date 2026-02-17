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
import ProductForm from "@/components/products/ProductForm"

function NewProduct() {

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Nueva Orden de Compra</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm md:max-w-5xl">
          <Form method="POST" action={`productos/nuevo`}>
            <DialogHeader>
              <DialogTitle>Orden de Compra</DialogTitle>
            </DialogHeader>

            <ProductForm />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose>
                <Button type="submit">Crear Orden</Button>
              </DialogClose>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewProduct