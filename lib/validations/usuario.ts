import { z } from "zod"

export const cajeroSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").trim(),
  correo: z.string().email("Correo inválido").trim().toLowerCase(),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  turno: z.enum(["matutino", "vespertino", "nocturno"]).default("matutino"),
  nss: z.string().optional(),
  rfc: z.string().optional(),
  fechaIngreso: z.string().optional(),
  sueldo: z.coerce.number().min(0).optional(),
  horasSemana: z.coerce.number().int().min(0).optional(),
})

export type CajeroInput = z.infer<typeof cajeroSchema>
