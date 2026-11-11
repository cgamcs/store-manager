/**
 * Deletes all business data and every non-admin user. Keeps roles and admin users (rolId = 1).
 *
 *   pnpm db:reset
 *
 * TRUNCATE does not fire row-level triggers, so wiping "VentaDetalle" does not
 * restore stock or write audit rows the way a DELETE would.
 */
import "dotenv/config"
import { pathToFileURL } from "node:url"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

export async function resetDatabase(prisma: PrismaClient) {
  // ponytail: generous maxWait because the Neon pooler can be slow to open a transaction
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`
      TRUNCATE TABLE
        "VentaDetalle", "Venta", "OrdenDetalle", "OrdenCompra",
        "MovimientoInventario", "FechaCaducidad", "DescuentoProducto", "Descuento",
        "Producto", "ProveedorMetodoPago", "Proveedor", "Categoria"
      RESTART IDENTITY
    `)
    await tx.perfilCajero.deleteMany({ where: { usuario: { rolId: { not: 1 } } } })
    await tx.usuario.deleteMany({ where: { rolId: { not: 1 } } }) // tokens cascade
    for (const tabla of ["Usuario", "PerfilCajero"]) {
      await tx.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${tabla}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabla}"), 0) + 1, false)`
      )
    }
  }, { maxWait: 15000, timeout: 30000 })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })
  resetDatabase(prisma)
    .then(async () => {
      const admins = await prisma.usuario.findMany({ where: { rolId: 1 }, select: { correo: true } })
      console.log(`Database wiped. Admins kept: ${admins.map((a) => a.correo).join(", ") || "none"}`)
    })
    .catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
