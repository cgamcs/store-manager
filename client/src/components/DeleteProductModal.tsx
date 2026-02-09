import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types"
import { Trash2, Trash2Icon } from "lucide-react"
import { Form } from "react-router-dom"

type DeleteProductProps = {
  product: Product
}

export function DeleteProductModal({product}: DeleteProductProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex gap-2 text-red-500 p-3 w-full rounded-sm font-bold text-xs text-center cursor-pointer hover:bg-oscuro-primario">
          <Trash2 className="w-4 h-4"/>

          Eliminar
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon className="w-2 h-2" />
          </AlertDialogMedia>
          <AlertDialogTitle>Deseas eliminar este producto?</AlertDialogTitle>
          <AlertDialogDescription>
            Esto eliminara permanente el prodcuto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
          <Form
            className="w-full"
            method="POST"
            action={`productos/${product.id}/eliminar`}
          >
            <input
              type="submit"
              value="Eliminar"
              className="text-red-500 bg-red-700/30 text-center text-sm px-4 py-2 rounded-md w-full cursor-pointer"
            />
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
