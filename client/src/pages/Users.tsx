import NewUser from "@/components/users/NewUser"
import UserDetail from "@/components/users/UserDetail"
import { Shield, ShoppingBag, Users as User2 } from "lucide-react"

function Users() {
  const users = [
    {
      id: 1,
      name: "María",
      lastname: "García",
      email: "marcia@comercio.com",
      password: "#####3",
      rol: "Administrador",
      status: true
    },
    {
      id: 2,
      name: "Carlos",
      lastname: "López",
      email: "carlos@comercio.com",
      password: "#####3",
      rol: "Cajero",
      status: true
    },
    {
      id: 3,
      name: "Ana",
      lastname: "Martínez",
      email: "ana@comercio.com",
      password: "#####3",
      rol: "Cajero",
      status: false
    },
  ]
  return (
    <>
      <header className="bg-oscuro-secundario pb-7.5 border-b-2 border-borde">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl text-letra-principal font-bold">Usuarios</h2>
          
          <NewUser />
        </div>
      </header>

      <div className="grid grid-cols-3 gap-5 mt-10">
        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <User2 className="text-gray-400 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-200 text-sm">Total Usuarios</h3>
              <span className="text-4xl font-bold">5</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <Shield className="text-blue-600 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Administradores</h3>
              <span className="text-4xl font-bold">1</span>
            </div>
          </div>
        </div>

        <div className="border border-borde p-4 rounded-lg bg-claro-primario">
          <div className="flex items-center gap-5">
            <div className="bg-oscuro-secundario p-3 rounded-md">
              <ShoppingBag className="text-green-700 w-10 h-10" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-gray-400 text-sm">Cajeros</h3>
              <span className="text-4xl font-bold">2</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-10">
        {users.map(user => (
          <UserDetail user={user} />
        ))}
      </div>
    </>
  )
}

export default Users