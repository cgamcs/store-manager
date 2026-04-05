import { z } from "zod"

export const productoSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre es requerido" })
    .min(1, "El nombre es requerido")
    .max(150, "El nombre no puede exceder 150 caracteres")
    .trim(),
  sku: z
    .string()
    .min(1, "El SKU es requerido")
    .max(20, "El SKU no puede exceder 20 caracteres")
    .regex(/^[A-Z0-9-]+$/, "El SKU solo puede contener letras mayúsculas, números y guiones")
    .optional()
    .nullable(),
  categoriaId: z.coerce
    .number({ required_error: "La categoría es requerida" })
    .int()
    .positive("La categoría es inválida"),
  proveedorId: z.coerce
    .number({ required_error: "El proveedor es requerido" })
    .int()
    .positive("El proveedor es inválido"),
  precioCompra: z.coerce
    .number({ required_error: "El precio de compra es requerido" })
    .positive("El precio de compra debe ser mayor a 0"),
  precioVenta: z.coerce
    .number({ required_error: "El precio de venta es requerido" })
    .positive("El precio de venta debe ser mayor a 0"),
  stockActual: z.coerce
    .number({ required_error: "El stock actual es requerido" })
    .int()
    .min(0, "El stock no puede ser negativo"),
  stockMinimo: z.coerce
    .number()
    .int()
    .min(0, "El stock mínimo no puede ser negativo")
    .default(10),
})

export type ProductoInput = z.infer<typeof productoSchema>
