import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Product } from "@/types"
import { useEffect, useState } from "react"

type ProductFormProps = {
  product?: Product
}

function ProductForm({ product }: ProductFormProps) {
  const [status, setStatus] = useState<string>(product?.status ?? "")

  useEffect(() => {
    setStatus(product?.status ?? "")
  }, [product])

  return (
    <>
      <FieldGroup>
        <input type="hidden" id="status" name="status" value={status} />
        <Field>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={product?.name}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price}
            />
          </Field>

          <Field>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              defaultValue={product?.stock}
            />
          </Field>
        </div>
        <Field>
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            name="category"
            type="text"
            defaultValue={product?.category}
          />
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