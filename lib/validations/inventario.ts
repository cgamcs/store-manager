import { z } from "zod"

export const ajustarStockSchema = z.object({
  productoId: z.coerce.number().int().positive("Producto inválido"),
  nuevaCantidad: z.coerce.number().int().min(0, "La cantidad no puede ser negativa"),
  motivo: z.string().min(1, "El motivo es requerido").max(500, "El motivo es demasiado largo"),
})

export const registrarMermaSchema = z.object({
  productoId: z.coerce.number().int().positive("Producto inválido"),
  cantidad: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0"),
  motivo: z.string().min(1, "El motivo es requerido").max(500, "El motivo es demasiado largo"),
})

export type AjustarStockInput = z.infer<typeof ajustarStockSchema>
export type RegistrarMermaInput = z.infer<typeof registrarMermaSchema>
