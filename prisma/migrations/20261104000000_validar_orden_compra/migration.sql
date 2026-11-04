-- ============================================================================
-- sp_procesar_orden_compra -> sp_validar_orden_compra
--
-- El monto minimo del proveedor es una condicion para HACER el pedido, no
-- para recibirlo: si la mercancia ya llego, el proveedor acepto el monto.
-- La validacion pasa al momento de crear la orden; la recepcion solo cambia
-- el estado y trg_recibir_orden_compra mueve el stock.
--
-- Sin el estado 'parcial': una orden invalida ya no se guarda.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_procesar_orden_compra(INTEGER);

UPDATE "OrdenCompra" SET estado = 'pendiente' WHERE estado = 'parcial';

ALTER TABLE "OrdenCompra" DROP CONSTRAINT "OrdenCompra_estado_check";
ALTER TABLE "OrdenCompra"
    ADD CONSTRAINT "OrdenCompra_estado_check"
    CHECK (estado IN ('pendiente', 'enviada', 'recibida', 'cancelada'));

CREATE PROCEDURE sp_validar_orden_compra(p_orden_id INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_orden       RECORD;
    v_detalle     RECORD;
    v_monto_total NUMERIC := 0;
    v_procesados  INTEGER := 0;
    v_errores     INTEGER := 0;
BEGIN
    SELECT o.id, pr."cantidadMinimaOrden", pr."nombreComercial"
    INTO v_orden
    FROM "OrdenCompra" o
    INNER JOIN "Proveedor" pr ON pr.id = o."proveedorId"
    WHERE o.id = p_orden_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de compra % no encontrada', p_orden_id;
    END IF;

    -- Cursor implicito sobre los detalles de la orden
    FOR v_detalle IN
        SELECT od.*, p.nombre AS producto_nombre
        FROM "OrdenDetalle" od
        INNER JOIN "Producto" p ON p.id = od."productoId"
        WHERE od."ordenId" = p_orden_id
    LOOP
        BEGIN
            -- Estructura de decision: rechazar lineas invalidas. La app ya las
            -- filtra con Zod; esto protege a la base de inserciones directas.
            IF v_detalle.cantidad <= 0 THEN
                RAISE EXCEPTION 'Cantidad inválida (%) en %',
                    v_detalle.cantidad, v_detalle.producto_nombre;
            END IF;

            IF v_detalle."piezasPorUnidad" <= 0 THEN
                RAISE EXCEPTION 'Piezas por unidad inválidas (%) en %',
                    v_detalle."piezasPorUnidad", v_detalle.producto_nombre;
            END IF;

            v_monto_total := v_monto_total
                           + v_detalle.cantidad
                           * v_detalle."piezasPorUnidad"
                           * v_detalle."precioCompra";
            v_procesados  := v_procesados + 1;

        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores + 1;
            RAISE NOTICE 'Detalle % rechazado: %', v_detalle.id, SQLERRM;
        END;
    END LOOP;

    IF v_procesados = 0 THEN
        RAISE EXCEPTION 'La orden no tiene productos válidos';
    END IF;

    IF v_errores > 0 THEN
        RAISE EXCEPTION 'La orden tiene % producto(s) con cantidades inválidas', v_errores;
    END IF;

    -- cantidadMinimaOrden es un MONTO en pesos, no una cantidad de piezas
    IF v_monto_total < v_orden."cantidadMinimaOrden" THEN
        RAISE EXCEPTION
            'El monto de la orden ($%) es menor al mínimo de % ($%)',
            ROUND(v_monto_total, 2), v_orden."nombreComercial",
            ROUND(v_orden."cantidadMinimaOrden", 2);
    END IF;
END;
$$;

COMMENT ON PROCEDURE sp_validar_orden_compra(INTEGER) IS
'Valida una orden al crearla: cursor sobre los detalles, IF de lineas invalidas con manejo de excepciones por linea y monto minimo del proveedor';
