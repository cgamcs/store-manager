/**
 * prisma/seed.ts
 *
 * Decisión de estructura:
 * Se importa mock-data.ts directamente en lugar de dividir en múltiples archivos
 * (ej: prisma/seeds/usuarios.ts, prisma/seeds/productos.ts).
 *
 * Razón: el volumen de datos es pequeño y ya está organizado en un solo módulo.
 * Dividirlo agregaría indirección sin beneficio real en esta etapa.
 * Si el proyecto escala (cientos de registros por entidad), migrar a
 * prisma/seeds/<entidad>.ts sería el paso natural.
 *
 * Datos NO persistidos desde mock-data.ts:
 * - dashboardStats     → cálculos derivados, se generan en generarEstadisticas()
 * - productosMasVendidos → cálculo derivado de VentaDetalle
 * - generateSKU()      → helper de UI, no pertenece a la capa de datos
 * - calculateSuggestedPrice() → helper de UI
 *
 * Para ejecutar:
 *   pnpm prisma db seed
 *   (requiere: pnpm add -D tsx  y la sección "prisma.seed" en package.json)
 */

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  categorias,
  proveedores,
  productos,
  descuentos,
  ordenesCompra,
  usuarios,
  perfilesCajero,
  ventasRecientes,
} from '../lib/mock-data'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// Limpieza — permite re-ejecutar el seed sin duplicados
// Se elimina en orden inverso al de inserción para respetar foreign keys
// ---------------------------------------------------------------------------
async function limpiarDatos() {
  await prisma.ventaDetalle.deleteMany()
  await prisma.ordenDetalle.deleteMany()
  await prisma.fechaCaducidad.deleteMany()
  await prisma.descuentoProducto.deleteMany()
  await prisma.venta.deleteMany()
  await prisma.ordenCompra.deleteMany()
  await prisma.descuento.deleteMany()
  await prisma.producto.deleteMany()
  await prisma.perfilCajero.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.proveedor.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.rol.deleteMany()
}

// ---------------------------------------------------------------------------
// Resetear secuencias de PostgreSQL después de insertar IDs explícitos.
// Sin esto, los próximos inserts sin ID explícito colisionarían con los existentes.
// ---------------------------------------------------------------------------
async function resetearSecuencias() {
  const tablas = [
    'Rol',
    'Usuario',
    'PerfilCajero',
    'Categoria',
    'Proveedor',
    'Producto',
    'Descuento',
    'Venta',
    'VentaDetalle',
    'OrdenCompra',
    'OrdenDetalle',
    'FechaCaducidad',
  ]

  for (const tabla of tablas) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${tabla}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tabla}"), 0) + 1, false)`
    )
  }
}

// ---------------------------------------------------------------------------
// Roles — datos fijos, se insertan con IDs explícitos
// ---------------------------------------------------------------------------
async function seedRoles() {
  await prisma.rol.createMany({
    data: [
      { id: 1, nombre: 'administrador' },
      { id: 2, nombre: 'cajero' },
    ],
  })
  console.log('  ✓ Roles')
}

// ---------------------------------------------------------------------------
// Usuarios — contraseñas con hash bcrypt pre-calculado (costo 10)
// Hash de "password" para desarrollo. Cambiar en producción.
// ---------------------------------------------------------------------------
async function seedUsuarios() {
  const HASH_DEV = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'

  await prisma.usuario.createMany({
    data: usuarios.map((u) => ({
      id: u.id,
      rolId: u.rol_id,
      nombre: u.nombre,
      correo: u.correo,
      contrasena: HASH_DEV,
    })),
  })
  console.log('  ✓ Usuarios')
}

// ---------------------------------------------------------------------------
// Perfiles cajero — solo los campos que existen en el schema
// Campos omitidos del mock (no están en schema): nss, rfc, fecha_ingreso, sueldo, horas_semana
// ---------------------------------------------------------------------------
async function seedPerfilesCajero() {
  await prisma.perfilCajero.createMany({
    data: perfilesCajero.map((p) => ({
      usuarioId: p.usuario_id,
      direccion: p.direccion,
      telefono: p.telefono,
      turno: p.turno,
    })),
  })
  console.log('  ✓ Perfiles cajero')
}

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------
async function seedCategorias() {
  await prisma.categoria.createMany({
    data: categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      porcentajeGanancia: c.margen_ganancia,
    })),
  })
  console.log('  ✓ Categorías')
}

// ---------------------------------------------------------------------------
// Proveedores — todos los campos del schema
// ---------------------------------------------------------------------------
async function seedProveedores() {
  await prisma.proveedor.createMany({
    data: proveedores.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nombreComercial: p.nombre,
      razonSocial: p.razon_social,
      rfc: p.rfc,
      contacto: p.contacto,
      correo: p.correo,
      telefono: p.telefono,
      direccion: p.direccion,
      cantidadMinimaOrden: p.cantidad_minima_orden,
      tiempoEntregaDias: p.tiempo_entrega_dias,
      plazoPago: p.plazo_pago,
      metodosPago: p.metodos_pago,
    })),
  })
  console.log('  ✓ Proveedores')
}

// ---------------------------------------------------------------------------
// Productos — campos omitidos del mock: sku, stock_minimo, es_merma, descuento
// ---------------------------------------------------------------------------
async function seedProductos() {
  await prisma.producto.createMany({
    data: productos.map((p) => ({
      id: p.id,
      proveedorId: p.proveedor_id,
      categoriaId: p.categoria_id,
      nombre: p.nombre,
      precioCompra: p.precio_compra,
      precioVenta: p.precio_venta,
      stockActual: p.stock_actual,
    })),
  })
  console.log('  ✓ Productos')
}

// ---------------------------------------------------------------------------
// Descuentos + tabla de unión DescuentoProducto
// Campos omitidos del mock: fecha_inicio, fecha_fin (no están en schema)
// ---------------------------------------------------------------------------
async function seedDescuentos() {
  await prisma.descuento.createMany({
    data: descuentos.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      porcentaje: d.porcentaje,
      activo: d.activo,
    })),
  })

  const relaciones = descuentos.flatMap((d) =>
    d.productos_ids.map((productoId) => ({
      descuentoId: d.id,
      productoId,
    }))
  )
  await prisma.descuentoProducto.createMany({ data: relaciones })
  console.log('  ✓ Descuentos')
}

// ---------------------------------------------------------------------------
// Ventas + VentaDetalle
//
// El mock (ventasRecientes) no incluye VentaDetalle. Se generan detalles
// sintéticos que representan una distribución plausible de productos.
// Los totales del mock se conservan en Venta.total (campo calculado).
//
// Campo omitido del mock: corte_id (no existe en el schema)
// ---------------------------------------------------------------------------
const DETALLE_VENTAS_SINTETICO: Record<
  number,
  { productoId: number; cantidad: number; precioUnitario: number }[]
> = {
  1: [
    { productoId: 1, cantidad: 5, precioUnitario: 28 },    // Arroz
    { productoId: 4, cantidad: 6, precioUnitario: 26 },    // Leche
    { productoId: 8, cantidad: 10, precioUnitario: 12 },   // Agua
  ],
  2: [
    { productoId: 7, cantidad: 4, precioUnitario: 28 },    // Refresco
    { productoId: 2, cantidad: 3, precioUnitario: 35 },    // Frijol
  ],
  3: [
    { productoId: 3, cantidad: 3, precioUnitario: 42 },    // Aceite
    { productoId: 5, cantidad: 4, precioUnitario: 68 },    // Queso
    { productoId: 14, cantidad: 3, precioUnitario: 68 },   // Shampoo
    { productoId: 12, cantidad: 5, precioUnitario: 52 },   // Detergente
  ],
  4: [
    { productoId: 13, cantidad: 4, precioUnitario: 18 },   // Jabón
    { productoId: 15, cantidad: 3, precioUnitario: 42 },   // Pasta dental
  ],
  5: [
    { productoId: 4, cantidad: 10, precioUnitario: 26 },   // Leche
    { productoId: 7, cantidad: 8, precioUnitario: 28 },    // Refresco
    { productoId: 1, cantidad: 5, precioUnitario: 28 },    // Arroz
    { productoId: 8, cantidad: 15, precioUnitario: 12 },   // Agua
    { productoId: 10, cantidad: 8, precioUnitario: 56 },   // Jamón
  ],
}

async function seedVentas() {
  await prisma.venta.createMany({
    data: ventasRecientes.map((v) => ({
      id: v.id,
      cajeroId: v.cajero_id,
      fechaHora: v.fecha_hora,
      total: v.total,
    })),
  })

  const detalles = ventasRecientes.flatMap((v) =>
    (DETALLE_VENTAS_SINTETICO[v.id] ?? []).map((d) => ({
      ventaId: v.id,
      productoId: d.productoId,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    }))
  )
  await prisma.ventaDetalle.createMany({ data: detalles })
  console.log('  ✓ Ventas y detalles')
}

// ---------------------------------------------------------------------------
// Órdenes de compra + OrdenDetalle + FechasCaducidad
// Campo omitido del mock: estado (no está en el schema actual)
// ---------------------------------------------------------------------------
async function seedOrdenesCompra() {
  await prisma.ordenCompra.createMany({
    data: ordenesCompra.map((o) => ({
      id: o.id,
      proveedorId: o.proveedor_id,
      usuarioId: o.usuario_id,
      fechaOrden: o.fecha_orden,
      total: o.total,
    })),
  })

  const detallesOrdenes = ordenesCompra
    .filter((o) => o.detalles && o.detalles.length > 0)
    .flatMap((o) =>
      o.detalles!.map((d) => ({
        ordenId: o.id,
        productoId: d.producto_id,
        cantidad: d.cantidad,
        precioCompra: d.precio_unitario,
      }))
    )

  if (detallesOrdenes.length > 0) {
    await prisma.ordenDetalle.createMany({ data: detallesOrdenes })
  }

  // FechasCaducidad — extraídas de los detalles de orden
  const fechasCaducidad = ordenesCompra
    .flatMap((o) => o.detalles ?? [])
    .filter((d) => d.fecha_caducidad)
    .map((d) => ({
      productoId: d.producto_id,
      fechaCaducidad: d.fecha_caducidad!,
      cantidad: d.cantidad,
    }))

  if (fechasCaducidad.length > 0) {
    await prisma.fechaCaducidad.createMany({ data: fechasCaducidad })
  }

  console.log('  ✓ Órdenes de compra y fechas de caducidad')
}

// ---------------------------------------------------------------------------
// Estadísticas — calculadas dinámicamente desde la BD, no persistidas
// Reemplaza los valores estáticos de dashboardStats y productosMasVendidos
// del mock-data.ts
// ---------------------------------------------------------------------------
async function generarEstadisticas() {
  const [ventas, totalProductos, descuentosActivos] = await Promise.all([
    prisma.venta.findMany({ include: { detalles: true } }),
    prisma.producto.count(),
    prisma.descuento.count({ where: { activo: true } }),
  ])

  const totalVentas = ventas.length
  const ingresoTotal = ventas.reduce((sum, v) => sum + Number(v.total), 0)
  const ticketPromedio = totalVentas > 0 ? ingresoTotal / totalVentas : 0

  const ventasPorCajero = await prisma.venta.groupBy({
    by: ['cajeroId'],
    _sum: { total: true },
    _count: { id: true },
    orderBy: { cajeroId: 'asc' },
  })

  const productosMasVendidos = await prisma.ventaDetalle.groupBy({
    by: ['productoId'],
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 5,
  })

  console.log('\n  📊 Estadísticas calculadas:')
  console.log(`     Total ventas:       ${totalVentas}`)
  console.log(`     Ingreso total:      $${ingresoTotal.toFixed(2)}`)
  console.log(`     Ticket promedio:    $${ticketPromedio.toFixed(2)}`)
  console.log(`     Productos activos:  ${totalProductos}`)
  console.log(`     Descuentos activos: ${descuentosActivos}`)
  console.log('     Ventas por cajero:')
  for (const vc of ventasPorCajero) {
    console.log(
      `       Cajero #${vc.cajeroId}: ${vc._count.id} ventas — $${Number(vc._sum.total ?? 0).toFixed(2)}`
    )
  }
  console.log('     Top 5 productos vendidos (por cantidad):')
  for (const pv of productosMasVendidos) {
    console.log(
      `       Producto #${pv.productoId}: ${pv._sum.cantidad} unidades`
    )
  }
}

// ---------------------------------------------------------------------------
// Orquestador principal
// ---------------------------------------------------------------------------
async function main() {
  console.log('🌱 Iniciando seed...\n')

  try {
    // No se usa $transaction — el timeout interactivo (5s por defecto) es insuficiente
    // para el volumen del seed. La idempotencia se garantiza con limpiarDatos() al inicio.
    console.log('  🗑️  Limpiando datos existentes...')
    await limpiarDatos()

    await seedRoles()
    await seedUsuarios()
    await seedPerfilesCajero()
    await seedCategorias()
    await seedProveedores()
    await seedProductos()
    await seedDescuentos()
    await seedOrdenesCompra()
    await seedVentas()

    await resetearSecuencias()
    await generarEstadisticas()

    console.log('\n✅ Seed completado exitosamente\n')
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
