import { z } from "zod"

export const ordenDetalleSchema = z.object({
  productoId: z.coerce
    .number({ required_error: "El producto es requerido" })
    .int()
    .positive("El producto es inválido"),
  cantidad: z.coerce
    .number({ required_error: "La cantidad es requerida" })
    .int()
    .positive("La cantidad debe ser mayor a 0"),
  unidad: z.enum(["tarima", "bulto", "pieza", "caja"], {
    required_error: "La unidad es requerida",
  }),
  piezasPorUnidad: z.coerce
    .number()
    .int()
    .positive("Las piezas por unidad deben ser mayor a 0")
    .default(1),
  precioCompra: z.coerce
    .number({ required_error: "El precio de compra es requerido" })
    .positive("El precio de compra debe ser mayor a 0"),
  precioVenta: z.coerce.number().positive().optional().nullable(),
  fechaCaducidad: z.string().optional().nullable(),
})

export const ordenSchema = z.object({
  proveedorId: z.coerce
    .number({ required_error: "El proveedor es requerido" })
    .int()
    .positive("El proveedor es inválido"),
  detalles: z
    .array(ordenDetalleSchema)
    .min(1, "Agrega al menos un producto a la orden"),
})

export const updateEstadoSchema = z.object({
  estado: z.enum(["pendiente", "enviada", "recibida", "cancelada"]),
})

export type OrdenInput = z.infer<typeof ordenSchema>
export type UpdateEstadoInput = z.infer<typeof updateEstadoSchema>
