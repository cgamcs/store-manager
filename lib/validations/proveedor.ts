import { z } from "zod"

export const proveedorSchema = z.object({
  codigo: z
    .string({ required_error: "El código es requerido" })
    .min(1, "El código es requerido")
    .max(20, "El código no puede exceder 20 caracteres")
    .regex(/^[A-Z0-9-]+$/, "Solo letras mayúsculas, números y guiones")
    .trim(),
  nombreComercial: z
    .string({ required_error: "El nombre comercial es requerido" })
    .min(1, "El nombre comercial es requerido")
    .max(150)
    .trim(),
  razonSocial: z
    .string({ required_error: "La razón social es requerida" })
    .min(1, "La razón social es requerida")
    .max(200)
    .trim(),
  rfc: z
    .string({ required_error: "El RFC es requerido" })
    .min(1, "El RFC es requerido")
    .max(13, "El RFC no puede exceder 13 caracteres")
    .regex(/^[A-Z0-9&Ñ]+$/, "RFC inválido")
    .trim(),
  contacto: z
    .string({ required_error: "La persona de contacto es requerida" })
    .min(1, "La persona de contacto es requerida")
    .max(100)
    .trim(),
  correo: z
    .string({ required_error: "El correo es requerido" })
    .email("Correo electrónico inválido")
    .max(150)
    .trim(),
  telefono: z
    .string({ required_error: "El teléfono es requerido" })
    .min(1, "El teléfono es requerido")
    .max(20)
    .trim(),
  direccion: z
    .string({ required_error: "La dirección es requerida" })
    .min(1, "La dirección es requerida")
    .max(300)
    .trim(),
  cantidadMinimaOrden: z.coerce
    .number({ required_error: "La cantidad mínima es requerida" })
    .min(0, "No puede ser negativa"),
  tiempoEntregaDias: z.coerce
    .number({ required_error: "El tiempo de entrega es requerido" })
    .int()
    .min(1, "Debe ser al menos 1 día"),
  plazoPago: z
    .string({ required_error: "El plazo de pago es requerido" })
    .min(1, "El plazo de pago es requerido")
    .max(50)
    .trim(),
  metodosPago: z
    .array(z.string())
    .min(1, "Selecciona al menos un método de pago"),
})

export type ProveedorInput = z.infer<typeof proveedorSchema>
