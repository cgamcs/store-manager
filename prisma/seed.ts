/**
 * Test data that exercises every view, trigger and procedure.
 *
 *   pnpm db:seed
 *
 * Runs resetDatabase() first, so it can be re-run at any time. The admin user is kept
 * (or created with password "password" if none exists).
 *
 * Stock is moved the same way the app does it:
 * - initial stock, adjustments and shrinkage: written here, like app/admin/productos/actions.ts
 * - sales: INSERT into "VentaDetalle" -> trg_validar_stock_venta_detalle + trg_descontar_stock_venta
 * - received orders: UPDATE estado = 'recibida' -> trg_recibir_orden_compra
 *
 * Cashier logins (password "password"): elena@tienda.com, brandon@tienda.com (active),
 * ricardo@tienda.com (inactive, cannot log in).
 */
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { resetDatabase } from "./reset"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const HASH_PASSWORD = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // "password"

const day = (offset: number, hour = 12) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, 0, 0, 0)
  return d
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
const categorias = [
  { nombre: "Abarrotes", porcentajeGanancia: 0.25 },
  { nombre: "Lácteos", porcentajeGanancia: 0.2 },
  { nombre: "Bebidas", porcentajeGanancia: 0.3 },
  { nombre: "Limpieza", porcentajeGanancia: 0.35 },
  { nombre: "Higiene personal", porcentajeGanancia: 0.35 },
]

const proveedores = [
  { codigo: "PRV-001", nombreComercial: "Distribuidora del Norte", razonSocial: "Distribuidora del Norte S.A. de C.V.", rfc: "DNO010101AB1", contacto: "Luis Garza", correo: "ventas@distnorte.com", telefono: "8112345678", direccion: "Av. Industrial 120, Monterrey, N.L.", cantidadMinimaOrden: 1500, tiempoEntregaDias: 3, plazoPago: "30 días", metodos: ["transferencia", "credito"] },
  { codigo: "PRV-002", nombreComercial: "Lácteos Premium", razonSocial: "Lácteos Premium S. de R.L.", rfc: "LPR020202CD2", contacto: "Ana Treviño", correo: "pedidos@lacteospremium.com", telefono: "8123456789", direccion: "Carretera a Saltillo km 8, Santa Catarina, N.L.", cantidadMinimaOrden: 3000, tiempoEntregaDias: 2, plazoPago: "15 días", metodos: ["transferencia"] },
  { codigo: "PRV-003", nombreComercial: "Bebidas Express", razonSocial: "Bebidas Express S.A. de C.V.", rfc: "BEX030303EF3", contacto: "Jorge Salinas", correo: "contacto@bebidasexpress.com", telefono: "8134567890", direccion: "Calle Roble 45, Apodaca, N.L.", cantidadMinimaOrden: 1000, tiempoEntregaDias: 1, plazoPago: "Contado", metodos: ["efectivo", "transferencia"] },
  { codigo: "PRV-004", nombreComercial: "Limpieza Total", razonSocial: "Limpieza Total del Noreste S.A.", rfc: "LTN040404GH4", contacto: "Sofía Cantú", correo: "compras@limpiezatotal.com", telefono: "8145678901", direccion: "Blvd. Díaz Ordaz 300, San Pedro, N.L.", cantidadMinimaOrden: 800, tiempoEntregaDias: 5, plazoPago: "30 días", metodos: ["credito"] },
]

// lotes: [days from today, pieces]; their sum must equal stock (perishables only)
type SeedProducto = {
  sku: string; nombre: string; categoria: string; proveedor: string
  precioCompra: number; precioVenta: number; stock: number; stockMinimo?: number
  lotes?: [number, number][]
}
const productos: SeedProducto[] = [
  { sku: "ABR-001", nombre: "Arroz 1kg", categoria: "Abarrotes", proveedor: "PRV-001", precioCompra: 20, precioVenta: 28, stock: 60 },
  { sku: "ABR-002", nombre: "Frijol negro 1kg", categoria: "Abarrotes", proveedor: "PRV-001", precioCompra: 25, precioVenta: 35, stock: 12 },
  { sku: "ABR-003", nombre: "Aceite vegetal 1L", categoria: "Abarrotes", proveedor: "PRV-001", precioCompra: 30, precioVenta: 42, stock: 40 },
  { sku: "ABR-004", nombre: "Azúcar estándar 1kg", categoria: "Abarrotes", proveedor: "PRV-001", precioCompra: 22, precioVenta: 30, stock: 0 },
  { sku: "ABR-005", nombre: "Atún en agua 140g", categoria: "Abarrotes", proveedor: "PRV-001", precioCompra: 14, precioVenta: 20, stock: 50 },
  // Expired, near-expiry and long-dated lots
  { sku: "LAC-001", nombre: "Leche entera 1L", categoria: "Lácteos", proveedor: "PRV-002", precioCompra: 19, precioVenta: 26, stock: 48, lotes: [[-3, 12], [4, 12], [20, 24]] },
  { sku: "LAC-002", nombre: "Yogurt natural 1kg", categoria: "Lácteos", proveedor: "PRV-002", precioCompra: 35, precioVenta: 48, stock: 15, lotes: [[10, 15]] },
  { sku: "LAC-003", nombre: "Queso panela 400g", categoria: "Lácteos", proveedor: "PRV-002", precioCompra: 50, precioVenta: 68, stock: 6, lotes: [[-1, 6]] },
  { sku: "LAC-004", nombre: "Crema ácida 200ml", categoria: "Lácteos", proveedor: "PRV-002", precioCompra: 15, precioVenta: 22, stock: 20, lotes: [[6, 20]] },
  { sku: "BEB-001", nombre: "Refresco de cola 2L", categoria: "Bebidas", proveedor: "PRV-003", precioCompra: 20, precioVenta: 28, stock: 72 },
  { sku: "BEB-002", nombre: "Agua natural 1.5L", categoria: "Bebidas", proveedor: "PRV-003", precioCompra: 8, precioVenta: 12, stock: 100 },
  { sku: "BEB-003", nombre: "Jugo de naranja 1L", categoria: "Bebidas", proveedor: "PRV-003", precioCompra: 18, precioVenta: 25, stock: 24, lotes: [[45, 24]] },
  { sku: "LIM-001", nombre: "Detergente en polvo 1kg", categoria: "Limpieza", proveedor: "PRV-004", precioCompra: 38, precioVenta: 52, stock: 30 },
  { sku: "LIM-002", nombre: "Cloro 1L", categoria: "Limpieza", proveedor: "PRV-004", precioCompra: 14, precioVenta: 20, stock: 5 },
  { sku: "HIG-001", nombre: "Jabón de tocador 150g", categoria: "Higiene personal", proveedor: "PRV-001", precioCompra: 12, precioVenta: 18, stock: 40 },
  { sku: "HIG-002", nombre: "Pasta dental 100ml", categoria: "Higiene personal", proveedor: "PRV-001", precioCompra: 30, precioVenta: 42, stock: 25 },
]

// Sales only use products without lots: lot consumption (FEFO) lives in app/pos/actions.ts.
// [days ago, hour, cashier, [sku, qty][]]
const ventas: [number, number, string, [string, number][]][] = [
  [-13, 9, "elena@tienda.com", [["ABR-001", 3], ["BEB-002", 6]]],
  [-12, 17, "brandon@tienda.com", [["BEB-001", 4], ["ABR-005", 5]]],
  [-10, 11, "elena@tienda.com", [["LIM-001", 2], ["HIG-001", 3], ["HIG-002", 1]]],
  [-8, 19, "brandon@tienda.com", [["ABR-003", 2], ["ABR-002", 4]]],
  [-6, 10, "elena@tienda.com", [["BEB-001", 6], ["BEB-002", 12], ["ABR-001", 2]]],
  [-5, 16, "brandon@tienda.com", [["ABR-005", 8]]],
  [-3, 13, "elena@tienda.com", [["LIM-002", 2], ["LIM-001", 1], ["HIG-001", 2]]],
  [-2, 18, "brandon@tienda.com", [["BEB-001", 3], ["ABR-003", 1], ["HIG-002", 2]]],
  [-1, 12, "elena@tienda.com", [["ABR-001", 5], ["ABR-002", 2]]],
  [0, 10, "brandon@tienda.com", [["BEB-002", 10], ["BEB-001", 2]]],
]

// [proveedor, estado, days ago, [sku, cases, piecesPerCase, expiry offset?][]]
// Every order meets its supplier minimum, like sp_validar_orden_compra requires.
const ordenes: [string, "pendiente" | "enviada" | "recibida" | "cancelada", number, [string, number, number, number?][]][] = [
  ["PRV-001", "recibida", -10, [["ABR-001", 4, 12], ["ABR-003", 2, 12]]],
  ["PRV-002", "recibida", -5, [["LAC-001", 10, 12, 25], ["LAC-002", 2, 6, 18], ["LAC-003", 1, 10, 12]]],
  ["PRV-003", "enviada", -2, [["BEB-001", 4, 8], ["BEB-002", 4, 12]]],
  ["PRV-004", "pendiente", 0, [["LIM-002", 3, 12], ["LIM-001", 1, 10]]],
  ["PRV-001", "pendiente", -1, [["ABR-002", 4, 12], ["ABR-004", 2, 12]]],
  ["PRV-002", "cancelada", -7, [["LAC-001", 14, 12, 30]]],
]

async function main() {
  console.log("Resetting database...")
  await resetDatabase(prisma)

  // Roles and admin
  for (const rol of [{ id: 1, nombre: "administrador" }, { id: 2, nombre: "cajero" }]) {
    await prisma.rol.upsert({ where: { id: rol.id }, update: {}, create: rol })
  }
  let admin = await prisma.usuario.findFirst({ where: { rolId: 1 }, orderBy: { id: "asc" } })
  admin ??= await prisma.usuario.create({
    data: { rolId: 1, nombre: "Admin Principal", correo: "admin@abarrotes-don-tello.com", contrasena: HASH_PASSWORD, correoVerificado: true },
  })

  // Cashiers
  const cajeros = [
    { nombre: "Elena Martínez Rocha", correo: "elena@tienda.com", activo: true, turno: "matutino" },
    { nombre: "Brandon Téllez Gómez", correo: "brandon@tienda.com", activo: true, turno: "vespertino" },
    { nombre: "Ricardo Espinoza Luna", correo: "ricardo@tienda.com", activo: false, turno: "matutino" },
  ]
  const cajeroId: Record<string, number> = {}
  for (const c of cajeros) {
    const u = await prisma.usuario.create({
      data: {
        rolId: 2, nombre: c.nombre, correo: c.correo, contrasena: HASH_PASSWORD, correoVerificado: true,
        perfilCajero: { create: { activo: c.activo, turno: c.turno, telefono: "8100000000", fechaIngreso: day(-120), sueldo: 9500, horasSemana: 48 } },
      },
    })
    cajeroId[c.correo] = u.id
  }

  // Catalog
  const categoriaId: Record<string, number> = {}
  for (const c of categorias) categoriaId[c.nombre] = (await prisma.categoria.create({ data: c })).id

  const proveedorId: Record<string, number> = {}
  for (const { metodos, ...p } of proveedores) {
    const created = await prisma.proveedor.create({
      data: { ...p, metodosPago: { create: metodos.map((metodo) => ({ metodo })) } },
    })
    proveedorId[p.codigo] = created.id
  }

  // Products + initial stock movement (same as createProduct) + lots
  const producto: Record<string, { id: number; precioCompra: number; precioVenta: number }> = {}
  const nearExpiry = day(7)
  for (const p of productos) {
    const created = await prisma.producto.create({
      data: {
        sku: p.sku, nombre: p.nombre, categoriaId: categoriaId[p.categoria], proveedorId: proveedorId[p.proveedor],
        precioCompra: p.precioCompra, precioVenta: p.precioVenta, stockActual: p.stock, stockMinimo: p.stockMinimo ?? 10,
        esMerma: (p.lotes ?? []).some(([d]) => day(d) <= nearExpiry), // same rule as actualizarMermas()
        fechasCaducidad: { create: (p.lotes ?? []).map(([d, cantidad]) => ({ fechaCaducidad: day(d, 0), cantidad })) },
      },
    })
    if (p.stock > 0) {
      await prisma.movimientoInventario.create({
        data: { productoId: created.id, cantidad: p.stock, tipo: "inicial", usuarioId: admin.id, motivo: "Stock inicial al crear producto", fechaHora: day(-30, 8) },
      })
    }
    producto[p.sku] = { id: created.id, precioCompra: p.precioCompra, precioVenta: p.precioVenta }
  }

  // Discounts: one active on near-expiry dairy, one expired
  await prisma.descuento.create({
    data: {
      nombre: "Liquidación lácteos", porcentaje: 30, activo: true, fechaInicio: day(-2), fechaFin: day(7),
      productos: { create: ["LAC-001", "LAC-004"].map((sku) => ({ productoId: producto[sku].id })) },
    },
  })
  await prisma.descuento.create({
    data: {
      nombre: "Promo verano", porcentaje: 10, activo: false, fechaInicio: day(-60), fechaFin: day(-30),
      productos: { create: [{ productoId: producto["BEB-001"].id }] },
    },
  })

  // Purchase orders. Received ones go through the trigger by updating the status.
  for (const [prov, estado, dias, lineas] of ordenes) {
    const orden = await prisma.ordenCompra.create({
      data: {
        proveedorId: proveedorId[prov], usuarioId: admin.id, fechaOrden: day(dias, 9),
        estado: estado === "recibida" ? "enviada" : estado,
        detalles: {
          create: lineas.map(([sku, cantidad, piezasPorUnidad, cad]) => ({
            productoId: producto[sku].id, cantidad, unidad: piezasPorUnidad > 1 ? "caja" : "pieza", piezasPorUnidad,
            precioCompra: producto[sku].precioCompra, precioVenta: producto[sku].precioVenta,
            fechaCaducidad: cad === undefined ? null : day(cad, 0),
          })),
        },
      },
    })
    if (estado === "recibida") {
      await prisma.ordenCompra.update({ where: { id: orden.id }, data: { estado: "recibida" } })
      await prisma.movimientoInventario.updateMany({ where: { referencia: `orden:${orden.id}` }, data: { fechaHora: day(dias + 1, 10) } })
    }
  }

  // Sales. The triggers validate stock, decrement it and write the movement.
  for (const [dias, hora, cajero, lineas] of ventas) {
    const total = lineas.reduce((sum, [sku, qty]) => sum + producto[sku].precioVenta * qty, 0)
    const venta = await prisma.venta.create({ data: { cajeroId: cajeroId[cajero], fechaHora: day(dias, hora), total } })
    await prisma.ventaDetalle.createMany({
      data: lineas.map(([sku, cantidad]) => ({ ventaId: venta.id, productoId: producto[sku].id, cantidad, precioUnitario: producto[sku].precioVenta })),
    })
    await prisma.movimientoInventario.updateMany({ where: { referencia: `venta:${venta.id}` }, data: { fechaHora: venta.fechaHora } })
  }

  // Manual adjustment and shrinkage (same as ajustarStock / registrarMerma)
  const manual: [string, number, "ajuste" | "merma", string, number][] = [
    ["ABR-005", -2, "ajuste", "Conteo físico: faltante", -4],
    ["HIG-001", -1, "merma", "Empaque dañado", -2],
  ]
  for (const [sku, cantidad, tipo, motivo, dias] of manual) {
    await prisma.producto.update({ where: { id: producto[sku].id }, data: { stockActual: { increment: cantidad } } })
    await prisma.movimientoInventario.create({
      data: { productoId: producto[sku].id, cantidad, tipo, motivo, usuarioId: admin.id, fechaHora: day(dias, 20) },
    })
  }

  const [nVentas, nOrdenes, nMov, nLotes] = await Promise.all([
    prisma.venta.count(), prisma.ordenCompra.count(), prisma.movimientoInventario.count(), prisma.fechaCaducidad.count(),
  ])
  console.log(`Seed done: ${productos.length} products, ${nLotes} lots, ${nOrdenes} orders, ${nVentas} sales, ${nMov} movements. Admin: ${admin.correo}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
