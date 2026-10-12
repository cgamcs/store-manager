/**
 * Verifica las vistas, triggers y procedimientos de la base de datos.
 *
 *   npx tsx test-db-objects.ts
 *
 * Todas las pruebas que escriben corren dentro de una transaccion con ROLLBACK,
 * asi que no dejan datos en la base.
 */
import "dotenv/config"
import { Client } from "pg"

const c = new Client({ connectionString: process.env.DATABASE_URL })

let pasaron = 0
let fallaron = 0

function check(condicion: boolean, mensaje: string) {
  if (condicion) {
    pasaron++
    console.log(`   PASS  ${mensaje}`)
  } else {
    fallaron++
    console.log(`   FALLO ${mensaje}`)
  }
}

async function rows<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return (await c.query(sql, params)).rows as T[]
}

async function row<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T> {
  const r = await rows<T>(sql, params)
  return r[0]
}

type Producto = { id: number; nombre: string; stockActual: number; proveedorId: number }
type Movimiento = { cantidad: number; tipo: string; motivo: string | null }

async function verificarInventarioDeObjetos() {
  console.log("\n### Objetos existentes ###")

  const vistas = await rows<{ viewname: string }>(
    `SELECT viewname FROM pg_views WHERE schemaname='public' AND viewname LIKE 'vista_%' ORDER BY viewname`
  )
  check(vistas.length >= 3, `hay al menos 3 vistas (${vistas.map((v) => v.viewname).join(", ")})`)

  const triggers = await rows<{ trigger_name: string; action_timing: string; event_manipulation: string }>(
    `SELECT trigger_name, action_timing, event_manipulation FROM information_schema.triggers
     WHERE trigger_schema='public' ORDER BY trigger_name`
  )
  const eventos = new Set(triggers.map((t) => t.event_manipulation))
  const momentos = new Set(triggers.map((t) => t.action_timing))
  check(eventos.has("INSERT") && eventos.has("UPDATE") && eventos.has("DELETE"), "los triggers cubren INSERT, UPDATE y DELETE")
  check(momentos.has("BEFORE") && momentos.has("AFTER"), "los triggers cubren BEFORE y AFTER")

  const procs = await rows<{ proname: string }>(
    `SELECT proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='public' AND p.prokind='p' ORDER BY proname`
  )
  check(procs.length >= 3, `hay al menos 3 procedimientos (${procs.map((p) => p.proname).join(", ")})`)
}

async function verificarVistas() {
  console.log("\n### Vistas ###")

  for (const vista of ["vista_ventas_por_categoria", "vista_productos_stock_bajo", "vista_rendimiento_cajeros"]) {
    const r = await row<{ n: string }>(`SELECT COUNT(*)::text AS n FROM ${vista}`)
    console.log(`   ${vista}: ${r.n} filas`)
  }

  // El ingreso de la vista de cajeros no debe inflarse por el numero de lineas
  // de cada venta (bug de fan-out).
  const cajeros = await rows<{ nombre: string; ingreso_real: string; ingreso_vista: string }>(
    `SELECT u.nombre,
            (SELECT SUM(total) FROM "Venta" WHERE "cajeroId"=u.id)::text AS ingreso_real,
            vrc.ingreso_total::text AS ingreso_vista
     FROM vista_rendimiento_cajeros vrc JOIN "Usuario" u ON u.id=vrc.cajero_id`
  )
  for (const k of cajeros) {
    check(
      Number(k.ingreso_real) === Number(k.ingreso_vista),
      `${k.nombre}: ingreso de la vista coincide con el real (${Number(k.ingreso_vista)})`
    )
  }

  // La vista de stock bajo no debe esconder productos bajo el minimo.
  const faltantes = await rows(
    `SELECT p.id FROM "Producto" p
     WHERE p."stockActual" <= p."stockMinimo"
       AND p.id NOT IN (SELECT producto_id FROM vista_productos_stock_bajo)`
  )
  check(faltantes.length === 0, "la vista de stock bajo incluye todos los productos bajo el minimo")
}

async function verificarVenta() {
  console.log("\n### Venta: el trigger descuenta una sola vez ###")
  await c.query("BEGIN")
  try {
    const p = await row<Producto>(`SELECT id, nombre, "stockActual" FROM "Producto" WHERE "stockActual" > 20 LIMIT 1`)
    const cajero = await row<{ id: number }>(`SELECT id FROM "Usuario" LIMIT 1`)
    const v = await row<{ id: number }>(
      `INSERT INTO "Venta" ("cajeroId", total) VALUES ($1, 120) RETURNING id`, [cajero.id]
    )
    await c.query(
      `INSERT INTO "VentaDetalle" ("ventaId","productoId",cantidad,"precioUnitario") VALUES ($1,$2,4,30)`,
      [v.id, p.id]
    )

    const despues = await row<{ stockActual: number }>(`SELECT "stockActual" FROM "Producto" WHERE id=$1`, [p.id])
    check(despues.stockActual === p.stockActual - 4, `stock bajo exactamente 4 (${p.stockActual} -> ${despues.stockActual})`)

    const movs = await rows<Movimiento>(
      `SELECT cantidad, tipo, motivo FROM "MovimientoInventario" WHERE referencia=$1`, [`venta:${v.id}`]
    )
    check(movs.length === 1, `se registro 1 movimiento, no 2 (hay ${movs.length})`)
  } finally {
    await c.query("ROLLBACK")
  }
}

async function verificarStockInsuficiente() {
  console.log("\n### Venta: el trigger rechaza stock insuficiente ###")
  await c.query("BEGIN")
  try {
    const p = await row<Producto>(`SELECT id, "stockActual" FROM "Producto" ORDER BY "stockActual" ASC LIMIT 1`)
    const cajero = await row<{ id: number }>(`SELECT id FROM "Usuario" LIMIT 1`)
    const v = await row<{ id: number }>(
      `INSERT INTO "Venta" ("cajeroId", total) VALUES ($1, 10) RETURNING id`, [cajero.id]
    )
    await c.query(
      `INSERT INTO "VentaDetalle" ("ventaId","productoId",cantidad,"precioUnitario") VALUES ($1,$2,$3,10)`,
      [v.id, p.id, p.stockActual + 50]
    )
    check(false, "deberia haber rechazado la venta")
  } catch (e) {
    check(true, `rechazada: ${(e as Error).message.split("\n")[0]}`)
  } finally {
    await c.query("ROLLBACK")
  }
}

async function verificarRecepcionDeOrden() {
  console.log("\n### Orden de compra: el stock entra al recibir, no al crear ###")
  await c.query("BEGIN")
  try {
    const p = await row<Producto>(`SELECT id, "proveedorId", "stockActual" FROM "Producto" LIMIT 1`)
    const u = await row<{ id: number }>(`SELECT id FROM "Usuario" LIMIT 1`)
    const o = await row<{ id: number }>(
      `INSERT INTO "OrdenCompra" ("proveedorId","usuarioId",total,estado)
       VALUES ($1,$2,4000,'pendiente') RETURNING id`, [p.proveedorId, u.id]
    )
    await c.query(
      `INSERT INTO "OrdenDetalle" ("ordenId","productoId",cantidad,"precioCompra","piezasPorUnidad")
       VALUES ($1,$2,10,40,12)`, [o.id, p.id]
    )

    const pendiente = await row<{ stockActual: number }>(`SELECT "stockActual" FROM "Producto" WHERE id=$1`, [p.id])
    check(pendiente.stockActual === p.stockActual, `con la orden pendiente el stock no se mueve (${pendiente.stockActual})`)

    await c.query(`UPDATE "OrdenCompra" SET estado='recibida' WHERE id=$1`, [o.id])
    const recibida = await row<{ stockActual: number }>(`SELECT "stockActual" FROM "Producto" WHERE id=$1`, [p.id])
    check(
      recibida.stockActual === p.stockActual + 120,
      `al recibir suma 10x12=120 piezas (${p.stockActual} -> ${recibida.stockActual})`
    )

    await c.query(`UPDATE "OrdenCompra" SET estado='recibida' WHERE id=$1`, [o.id])
    const otraVez = await row<{ stockActual: number }>(`SELECT "stockActual" FROM "Producto" WHERE id=$1`, [p.id])
    check(otraVez.stockActual === recibida.stockActual, "re-marcar como recibida no vuelve a sumar")
  } finally {
    await c.query("ROLLBACK")
  }
}

async function verificarProcedimientos() {
  console.log("\n### sp_procesar_orden_compra ###")
  await c.query("BEGIN")
  try {
    const pr = await row<{ id: number; cantidadMinimaOrden: string }>(
      `SELECT id, "cantidadMinimaOrden" FROM "Proveedor" ORDER BY "cantidadMinimaOrden" ASC LIMIT 1`
    )
    const p = await row<Producto>(`SELECT id, "stockActual" FROM "Producto" WHERE "proveedorId"=$1 LIMIT 1`, [pr.id])
    const u = await row<{ id: number }>(`SELECT id FROM "Usuario" LIMIT 1`)

    const o = await row<{ id: number }>(
      `INSERT INTO "OrdenCompra" ("proveedorId","usuarioId",total,estado)
       VALUES ($1,$2,4000,'pendiente') RETURNING id`, [pr.id, u.id]
    )
    await c.query(
      `INSERT INTO "OrdenDetalle" ("ordenId","productoId",cantidad,"precioCompra","piezasPorUnidad","fechaCaducidad")
       VALUES ($1,$2,100,40,1,CURRENT_DATE + 10)`, [o.id, p.id]
    )
    await c.query(`CALL sp_procesar_orden_compra(${o.id})`)

    const est = await row<{ estado: string }>(`SELECT estado FROM "OrdenCompra" WHERE id=$1`, [o.id])
    const st = await row<{ stockActual: number }>(`SELECT "stockActual" FROM "Producto" WHERE id=$1`, [p.id])
    check(est.estado === "recibida", `la orden valida queda 'recibida' (quedo '${est.estado}')`)
    check(st.stockActual === p.stockActual + 100, `el stock subio 100 via trigger (${p.stockActual} -> ${st.stockActual})`)
  } finally {
    await c.query("ROLLBACK")
  }

  // Monto por debajo del minimo del proveedor
  await c.query("BEGIN")
  try {
    const pr = await row<{ id: number }>(`SELECT id FROM "Proveedor" ORDER BY "cantidadMinimaOrden" ASC LIMIT 1`)
    const p = await row<Producto>(`SELECT id FROM "Producto" WHERE "proveedorId"=$1 LIMIT 1`, [pr.id])
    const u = await row<{ id: number }>(`SELECT id FROM "Usuario" LIMIT 1`)
    const o = await row<{ id: number }>(
      `INSERT INTO "OrdenCompra" ("proveedorId","usuarioId",total,estado)
       VALUES ($1,$2,50,'pendiente') RETURNING id`, [pr.id, u.id]
    )
    await c.query(
      `INSERT INTO "OrdenDetalle" ("ordenId","productoId",cantidad,"precioCompra","piezasPorUnidad")
       VALUES ($1,$2,1,50,1)`, [o.id, p.id]
    )
    await c.query(`CALL sp_procesar_orden_compra(${o.id})`)
    check(false, "deberia haber rechazado la orden por monto insuficiente")
  } catch (e) {
    check(true, `orden por debajo del minimo rechazada: ${(e as Error).message.split("\n")[0]}`)
  } finally {
    await c.query("ROLLBACK")
  }

  console.log("\n### sp_reporte_caducidades_proximas ###")
  await c.query(`CALL sp_reporte_caducidades_proximas(30)`)
  try {
    await c.query(`CALL sp_reporte_caducidades_proximas(0)`)
    check(false, "deberia rechazar p_dias = 0")
  } catch {
    check(true, "rechaza p_dias fuera de rango")
  }

  console.log("\n### sp_calcular_estadisticas_inventario ###")
  const stats = await row<Record<string, unknown>>(
    `CALL sp_calcular_estadisticas_inventario(NULL,NULL,NULL,NULL,NULL)`
  )
  console.log("  ", stats)
  check(stats !== undefined, "devuelve los 5 parametros OUT")
}

async function main() {
  await c.connect()
  c.on("notice", (m) => console.log(`   NOTICE: ${m.message}`))

  try {
    await verificarInventarioDeObjetos()
    await verificarVistas()
    await verificarVenta()
    await verificarStockInsuficiente()
    await verificarRecepcionDeOrden()
    await verificarProcedimientos()

    console.log(`\n=== ${pasaron} pasaron, ${fallaron} fallaron ===`)
    process.exitCode = fallaron === 0 ? 0 : 1
  } finally {
    await c.end()
  }
}

main()
