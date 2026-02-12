import { useEffect, useState } from "react"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ColorPicker from "@/components/categories/ColorPicker"

type CategoryFormProps = {
  // product?: Product
  category?: {
    id: number
    name: string
    description: string
    color: string
  }
}

function CategoryForm({ category }: CategoryFormProps) {
  const [color, setColor] = useState<string>(category?.color ?? "")

  useEffect(() => {
    setColor(category?.color ?? "")
  }, [category])

  return (
    <>
      <FieldGroup>
        <input type="hidden" id="color" name="color" value={color} />
        <Field>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={category?.name}
          />
        </Field>
        <Field>
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            name="description"
            type="text"
            defaultValue={category?.description}
          />
        </Field>
        
        <ColorPicker 
          name="color" 
          label="Color"
          defaultValue={category?.color}
          required
        />
      </FieldGroup>
    </>
  )
}

export default CategoryForm