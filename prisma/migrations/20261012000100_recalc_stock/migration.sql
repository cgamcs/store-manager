-- ============================================================================
-- RECALCULO DE STOCK
--
-- Repara el inventario que quedo mal mientras los triggers de
-- 20261011000000_db_objects convivian con la misma logica en TypeScript.
--
-- Las tres reglas son basadas en conjuntos e idempotentes: en una base limpia
-- no encuentran filas y no hacen nada.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Regla 1: movimientos duplicados (el trigger y el codigo TS registraron el
-- mismo hecho). Los movimientos del trigger traen motivo; los del codigo TS lo
-- traian en NULL. Se borra el del codigo TS y se revierte su efecto en stock.
--
-- Los movimientos NULL sin gemelo son anteriores a los triggers y sobreviven.
-- ----------------------------------------------------------------------------
WITH duplicados AS (
    DELETE FROM "MovimientoInventario" m
    WHERE m.motivo IS NULL
      AND m.referencia IS NOT NULL
      AND EXISTS (
          SELECT 1
          FROM "MovimientoInventario" t
          WHERE t."productoId" = m."productoId"
            AND t.referencia   = m.referencia
            AND t.tipo         = m.tipo
            AND t.cantidad     = m.cantidad
            AND t.id          <> m.id
            AND t.motivo IN (
                'Venta automática',
                'Ajuste por modificación de venta',
                'Restauración por eliminación de detalle de venta',
                'Compra automática por orden de compra'
            )
      )
    RETURNING m."productoId", m.cantidad
), ajuste AS (
    SELECT "productoId", SUM(cantidad) AS delta
    FROM duplicados
    GROUP BY "productoId"
)
UPDATE "Producto" p
SET "stockActual" = p."stockActual" - a.delta
FROM ajuste a
WHERE p.id = a."productoId";

-- ----------------------------------------------------------------------------
-- Regla 2: stock fantasma de ordenes nunca recibidas. El trigger viejo sumaba
-- al INSERTAR el detalle, con la orden todavia pendiente.
-- ----------------------------------------------------------------------------
WITH fantasma AS (
    DELETE FROM "MovimientoInventario" m
    WHERE m.motivo = 'Compra automática por orden de compra'
      AND m.referencia ~ '^orden:[0-9]+$'
      AND EXISTS (
          SELECT 1
          FROM "OrdenCompra" o
          WHERE o.id = split_part(m.referencia, ':', 2)::INTEGER
            AND o.estado <> 'recibida'
      )
    RETURNING m."productoId", m.cantidad
), ajuste AS (
    SELECT "productoId", SUM(cantidad) AS delta
    FROM fantasma
    GROUP BY "productoId"
)
UPDATE "Producto" p
SET "stockActual" = p."stockActual" - a.delta
FROM ajuste a
WHERE p.id = a."productoId";

-- ----------------------------------------------------------------------------
-- Regla 3: movimientos huerfanos que apuntan a ventas ya borradas (residuo de
-- los scripts de prueba). Su efecto neto en stock se revierte.
-- ----------------------------------------------------------------------------
WITH huerfanos AS (
    DELETE FROM "MovimientoInventario" m
    WHERE m.referencia ~ '^venta(_update|_delete)?:[0-9]+$'
      AND NOT EXISTS (
          SELECT 1
          FROM "Venta" v
          WHERE v.id = split_part(m.referencia, ':', 2)::INTEGER
      )
    RETURNING m."productoId", m.cantidad
), ajuste AS (
    SELECT "productoId", SUM(cantidad) AS delta
    FROM huerfanos
    GROUP BY "productoId"
)
UPDATE "Producto" p
SET "stockActual" = p."stockActual" - a.delta
FROM ajuste a
WHERE p.id = a."productoId";
