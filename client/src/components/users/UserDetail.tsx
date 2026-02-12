import { Ellipsis } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import EditUser from "./EditUser"
import { DeleteUserModal } from "./DeleteCategoryModal"

type UserDetailProps = {
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

function UserDetail({user} : UserDetailProps) {
  return (
    <>
      <div className="border border-borde p-4 rounded-lg bg-claro-primario">
        <div className="flex justify-between align-items w-full pb-2.5 border-b border-borde">
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-oscuro-primario rounded-full text-center">
              {user.id}
            </div>

            <div className="flex flex-col">
              <h3>{user.name + user.lastname}</h3>
              <span className="text-gray-400">{user.email}</span>
            </div>
          </div>

          <span className={`${user.rol === "Administrador" ? "bg-blue-600" : "bg-green-700"} px-3 py-1 rounded-full text-xs h-fit`}>
            {user.rol === "Administrador" ? "Administrador" : "Cajero"}
          </span>
        </div>

        <div className="flex justify-between align-items mt-5">
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" defaultChecked={user.status} />
            <Label htmlFor="airplane-mode">{user.status ? "Activo" : "Inactivo"}</Label>
          </div>

          <div className="flex align-items gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Ellipsis />
                </PopoverTrigger>
                <PopoverContent align="end">
                  <div className="flex flex-col">
                    <EditUser user={user} />

                    <DeleteUserModal user={user} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
        </div>
      </div>
    </>
  )
}

export default UserDetail