import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, Trash2Icon } from "lucide-react"
import { Form } from "react-router-dom"

type DeleteUserProps = {
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

export function DeleteUserModal({user}: DeleteUserProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="flex gap-2 text-red-500 p-3 w-full rounded-sm font-bold text-xs text-center cursor-pointer hover:bg-oscuro-primario/50">
          <Trash2 className="w-4 h-4"/>

          Eliminar
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon className="w-2 h-2" />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
          <AlertDialogDescription>
            Estas a punto de eliminar un usuario permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">No, conservar</AlertDialogCancel>
          <Form
            className="w-full"
            method="POST"
            action={`usuarios/${user.id}/eliminar`}
          >
            <input
              type="submit"
              value="Si, eliminar!"
              className="text-red-600 bg-red-900/30 text-center text-sm px-4 py-2 rounded-md w-full cursor-pointer"
            />
          </Form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
