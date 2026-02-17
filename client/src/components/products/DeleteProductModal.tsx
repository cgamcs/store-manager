import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { Product } from "@/types"
import { Trash2, Trash2Icon } from "lucide-react"
import { Form } from "react-router-dom"

type DeleteProductProps = {
  // product: Product
  product: {
    id: number,
    name: string,
    sku: string,
    cost: number,
    revenue: number,
    category: string,
    stock: number,
    minstock: number,
    status: string,
    description: string
  }
}

export function DeleteProductModal({product}: DeleteProductProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex gap-2 text-red-500 p-3 w-full rounded-sm font-bold text-xs text-center cursor-pointer hover:bg-oscuro-primario">
          <Trash2 className="w-4 h-4"/>

          Cancelar
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon className="w-2 h-2" />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancelar Orden</AlertDialogTitle>
          <AlertDialogDescription>
            Estas a punto de una orden
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">No, conservar</AlertDialogCancel>
          <Form
            className="w-full"
            method="POST"
            action={`productos/${product.id}/eliminar`}
          >
            <input
              type="submit"
              value="Si, cancelar!"
              className="text-red-600 bg-red-900/30 text-center text-sm px-4 py-2 rounded-md w-full cursor-pointer"
            />
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
