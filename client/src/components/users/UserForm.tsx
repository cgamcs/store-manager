import { useEffect, useState, } from "react"
import { Field, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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

const usuarios = [
  { value: "maria.garcia@correo.com", label: "mariagarcia" },
  { value: "carlos.martinez@correo.com", label: "carlosmartinez" },
  { value: "javier.perez@correo.com", label: "javierperez" },
  { value: "juan.guzman@correo.com", label: "juanguzman" },
]

function UserForm({ user }: UserFormProps) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [rol, setRol] = useState<string>(user?.rol ?? "")

  useEffect(() => {
    setRol(user?.rol ?? "")
  }, [user])

  console.log(user?.rol)

  return (
    <>
      <FieldGroup>
        <input type="hidden" id="rol" name="rol" value={rol} />
        
        <Field>
          <Label htmlFor="producto">Producto</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {value
                  ? usuarios.find((usuario) => usuario.value === value)?.label
                  : "Selecciona un usuario..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar usuario..." />
                <CommandEmpty>No se encontró ningún usuario.</CommandEmpty>
                <CommandGroup>
                  {usuarios.map((usuario) => (
                    <CommandItem
                      key={usuario.value}
                      value={usuario.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-gray-300",
                          value === usuario.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {usuario.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
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