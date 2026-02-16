import { useEffect, useState, } from "react"
import { Field, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type UserFormProps = {
  user?: {
    id: number
    name: string
    lastname: string
    email: string
    password: string
    rol: string
    status: boolean
  }
}

function UserForm({ user }: UserFormProps) {
  const [rol, setRol] = useState<string>(user?.rol ?? "")

  useEffect(() => {
    setRol(user?.rol ?? "")
  }, [user])

  console.log(user?.rol)

  return (
    <>
      <FieldGroup>
        <input type="hidden" id="rol" name="rol" value={rol} />
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user?.name}
            />
          </Field>
          <Field>
            <Label htmlFor="lastname">Apellido</Label>
            <Input
              id="lastname"
              name="lastname"
              type="text"
              defaultValue={user?.lastname}
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email}
          />
        </Field>
        <Field>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            // defaultValue={user?.email}
          />
        </Field>
        <Field>
          <Label htmlFor="password">Verificar Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            // defaultValue={user?.email}
          />
        </Field>
        <Field>
          <Label htmlFor="rol">Roles</Label>
          <Select value={rol} onValueChange={setRol}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Cajero">Cajero</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </>
  )
}

export default UserForm