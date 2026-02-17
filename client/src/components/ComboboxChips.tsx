import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "coca cola",      label: "Coca-Cola 600ml" },
  { value: "pepse",        label: "Pepsi 600ml" },
  { value: "sabritas",    label: "Sabritas Original 45g" },
  { value: "doritos",     label: "Doritos Nacho 46g" },
  { value: "bimbo",     label: "Pan Bimbo Blanco Chico" },
  { value: "tortillinas", label: "Tortillinas Tía Rosa 10 pzas" },
]

interface ComboboxChipsProps {
  selected: string[]
  onChange: (values: string[]) => void
}

export default function ComboboxChips({ selected, onChange }: ComboboxChipsProps) {
  const [open, setOpen] = useState(false)

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const remove = (value: string) =>
    onChange(selected.filter((v) => v !== value))

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((val) => {
            const label = OPTIONS.find((o) => o.value === val)?.label ?? val
            return (
              <Badge key={val} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                {label}
                <button
                  onClick={() => remove(val)}
                  className="ml-1 rounded-full hover:bg-oscuro-primario"
                  aria-label={`Eliminar ${label}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Popover con modal={false} ← CLAVE dentro de Dialog */}
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-9">
            {selected.length === 0
              ? "Selecciona productos"
              : `${selected.length} seleccionadas`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar…" />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup>
                {OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => toggle(opt.value)}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(opt.value) ? "opacity-100" : "opacity-0"
                    )} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}