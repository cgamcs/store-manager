import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import type { Product } from "@/types"
import { useEffect, useState } from "react"

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

const productos = [
  "Refresco Coca-Cola 600ml",
  "Leche Entera Lala 1L",
  "Pan Blanco Bimbo Grande",
  "Papas Sabritas Original 42g",
  "Aceite Vegetal Nutrioli 800ml",
  "Arroz Extra Verde Valle 900g",
  "Frijoles Bayos Isadora 430g",
  "Huevo Blanco 12 piezas",
  "Jabón de Barra Zote Blanco 400g",
  "Atún en Agua Herdez 130g",
  "Tortillas de Maíz 1kg",
  "Café Soluble Nescafé Clásico 120g",
  "Pasta de Dientes Colgate Total 12 100ml",
  "Detergente en Polvo Ariel 800g",
  "Queso Oaxaca La Villita 400g"
] as const

function ProductForm({ product }: ProductFormProps) {
  const [status, setStatus] = useState<string>(product?.status ?? "")
  const [category, setCategory] = useState<string>(product?.category ?? "")

  useEffect(() => {
    setStatus(product?.category ?? "")
    setStatus(product?.status ?? "")
  }, [product])

  return (
    <>
      <FieldGroup>
        <input type="hidden" id="status" name="status" value={status} />
        <input type="hidden" id="category" name="category" value={category} />
        <Combobox items={productos}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              defaultValue={product?.stock}
            />
          </Field>

          <Field>
            <Label htmlFor="stock">Stock Min.</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              defaultValue={product?.minstock}
            />
          </Field>
        </div>
        {/* <Field>
          <Label htmlFor="category">Categoría</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categoría</SelectLabel>
                <SelectItem value="Lacteos">Lacteos</SelectItem>
                <SelectItem value="Carnes Frias">Carnes Frias</SelectItem>
                <SelectItem value="Refrescos">Refrescos</SelectItem>
                <SelectItem value="Limpieza">Limpieza</SelectItem>
                <SelectItem value="Ultraprocesados">Ultraprocesados</SelectItem>
                <SelectItem value="Cereales">Cereales</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field> */}
        {/* <Field>
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Estado</SelectLabel>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Archivado">Archivado</SelectItem>
                <SelectItem value="Borrador">Borrador</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field> */}
      </FieldGroup>
    </>
  )
}

export default ProductForm