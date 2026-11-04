-- ============================================================================
-- Limpieza de OrdenCompra.estado
--
-- 1. Ordenes que la version vieja del procedimiento dejo en 'parcial' sin
--    mover stock regresan a 'pendiente'.
-- 2. CHECK de estados validos.
-- 3. sp_procesar_orden_compra redondea los montos en sus mensajes.
-- ============================================================================

UPDATE "OrdenCompra" o
SET estado = 'pendiente'
WHERE o.estado = 'parcial'
  AND NOT EXISTS (
      SELECT 1 FROM "MovimientoInventario" m
      WHERE m.referencia = 'orden:' || o.id
  );

ALTER TABLE "OrdenCompra"
    ADD CONSTRAINT "OrdenCompra_estado_check"
    CHECK (estado IN ('pendiente', 'enviada', 'recibida', 'cancelada', 'parcial'));

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
            p_orden_id, ROUND(v_monto_total, 2), v_orden."nombreComercial",
            ROUND(v_orden."cantidadMinimaOrden", 2);
    END IF;

    IF v_errores = 0 THEN
        -- trg_recibir_orden_compra mueve el stock y registra los movimientos
        UPDATE "OrdenCompra" SET estado = 'recibida' WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % recibida: % lineas, monto total $%',
            p_orden_id, v_procesados, ROUND(v_monto_total, 2);
    ELSE
        UPDATE "OrdenCompra" SET estado = 'parcial' WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % parcial: % lineas OK, % con error',
            p_orden_id, v_procesados, v_errores;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'sp_procesar_orden_compra(%): %', p_orden_id, SQLERRM;
END;
$$;
