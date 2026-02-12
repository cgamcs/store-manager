import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
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
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={product?.name}
            />
          </Field>
          <Field>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              type="text"
              defaultValue={product?.sku}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <Label htmlFor="price">Costo</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.cost}
            />
          </Field>

          <Field>
            <Label htmlFor="revenue">% Ganancia</Label>
            <Input
              id="revenue"
              name="revenue"
              type="number"
              defaultValue={product?.revenue}
            />
          </Field>
        </div>
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
        <Field>
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
        </Field>
        <Field>
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
        </Field>
      </FieldGroup>
    </>
  )
}

export default ProductForm