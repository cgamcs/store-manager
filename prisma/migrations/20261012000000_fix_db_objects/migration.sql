-- ============================================================================
-- FIX: corrige los objetos creados en 20261011000000_db_objects
--
-- Problemas corregidos:
--   1. vista_rendimiento_cajeros inflaba SUM/AVG(Venta.total) por fan-out del
--      JOIN a VentaDetalle (una venta se repetia una vez por linea de detalle).
--   2. vista_productos_stock_bajo ocultaba productos con stock bajo que nunca
--      habian sido ordenados, y contaba ordenes de cualquier fecha como
--      "ultimo mes".
--   3. trg_incrementar_stock_compra sumaba stock al INSERTAR el detalle (con la
--      orden todavia 'pendiente') e ignoraba piezasPorUnidad. Se reemplaza por
--      un trigger sobre OrdenCompra que dispara cuando estado pasa a 'recibida'.
--   4. sp_procesar_orden_compra comparaba cantidad de piezas contra
--      Proveedor.cantidadMinimaOrden, que es un MONTO, por lo que toda orden
--      fallaba. Ahora valida el monto total y delega el stock al trigger.
--   5. sp_reporte_caducidades_proximas ignoraba los lotes ya caducados y podia
--      fallar al cerrar un cursor inexistente.
--
-- El movimiento de stock es responsabilidad EXCLUSIVA de los triggers.
-- El codigo TypeScript ya no lo duplica.
-- ============================================================================

-- ============================================================================
-- 1. VISTAS CORREGIDAS
-- ============================================================================

-- Vista 2 (corregida): el filtro de stock vive en HAVING y ya no excluye
-- productos sin ordenes; el conteo de ordenes si respeta la ventana de 30 dias.
DROP VIEW IF EXISTS vista_productos_stock_bajo;
CREATE VIEW vista_productos_stock_bajo AS
SELECT
    p.id AS producto_id,
    p.nombre AS producto_nombre,
    p.sku,
    p."stockActual",
    p."stockMinimo",
    (p."stockMinimo" - p."stockActual") AS deficit_stock,
    p."precioCompra",
    p."precioVenta",
    pr.id AS proveedor_id,
    pr."nombreComercial" AS proveedor_nombre,
    pr.contacto AS proveedor_contacto,
    pr.correo AS proveedor_correo,
    pr."tiempoEntregaDias" AS dias_entrega,
    c.nombre AS categoria_nombre,
    COUNT(od.id) AS veces_ordenado_ultimo_mes,
    COALESCE(SUM(od.cantidad * od."piezasPorUnidad"), 0) AS cantidad_total_ordenada
FROM "Producto" p
INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
INNER JOIN "Categoria" c ON c.id = p."categoriaId"
LEFT JOIN "OrdenCompra" o
    ON o."proveedorId" = pr.id
    AND o."fechaOrden" >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN "OrdenDetalle" od
    ON od."ordenId" = o.id
    AND od."productoId" = p.id
GROUP BY p.id, p.nombre, p.sku, p."stockActual", p."stockMinimo",
         p."precioCompra", p."precioVenta", pr.id, pr."nombreComercial",
         pr.contacto, pr.correo, pr."tiempoEntregaDias", c.nombre
HAVING MIN(p."stockActual") <= MIN(p."stockMinimo")
ORDER BY deficit_stock DESC, p."stockActual" ASC;

-- Vista 3 (corregida): VentaDetalle se agrega en una subconsulta para que cada
-- venta cuente una sola vez en SUM/AVG/MIN/MAX de Venta.total.
DROP VIEW IF EXISTS vista_rendimiento_cajeros;
CREATE VIEW vista_rendimiento_cajeros AS
SELECT
    u.id AS cajero_id,
    u.nombre AS cajero_nombre,
    u.correo AS cajero_correo,
    pc.turno,
    COUNT(v.id) AS total_ventas,
    COALESCE(SUM(d.items), 0) AS total_items_vendidos,
    COALESCE(SUM(v.total), 0) AS ingreso_total,
    AVG(v.total) AS ticket_promedio,
    MIN(v.total) AS venta_minima,
    MAX(v.total) AS venta_maxima,
    COALESCE(SUM(d.unidades), 0) AS unidades_totales,
    COUNT(DISTINCT DATE(v."fechaHora")) AS dias_con_ventas,
    ROUND(
        COUNT(v.id)::numeric / NULLIF(COUNT(DISTINCT DATE(v."fechaHora")), 0),
        2
    ) AS ventas_por_dia_promedio,
    RANK() OVER (ORDER BY COALESCE(SUM(v.total), 0) DESC) AS ranking_ingresos
FROM "Usuario" u
INNER JOIN "Rol" r ON r.id = u."rolId"
LEFT JOIN "PerfilCajero" pc ON pc."usuarioId" = u.id
LEFT JOIN "Venta" v ON v."cajeroId" = u.id
LEFT JOIN (
    SELECT "ventaId", COUNT(*) AS items, SUM(cantidad) AS unidades
    FROM "VentaDetalle"
    GROUP BY "ventaId"
) d ON d."ventaId" = v.id
WHERE r.nombre = 'cajero'
GROUP BY u.id, u.nombre, u.correo, pc.turno
HAVING COUNT(v.id) > 0
ORDER BY ingreso_total DESC, total_ventas DESC;

-- ============================================================================
-- 2. TRIGGER DE COMPRA REUBICADO
-- ============================================================================

-- El stock ya no se mueve al crear el detalle de la orden.
DROP TRIGGER IF EXISTS trg_incrementar_stock_compra ON "OrdenDetalle";
DROP FUNCTION IF EXISTS fn_incrementar_stock_compra();

-- Entra mercancia cuando la orden se marca como recibida: suma piezas reales
-- (cantidad * piezasPorUnidad), registra el movimiento y crea el lote de
-- caducidad si el detalle lo trae.
--
-- El movimiento se atribuye a OrdenCompra.usuarioId, es decir a quien creo la
-- orden. Si mas adelante hace falta registrar a quien la recibio, hay que
-- pasar el usuario de la sesion con set_config('app.usuario_id', ..., true)
-- dentro de la transaccion y leerlo aqui con current_setting.
CREATE OR REPLACE FUNCTION fn_recibir_orden_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_detalle RECORD;
    v_piezas  INTEGER;
BEGIN
    FOR v_detalle IN
        SELECT * FROM "OrdenDetalle" WHERE "ordenId" = NEW.id
    LOOP
        v_piezas := v_detalle.cantidad * v_detalle."piezasPorUnidad";

        UPDATE "Producto"
        SET "stockActual" = "stockActual" + v_piezas
        WHERE id = v_detalle."productoId";

        INSERT INTO "MovimientoInventario"
            ("productoId", cantidad, tipo, motivo, "usuarioId", referencia)
        VALUES (
            v_detalle."productoId",
            v_piezas,
            'compra',
            'Recepcion de orden de compra',
            NEW."usuarioId",
            'orden:' || NEW.id
        );

        IF v_detalle."fechaCaducidad" IS NOT NULL THEN
            INSERT INTO "FechaCaducidad" ("productoId", "fechaCaducidad", cantidad)
            VALUES (v_detalle."productoId", v_detalle."fechaCaducidad", v_piezas);
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recibir_orden_compra ON "OrdenCompra";
CREATE TRIGGER trg_recibir_orden_compra
AFTER UPDATE ON "OrdenCompra"
FOR EACH ROW
WHEN (OLD.estado <> 'recibida' AND NEW.estado = 'recibida')
EXECUTE FUNCTION fn_recibir_orden_compra();

-- ============================================================================
-- 3. PROCEDIMIENTOS CORREGIDOS
-- ============================================================================

-- Procedimiento 1 (corregido): valida la orden con cursor + loop + IF +
-- manejo de excepciones, y deja el movimiento de stock al trigger de recepcion.
CREATE OR REPLACE PROCEDURE sp_procesar_orden_compra(p_orden_id INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_orden       RECORD;
    v_detalle     RECORD;
    v_monto_linea NUMERIC;
    v_monto_total NUMERIC := 0;
    v_procesados  INTEGER := 0;
    v_errores     INTEGER := 0;
BEGIN
    SELECT o.id, o.estado, pr."cantidadMinimaOrden", pr."nombreComercial"
    INTO v_orden
    FROM "OrdenCompra" o
    INNER JOIN "Proveedor" pr ON pr.id = o."proveedorId"
    WHERE o.id = p_orden_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de compra % no encontrada', p_orden_id;
    END IF;

    IF v_orden.estado = 'recibida' THEN
        RAISE EXCEPTION 'Orden % ya fue recibida', p_orden_id;
    END IF;

    -- Cursor implicito sobre los detalles de la orden
    FOR v_detalle IN
        SELECT od.*, p.nombre AS producto_nombre
        FROM "OrdenDetalle" od
        INNER JOIN "Producto" p ON p.id = od."productoId"
        WHERE od."ordenId" = p_orden_id
    LOOP
        BEGIN
            -- Estructura de decision: rechazar lineas invalidas
            IF v_detalle.cantidad <= 0 THEN
                RAISE EXCEPTION 'Cantidad invalida (%) en el producto %',
                    v_detalle.cantidad, v_detalle.producto_nombre;
            END IF;

            IF v_detalle."piezasPorUnidad" <= 0 THEN
                RAISE EXCEPTION 'piezasPorUnidad invalida (%) en el producto %',
                    v_detalle."piezasPorUnidad", v_detalle.producto_nombre;
            END IF;

            v_monto_linea := v_detalle.cantidad
                           * v_detalle."piezasPorUnidad"
                           * v_detalle."precioCompra";

            v_monto_total := v_monto_total + v_monto_linea;
            v_procesados  := v_procesados + 1;

        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores + 1;
            RAISE NOTICE 'Error validando detalle %: %', v_detalle.id, SQLERRM;
        END;
    END LOOP;

    IF v_procesados = 0 THEN
        RAISE EXCEPTION 'La orden % no tiene detalles validos', p_orden_id;
    END IF;

    -- cantidadMinimaOrden es un MONTO en pesos, no una cantidad de piezas
    IF v_monto_total < v_orden."cantidadMinimaOrden" THEN
        RAISE EXCEPTION
            'Monto de la orden % ($%) menor al minimo de % ($%)',
            p_orden_id, v_monto_total, v_orden."nombreComercial",
            v_orden."cantidadMinimaOrden";
    END IF;

    IF v_errores = 0 THEN
        -- trg_recibir_orden_compra mueve el stock y registra los movimientos
        UPDATE "OrdenCompra" SET estado = 'recibida' WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % recibida: % lineas, monto total $%',
            p_orden_id, v_procesados, v_monto_total;
    ELSE
        UPDATE "OrdenCompra" SET estado = 'parcial' WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % parcial: % lineas OK, % con error',
            p_orden_id, v_procesados, v_errores;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'sp_procesar_orden_compra(%): %', p_orden_id, SQLERRM;
END;
$$;

-- Procedimiento 2 (corregido): el cursor ahora incluye los lotes ya caducados
-- y el cursor se cierra una sola vez.
CREATE OR REPLACE PROCEDURE sp_reporte_caducidades_proximas(p_dias INTEGER DEFAULT 30)
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha_limite    DATE := CURRENT_DATE + p_dias;
    v_caducidad       RECORD;
    v_total_alertas   INTEGER := 0;
    v_total_unidades  INTEGER := 0;
    v_ya_caducados    INTEGER := 0;
    v_cursor          REFCURSOR;
BEGIN
    IF p_dias <= 0 OR p_dias > 365 THEN
        RAISE EXCEPTION 'Parametro p_dias debe estar entre 1 y 365, recibido: %', p_dias;
    END IF;

    OPEN v_cursor FOR
        SELECT fc.id, fc."fechaCaducidad", fc.cantidad,
               p.nombre AS producto_nombre, p."stockActual",
               pr."nombreComercial" AS proveedor_nombre, pr.contacto, pr.correo
        FROM "FechaCaducidad" fc
        INNER JOIN "Producto" p ON p.id = fc."productoId"
        INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
        WHERE fc."fechaCaducidad"::DATE <= v_fecha_limite
        ORDER BY fc."fechaCaducidad" ASC;

    LOOP
        FETCH v_cursor INTO v_caducidad;
        EXIT WHEN NOT FOUND;

        BEGIN
            v_total_alertas  := v_total_alertas + 1;
            v_total_unidades := v_total_unidades + v_caducidad.cantidad;

            -- Estructura de decision: clasificar urgencia
            IF v_caducidad."fechaCaducidad"::DATE < CURRENT_DATE THEN
                v_ya_caducados := v_ya_caducados + 1;
                RAISE NOTICE 'YA CADUCADO: % - % unidades vencieron el %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad,
                    v_caducidad."fechaCaducidad"::DATE;
            ELSIF v_caducidad."fechaCaducidad"::DATE <= CURRENT_DATE + 7 THEN
                RAISE NOTICE 'URGENTE (7 dias): % - % unidades caducan el %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad,
                    v_caducidad."fechaCaducidad"::DATE;
            ELSIF v_caducidad."fechaCaducidad"::DATE <= CURRENT_DATE + 15 THEN
                RAISE NOTICE 'PROXIMO (15 dias): % - % unidades caducan el %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad,
                    v_caducidad."fechaCaducidad"::DATE;
            ELSE
                RAISE NOTICE 'VIGILANCIA: % - % unidades caducan el %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad,
                    v_caducidad."fechaCaducidad"::DATE;
            END IF;

            IF v_caducidad."stockActual" > v_caducidad.cantidad THEN
                RAISE NOTICE '  -> Sugerencia: aplicar descuento a % (stock: %, por caducar: %)',
                    v_caducidad.producto_nombre, v_caducidad."stockActual",
                    v_caducidad.cantidad;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error procesando caducidad %: %', v_caducidad.id, SQLERRM;
        END;
    END LOOP;

    CLOSE v_cursor;
    v_cursor := NULL;

    RAISE NOTICE '=== RESUMEN CADUCIDADES (ventana de % dias) ===', p_dias;
    RAISE NOTICE 'Total alertas: %', v_total_alertas;
    RAISE NOTICE 'Lotes ya caducados: %', v_ya_caducados;
    RAISE NOTICE 'Total unidades en riesgo: %', v_total_unidades;

EXCEPTION WHEN OTHERS THEN
    IF v_cursor IS NOT NULL THEN
        CLOSE v_cursor;
    END IF;
    RAISE EXCEPTION 'sp_reporte_caducidades_proximas(%): %', p_dias, SQLERRM;
END;
$$;

-- ============================================================================
-- 4. COMENTARIOS
-- ============================================================================

COMMENT ON VIEW vista_productos_stock_bajo IS
'Vista con JOIN 4 tablas, COUNT + SUM, GROUP BY, HAVING sobre stock, ORDER BY deficit DESC';

COMMENT ON VIEW vista_rendimiento_cajeros IS
'Vista con JOIN 4 tablas + subconsulta agregada, COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING, RANK, ORDER BY';

COMMENT ON TRIGGER trg_recibir_orden_compra ON "OrdenCompra" IS
'AFTER UPDATE: al pasar estado a recibida suma piezas al stock, registra movimiento y crea el lote de caducidad';

COMMENT ON PROCEDURE sp_procesar_orden_compra(INTEGER) IS
'Valida la orden con cursor, loop, IF y manejo de excepciones; delega el stock a trg_recibir_orden_compra';

COMMENT ON PROCEDURE sp_reporte_caducidades_proximas(INTEGER) IS
'Reporte de caducidades con REFCURSOR explicito, loop, IF/ELSIF de urgencia y manejo de excepciones';
