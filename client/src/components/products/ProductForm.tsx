import { useEffect, useState } from "react"
import type { Product } from "@/types"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Plus, Search, Trash2 } from "lucide-react"
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
// import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"


type ProductFormProps = {
  // product?: Product
  product?: {
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

const categorias = [
  { value: "lacteos", label: "Lacteos" },
  { value: "refrescos", label: "Refrescos" },
  { value: "ultraprocesados", label: "Ultraprocesados" },
  { value: "limpieza", label: "Limpieza" },
]

const productos = [
  { value: "sku-1002345890123-coca600", label: "Coca-Cola 600ml" },
  { value: "sku-1002345890124-pepsi600", label: "Pepsi 600ml" },
  { value: "sku-1002345890125-sabritas45", label: "Sabritas Original 45g" },
  { value: "sku-1002345890126-doritos46", label: "Doritos Nacho 46g" },
  { value: "sku-1002345890127-bimboBlanco", label: "Pan Bimbo Blanco Chico" },
  { value: "sku-1002345890128-tortillinas", label: "Tortillinas Tía Rosa 10 pzas" },
  { value: "sku-1002345890129-lecheLala1L", label: "Leche Lala Entera 1L" },
  { value: "sku-1002345890130-huevo18", label: "Huevo Blanco 18 pzas" },
  { value: "sku-1002345890131-maruchanCam", label: "Maruchan Camarón" },
  { value: "sku-1002345890132-atunDol", label: "Atún Dolores en Agua" },
  { value: "sku-1002345890133-arrozVer1k", label: "Arroz Verde Valle 1kg" },
  { value: "sku-1002345890134-frijolPin1k", label: "Frijol Pinto 1kg" },
  { value: "sku-1002345890135-aceiteNut1L", label: "Aceite Nutrioli 1L" },
  { value: "sku-1002345890136-azucarZul1k", label: "Azúcar Zulka 1kg" },
  { value: "sku-1002345890137-salLaFi", label: "Sal La Fina 1kg" },
  { value: "sku-1002345890138-nescafe100", label: "Nescafé Clásico 100g" },
  { value: "sku-1002345890139-galletMaria", label: "Galletas Marías 170g" },
  { value: "sku-1002345890140-jamonFud250", label: "Jamón Fud 250g" },
  { value: "sku-1002345890141-quesoOax250", label: "Queso Oaxaca 250g" },
  { value: "sku-1002345890142-aguaCie1L", label: "Agua Ciel 1L" },
  { value: "sku-1002345890143-cloralex1L", label: "Cloralex 1L" },
  { value: "sku-1002345890144-papelReg4", label: "Papel Higiénico Regio 4 rollos" },
  { value: "sku-1002345890145-shampooSed400", label: "Shampoo Sedal 400ml" },
]

function ProductForm({ product }: ProductFormProps) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>(product?.name ?? "")

  useEffect(() => {
    setSelectedProduct(product?.name ?? "")
  }, [product])

  return (
    <>
      <FieldGroup>
        <input type="hidden" name="name" value={selectedProduct} />

        <div className="grid grid-cols-9 gap-6">
          <div className="col-span-5">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 px-2 py-0.5 bg-borde rounded-md flex items-center gap-2 text-gray-400">
                <Search className="w-5 h-5" />
                
                Buscar producto o SKU...
              </div>

              <div className="col-span-1 bg-borde rounded-md">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {value
                        ? categorias.find((categoria) => categoria.value === value)?.label
                        : "Todas"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar categoria..." />
                      <CommandEmpty>No se encontró ningún categoria.</CommandEmpty>
                      <CommandGroup>
                        {categorias.map((categoria) => (
                          <CommandItem
                            key={categoria.value}
                            value={categoria.value}
                            onSelect={(currentValue) => {
                              setValue(currentValue === value ? "" : currentValue)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === categoria.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {categoria.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5 h-106 overflow-scroll no-scrollbar">
              {productos.map(producto => (
                <div className="bg-oscuro-primario p-2 rounded-md border border-borde flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex gap-3">
                      <p>{producto.label}</p>
                      <p className="text-xs text-center py-1 px-2 bg-borde rounded-full">Lacteos</p>
                    </div>

                    <div className="flex gap-3">
                      <p className="text-sm text-gray-400">{producto.value}</p>
                      <p className="text-sm text-gray-400">Stock: 120</p>
                    </div>
                  </div>

                  <button className="bg-borde flex items-center gap-1 px-3 py-1 h-fit border border-borde rounded-sm">
                    <Plus className="w-5 h-5" />
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-4 flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Resumen de Orden</h3>
                
                <p className="bg-blue-600 px-2 text-sm rounded-full">3</p>
              </div>

              <div className="flex flex-col gap-2 mt-5 overflow-hidden no-scrollbar">
                <div className="bg-oscuro-primario flex justify-between items-center p-2 border border-borde rounded-md">
                  <div className="flex flex-col">
                    <p className="font-bold">Coca-Cola 600ml</p>
                    <span className="text-xs">15 x $25.50</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">$382.50</span>

                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <div className="bg-oscuro-primario flex justify-between items-center p-2 border border-borde rounded-md">
                  <div className="flex flex-col">
                    <p className="font-bold">Pepsi 600ml</p>
                    <span className="text-xs">6 x $42.00</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">$252.00</span>

                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                </div>

                <div className="bg-oscuro-primario flex justify-between items-center p-2 border border-borde rounded-md">
                  <div className="flex flex-col">
                    <p className="font-bold">Pan Bimbo Blanco Chico</p>
                    <span className="text-xs">28 x $28.00</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">$784.00</span>

                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-400">Total estimado</p>

              <span className="font-extrabold text-lg">$1418.50</span>
            </div>
          </div>
        </div>

        
      </FieldGroup>
    </>
  )
}

export default ProductForm