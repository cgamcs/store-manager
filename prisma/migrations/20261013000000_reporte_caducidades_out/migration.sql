-- ============================================================================
-- sp_reporte_caducidades_proximas con parametros OUT
--
-- La version anterior solo emitia RAISE NOTICE, que la aplicacion no puede
-- leer. Ahora el mismo recorrido con cursor devuelve el resumen y el detalle
-- clasificado como parametros OUT, de modo que CALL regresa una fila.
-- Cambiar los parametros OUT exige DROP + CREATE.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_reporte_caducidades_proximas(INTEGER);

CREATE PROCEDURE sp_reporte_caducidades_proximas(
    p_dias              INTEGER,
    OUT p_total_alertas INTEGER,
    OUT p_ya_caducados  INTEGER,
    OUT p_unidades      INTEGER,
    OUT p_detalle       JSONB
)
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha_limite DATE;
    v_caducidad    RECORD;
    v_nivel        TEXT;
    v_cursor       REFCURSOR;
BEGIN
    p_total_alertas := 0;
    p_ya_caducados  := 0;
    p_unidades      := 0;
    p_detalle       := '[]'::JSONB;

    IF p_dias IS NULL OR p_dias <= 0 OR p_dias > 365 THEN
        RAISE EXCEPTION 'Parametro p_dias debe estar entre 1 y 365, recibido: %', p_dias;
    END IF;

    v_fecha_limite := CURRENT_DATE + p_dias;

    OPEN v_cursor FOR
        SELECT fc.id, fc."fechaCaducidad"::DATE AS fecha, fc.cantidad,
               p.nombre AS producto_nombre, p."stockActual",
               pr."nombreComercial" AS proveedor_nombre
        FROM "FechaCaducidad" fc
        INNER JOIN "Producto" p ON p.id = fc."productoId"
        INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
        WHERE fc."fechaCaducidad"::DATE <= v_fecha_limite
        ORDER BY fc."fechaCaducidad" ASC;

    LOOP
        FETCH v_cursor INTO v_caducidad;
        EXIT WHEN NOT FOUND;

        BEGIN
            -- Estructura de decision: clasificar urgencia del lote
            IF v_caducidad.fecha < CURRENT_DATE THEN
                v_nivel := 'caducado';
                p_ya_caducados := p_ya_caducados + 1;
            ELSIF v_caducidad.fecha <= CURRENT_DATE + 7 THEN
                v_nivel := 'urgente';
            ELSIF v_caducidad.fecha <= CURRENT_DATE + 15 THEN
                v_nivel := 'proximo';
            ELSE
                v_nivel := 'vigilancia';
            END IF;

            p_total_alertas := p_total_alertas + 1;
            p_unidades      := p_unidades + v_caducidad.cantidad;
            p_detalle       := p_detalle || jsonb_build_array(jsonb_build_object(
                'loteId',     v_caducidad.id,
                'producto',   v_caducidad.producto_nombre,
                'proveedor',  v_caducidad.proveedor_nombre,
                'fecha',      v_caducidad.fecha,
                'cantidad',   v_caducidad.cantidad,
                'stock',      v_caducidad."stockActual",
                'nivel',      v_nivel,
                'sugerirDescuento', v_caducidad."stockActual" > v_caducidad.cantidad
            ));

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error procesando caducidad %: %', v_caducidad.id, SQLERRM;
        END;
    END LOOP;

    CLOSE v_cursor;
    v_cursor := NULL;

EXCEPTION WHEN OTHERS THEN
    IF v_cursor IS NOT NULL THEN
        CLOSE v_cursor;
    END IF;
    RAISE EXCEPTION 'sp_reporte_caducidades_proximas(%): %', p_dias, SQLERRM;
END;
$$;

COMMENT ON PROCEDURE sp_reporte_caducidades_proximas(INTEGER) IS
'Reporte de caducidades con REFCURSOR explicito, loop, IF/ELSIF de urgencia y manejo de excepciones; devuelve resumen y detalle como OUT';
