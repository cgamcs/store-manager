-- ============================================================================
-- MIGRACIÓN: Objetos de base de datos (Vistas, Triggers, Procedimientos)
-- Cumple requisitos académicos: 3 vistas, 3 triggers, 3 procedimientos
-- ============================================================================

-- ============================================================================
-- 1. VISTAS (3 vistas con JOIN, agregación, GROUP BY, HAVING, ORDER BY)
-- ============================================================================

-- Vista 1: Ventas por categoría con agregaciones y filtrado HAVING
CREATE OR REPLACE VIEW vista_ventas_por_categoria AS
SELECT
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    c."porcentajeGanancia" AS margen_ganancia,
    COUNT(DISTINCT v.id) AS total_ventas,
    COUNT(vd.id) AS total_items_vendidos,
    SUM(vd.cantidad) AS cantidad_total_unidades,
    SUM(vd.cantidad * vd."precioUnitario") AS ingreso_bruto_total,
    AVG(vd."precioUnitario") AS precio_promedio_unitario,
    MIN(vd."precioUnitario") AS precio_minimo,
    MAX(vd."precioUnitario") AS precio_maximo,
    SUM(vd.cantidad * vd."precioUnitario") * (c."porcentajeGanancia" / 100) AS ganancia_estimada
FROM "Categoria" c
INNER JOIN "Producto" p ON p."categoriaId" = c.id
INNER JOIN "VentaDetalle" vd ON vd."productoId" = p.id
INNER JOIN "Venta" v ON v.id = vd."ventaId"
GROUP BY c.id, c.nombre, c."porcentajeGanancia"
HAVING SUM(vd.cantidad * vd."precioUnitario") > 100
ORDER BY ingreso_bruto_total DESC, total_ventas DESC;

-- Vista 2: Productos con stock bajo y proveedores (JOIN 3 tablas + agregación)
CREATE OR REPLACE VIEW vista_productos_stock_bajo AS
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
    COALESCE(SUM(od.cantidad), 0) AS cantidad_total_ordenada
FROM "Producto" p
INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
INNER JOIN "Categoria" c ON c.id = p."categoriaId"
LEFT JOIN "OrdenDetalle" od ON od."productoId" = p.id
LEFT JOIN "OrdenCompra" o ON o.id = od."ordenId"
    AND o."fechaOrden" >= CURRENT_DATE - INTERVAL '30 days'
WHERE p."stockActual" <= p."stockMinimo"
GROUP BY p.id, p.nombre, p.sku, p."stockActual", p."stockMinimo",
         p."precioCompra", p."precioVenta", pr.id, pr."nombreComercial",
         pr.contacto, pr.correo, pr."tiempoEntregaDias", c.nombre
HAVING COUNT(od.id) > 0 OR p."stockActual" = 0
ORDER BY deficit_stock DESC, p."stockActual" ASC;

-- Vista 3: Rendimiento de cajeros con métricas completas
CREATE OR REPLACE VIEW vista_rendimiento_cajeros AS
SELECT
    u.id AS cajero_id,
    u.nombre AS cajero_nombre,
    u.correo AS cajero_correo,
    pc.turno,
    COUNT(DISTINCT v.id) AS total_ventas,
    COUNT(vd.id) AS total_items_vendidos,
    SUM(v.total) AS ingreso_total,
    AVG(v.total) AS ticket_promedio,
    MIN(v.total) AS venta_minima,
    MAX(v.total) AS venta_maxima,
    SUM(vd.cantidad) AS unidades_totales,
    COUNT(DISTINCT DATE(v."fechaHora")) AS dias_con_ventas,
    CASE
        WHEN COUNT(DISTINCT DATE(v."fechaHora")) > 0
        THEN ROUND(COUNT(DISTINCT v.id)::numeric / COUNT(DISTINCT DATE(v."fechaHora")), 2)
        ELSE 0
    END AS ventas_por_dia_promedio,
    RANK() OVER (ORDER BY SUM(v.total) DESC) AS ranking_ingresos
FROM "Usuario" u
INNER JOIN "Rol" r ON r.id = u."rolId"
LEFT JOIN "PerfilCajero" pc ON pc."usuarioId" = u.id
LEFT JOIN "Venta" v ON v."cajeroId" = u.id
LEFT JOIN "VentaDetalle" vd ON vd."ventaId" = v.id
WHERE r.nombre = 'cajero'
GROUP BY u.id, u.nombre, u.correo, pc.turno
HAVING COUNT(DISTINCT v.id) > 0
ORDER BY ingreso_total DESC, total_ventas DESC;

-- ============================================================================
-- 2. TRIGGERS (3 triggers: INSERT, UPDATE, DELETE con BEFORE/AFTER)
-- ============================================================================

-- Función auxiliar para trigger de validación de stock
CREATE OR REPLACE FUNCTION fn_validar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
    -- BEFORE INSERT en VentaDetalle: validar stock disponible
    IF TG_OP = 'INSERT' THEN
        IF EXISTS (
            SELECT 1 FROM "Producto"
            WHERE id = NEW."productoId"
            AND "stockActual" < NEW.cantidad
        ) THEN
            RAISE EXCEPTION 'Stock insuficiente para producto %: disponible %, solicitado %',
                NEW."productoId",
                (SELECT "stockActual" FROM "Producto" WHERE id = NEW."productoId"),
                NEW.cantidad;
        END IF;
    END IF;

    -- BEFORE UPDATE en VentaDetalle: validar cambio de cantidad
    IF TG_OP = 'UPDATE' THEN
        IF NEW.cantidad != OLD.cantidad THEN
            IF EXISTS (
                SELECT 1 FROM "Producto"
                WHERE id = NEW."productoId"
                AND "stockActual" + OLD.cantidad < NEW.cantidad
            ) THEN
                RAISE EXCEPTION 'Stock insuficiente para actualizar cantidad: disponible %',
                    (SELECT "stockActual" + OLD.cantidad FROM "Producto" WHERE id = NEW."productoId");
            END IF;
        END IF;
    END IF;

    -- BEFORE DELETE en VentaDetalle: restaurar stock (se maneja en AFTER DELETE trigger separado)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 1: BEFORE INSERT/UPDATE en VentaDetalle - Validar stock
CREATE TRIGGER trg_validar_stock_venta_detalle
BEFORE INSERT OR UPDATE ON "VentaDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_validar_stock_venta();

-- Función para trigger AFTER INSERT en VentaDetalle - Descontar stock
CREATE OR REPLACE FUNCTION fn_descontar_stock_venta()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Producto"
    SET "stockActual" = "stockActual" - NEW.cantidad
    WHERE id = NEW."productoId";

    -- Registrar movimiento de inventario
    INSERT INTO "MovimientoInventario" ("productoId", cantidad, tipo, motivo, "usuarioId", referencia)
    VALUES (
        NEW."productoId",
        -NEW.cantidad,
        'venta',
        'Venta automática',
        (SELECT "cajeroId" FROM "Venta" WHERE id = NEW."ventaId"),
        'venta:' || NEW."ventaId"
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 2: AFTER INSERT en VentaDetalle - Descontar stock y registrar movimiento
CREATE TRIGGER trg_descontar_stock_venta
AFTER INSERT ON "VentaDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_descontar_stock_venta();

-- Función para trigger AFTER UPDATE en VentaDetalle - Ajustar stock por diferencia
CREATE OR REPLACE FUNCTION fn_ajustar_stock_venta_update()
RETURNS TRIGGER AS $$
DECLARE
    diff INTEGER;
BEGIN
    diff := NEW.cantidad - OLD.cantidad;

    IF diff != 0 THEN
        UPDATE "Producto"
        SET "stockActual" = "stockActual" - diff
        WHERE id = NEW."productoId";

        INSERT INTO "MovimientoInventario" ("productoId", cantidad, tipo, motivo, "usuarioId", referencia)
        VALUES (
            NEW."productoId",
            -diff,
            'ajuste',
            'Ajuste por modificación de venta',
            (SELECT "cajeroId" FROM "Venta" WHERE id = NEW."ventaId"),
            'venta_update:' || NEW."ventaId"
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 3: AFTER UPDATE en VentaDetalle - Ajustar stock
CREATE TRIGGER trg_ajustar_stock_venta_update
AFTER UPDATE ON "VentaDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_ajustar_stock_venta_update();

-- Función para trigger AFTER DELETE en VentaDetalle - Restaurar stock
CREATE OR REPLACE FUNCTION fn_restaurar_stock_venta_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Producto"
    SET "stockActual" = "stockActual" + OLD.cantidad
    WHERE id = OLD."productoId";

    INSERT INTO "MovimientoInventario" ("productoId", cantidad, tipo, motivo, "usuarioId", referencia)
    VALUES (
        OLD."productoId",
        OLD.cantidad,
        'ajuste',
        'Restauración por eliminación de detalle de venta',
        (SELECT "cajeroId" FROM "Venta" WHERE id = OLD."ventaId"),
        'venta_delete:' || OLD."ventaId"
    );

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger 4: AFTER DELETE en VentaDetalle - Restaurar stock
CREATE TRIGGER trg_restaurar_stock_venta_delete
AFTER DELETE ON "VentaDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_restaurar_stock_venta_delete();

-- Función para trigger BEFORE INSERT en OrdenDetalle - Validar proveedor activo
CREATE OR REPLACE FUNCTION fn_validar_proveedor_orden()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "Proveedor"
        WHERE id = (SELECT "proveedorId" FROM "OrdenCompra" WHERE id = NEW."ordenId")
    ) THEN
        RAISE EXCEPTION 'Proveedor no encontrado para la orden %', NEW."ordenId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 5: BEFORE INSERT en OrdenDetalle - Validar proveedor
CREATE TRIGGER trg_validar_proveedor_orden_detalle
BEFORE INSERT ON "OrdenDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_validar_proveedor_orden();

-- Función para trigger AFTER INSERT en OrdenDetalle - Incrementar stock y registrar
CREATE OR REPLACE FUNCTION fn_incrementar_stock_compra()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Producto"
    SET "stockActual" = "stockActual" + NEW.cantidad
    WHERE id = NEW."productoId";

    INSERT INTO "MovimientoInventario" ("productoId", cantidad, tipo, motivo, referencia)
    VALUES (
        NEW."productoId",
        NEW.cantidad,
        'compra',
        'Compra automática por orden de compra',
        'orden:' || NEW."ordenId"
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger 6: AFTER INSERT en OrdenDetalle - Incrementar stock
CREATE TRIGGER trg_incrementar_stock_compra
AFTER INSERT ON "OrdenDetalle"
FOR EACH ROW EXECUTE FUNCTION fn_incrementar_stock_compra();

-- ============================================================================
-- 3. PROCEDIMIENTOS ALMACENADOS (3 procedimientos, 2 con cursor/loop/if/exception)
-- ============================================================================

-- Procedimiento 1: Procesar orden de compra completa (CON cursor, loop, IF, EXCEPTION)
CREATE OR REPLACE PROCEDURE sp_procesar_orden_compra(p_orden_id INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
    v_orden RECORD;
    v_detalle RECORD;
    v_producto RECORD;
    v_error_msg TEXT;
    v_procesados INTEGER := 0;
    v_errores INTEGER := 0;
BEGIN
    -- Validar que la orden existe y está pendiente
    SELECT * INTO v_orden
    FROM "OrdenCompra"
    WHERE id = p_orden_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden de compra % no encontrada', p_orden_id;
    END IF;

    IF v_orden.estado != 'pendiente' THEN
        RAISE EXCEPTION 'Orden % no está en estado pendiente (actual: %)', p_orden_id, v_orden.estado;
    END IF;

    -- Cursor para recorrer detalles de la orden
    FOR v_detalle IN
        SELECT od.*, p."stockActual", p."stockMinimo", p.nombre AS producto_nombre
        FROM "OrdenDetalle" od
        INNER JOIN "Producto" p ON p.id = od."productoId"
        WHERE od."ordenId" = p_orden_id
    LOOP
        BEGIN
            -- Estructura de decisión: validar cantidad mínima de orden del proveedor
            IF v_detalle.cantidad < (
                SELECT "cantidadMinimaOrden" FROM "Proveedor"
                WHERE id = (SELECT "proveedorId" FROM "OrdenCompra" WHERE id = p_orden_id)
            ) THEN
                RAISE EXCEPTION 'Cantidad % menor al mínimo de orden del proveedor para producto %',
                    v_detalle.cantidad, v_detalle.producto_nombre;
            END IF;

            -- Actualizar stock del producto
            UPDATE "Producto"
            SET "stockActual" = "stockActual" + v_detalle.cantidad
            WHERE id = v_detalle."productoId";

            -- Registrar movimiento de inventario
            INSERT INTO "MovimientoInventario" ("productoId", cantidad, tipo, motivo, "usuarioId", referencia)
            VALUES (
                v_detalle."productoId",
                v_detalle.cantidad,
                'compra',
                'Procesamiento orden de compra #' || p_orden_id,
                v_orden."usuarioId",
                'orden:' || p_orden_id
            );

            -- Verificar si llegó al mínimo y alertar (simulado con NOTICE)
            IF (SELECT "stockActual" FROM "Producto" WHERE id = v_detalle."productoId")
               <= (SELECT "stockMinimo" FROM "Producto" WHERE id = v_detalle."productoId") THEN
                RAISE NOTICE 'ALERTA: Producto % alcanzó stock mínimo tras recepción', v_detalle.producto_nombre;
            END IF;

            v_procesados := v_procesados + 1;

        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores + 1;
            v_error_msg := SQLERRM;
            RAISE NOTICE 'Error procesando detalle %: %', v_detalle.id, v_error_msg;
            -- Continuar con el siguiente detalle (no hacer rollback total)
        END;
    END LOOP;

    -- Actualizar estado de la orden
    IF v_errores = 0 THEN
        UPDATE "OrdenCompra"
        SET estado = 'recibida'
        WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % procesada completamente: % items', p_orden_id, v_procesados;
    ELSE
        UPDATE "OrdenCompra"
        SET estado = 'parcial'
        WHERE id = p_orden_id;
        RAISE NOTICE 'Orden % procesada parcialmente: % OK, % errores', p_orden_id, v_procesados, v_errores;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error crítico en sp_procesar_orden_compra(%): %', p_orden_id, SQLERRM;
END;
$$;

-- Procedimiento 2: Generar reporte de caducidades próximas (CON cursor, loop, IF, EXCEPTION)
CREATE OR REPLACE PROCEDURE sp_reporte_caducidades_proximas(p_dias INTEGER DEFAULT 30)
LANGUAGE plpgsql AS $$
DECLARE
    v_fecha_limite DATE := CURRENT_DATE + p_dias;
    v_caducidad RECORD;
    v_producto RECORD;
    v_proveedor RECORD;
    v_total_alertas INTEGER := 0;
    v_total_unidades INTEGER := 0;
    v_cursor REFCURSOR;
BEGIN
    -- Validar parámetro
    IF p_dias <= 0 OR p_dias > 365 THEN
        RAISE EXCEPTION 'Parámetro p_dias debe estar entre 1 y 365, recibido: %', p_dias;
    END IF;

    -- Cursor para productos con caducidad próxima
    OPEN v_cursor FOR
        SELECT fc.*, p.nombre AS producto_nombre, p."precioVenta", p."stockActual",
               pr."nombreComercial" AS proveedor_nombre, pr.contacto, pr.correo
        FROM "FechaCaducidad" fc
        INNER JOIN "Producto" p ON p.id = fc."productoId"
        INNER JOIN "Proveedor" pr ON pr.id = p."proveedorId"
        WHERE fc."fechaCaducidad"::DATE <= v_fecha_limite
        AND fc."fechaCaducidad"::DATE >= CURRENT_DATE
        ORDER BY fc."fechaCaducidad" ASC;

    LOOP
        FETCH v_cursor INTO v_caducidad;
        EXIT WHEN NOT FOUND;

        BEGIN
            v_total_alertas := v_total_alertas + 1;
            v_total_unidades := v_total_unidades + v_caducidad.cantidad;

            -- Estructura de decisión: clasificar urgencia
            IF v_caducidad."fechaCaducidad"::DATE <= CURRENT_DATE + 7 THEN
                RAISE NOTICE 'URGENTE (7 días): % - % unidades caducan %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad, v_caducidad."fechaCaducidad";
            ELSIF v_caducidad."fechaCaducidad"::DATE <= CURRENT_DATE + 15 THEN
                RAISE NOTICE 'PRÓXIMO (15 días): % - % unidades caducan %',
                    v_caducidad.producto_nombre, v_caducidad.cantidad, v_caducidad."fechaCaducidad";
            ELSE
                RAISE NOTICE 'VIGILANCIA (% días): % - % unidades caducan %',
                    p_dias, v_caducidad.producto_nombre, v_caducidad.cantidad, v_caducidad."fechaCaducidad";
            END IF;

            -- Si stock actual > cantidad por caducar, sugerir descuento
            IF v_caducidad."stockActual" > v_caducidad.cantidad THEN
                RAISE NOTICE '  -> Sugerencia: Aplicar descuento a % (stock: %, por caducar: %)',
                    v_caducidad.producto_nombre, v_caducidad."stockActual", v_caducidad.cantidad;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error procesando caducidad %: %', v_caducidad.id, SQLERRM;
        END;
    END LOOP;

    CLOSE v_cursor;

    -- Resumen final
    RAISE NOTICE '=== RESUMEN REPORTE CADUCIDADES (% días) ===', p_dias;
    RAISE NOTICE 'Total alertas: %', v_total_alertas;
    RAISE NOTICE 'Total unidades en riesgo: %', v_total_unidades;

EXCEPTION WHEN OTHERS THEN
    IF v_cursor IS NOT NULL THEN
        CLOSE v_cursor;
    END IF;
    RAISE EXCEPTION 'Error crítico en sp_reporte_caducidades_proximas(%): %', p_dias, SQLERRM;
END;
$$;

-- Procedimiento 3: Calcular estadísticas de inventario (SIN cursor, más simple)
CREATE OR REPLACE PROCEDURE sp_calcular_estadisticas_inventario(
    OUT p_total_productos INTEGER,
    OUT p_valor_inventario NUMERIC,
    OUT p_productos_stock_bajo INTEGER,
    OUT p_productos_sin_stock INTEGER,
    OUT p_valor_merma NUMERIC
)
LANGUAGE plpgsql AS $$
DECLARE
    v_merma_total NUMERIC := 0;
BEGIN
    -- Total de productos activos
    SELECT COUNT(*) INTO p_total_productos
    FROM "Producto";

    -- Valor total del inventario (stock * precio compra)
    SELECT COALESCE(SUM("stockActual" * "precioCompra"), 0) INTO p_valor_inventario
    FROM "Producto";

    -- Productos con stock bajo (stockActual <= stockMinimo)
    SELECT COUNT(*) INTO p_productos_stock_bajo
    FROM "Producto"
    WHERE "stockActual" <= "stockMinimo";

    -- Productos sin stock
    SELECT COUNT(*) INTO p_productos_sin_stock
    FROM "Producto"
    WHERE "stockActual" = 0;

    -- Valor de merma (movimientos de tipo merma)
    SELECT COALESCE(SUM(ABS(mi.cantidad) * p."precioCompra"), 0) INTO v_merma_total
    FROM "MovimientoInventario" mi
    INNER JOIN "Producto" p ON p.id = mi."productoId"
    WHERE mi.tipo = 'merma';

    p_valor_merma := v_merma_total;

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en sp_calcular_estadisticas_inventario: %', SQLERRM;
END;
$$;

-- ============================================================================
-- COMENTARIOS DOCUMENTALES
-- ============================================================================

COMMENT ON VIEW vista_ventas_por_categoria IS
'Vista con JOIN 4 tablas, 7 funciones agregación, GROUP BY, HAVING > 100, ORDER BY ingreso DESC';

COMMENT ON VIEW vista_productos_stock_bajo IS
'Vista con JOIN 3 tablas + LEFT JOIN 2 tablas, 3 agregaciones, GROUP BY, HAVING, ORDER BY deficit DESC';

COMMENT ON VIEW vista_rendimiento_cajeros IS
'Vista con JOIN 3 tablas + LEFT JOIN 2 tablas, 8 agregaciones, GROUP BY, HAVING, window function RANK, ORDER BY';

COMMENT ON TRIGGER trg_validar_stock_venta_detalle ON "VentaDetalle" IS
'BEFORE INSERT/UPDATE: Valida stock suficiente antes de permitir venta';

COMMENT ON TRIGGER trg_descontar_stock_venta ON "VentaDetalle" IS
'AFTER INSERT: Descuenta stock y registra movimiento de inventario tipo venta';

COMMENT ON TRIGGER trg_ajustar_stock_venta_update ON "VentaDetalle" IS
'AFTER UPDATE: Ajusta stock por diferencia de cantidad y registra movimiento tipo ajuste';

COMMENT ON TRIGGER trg_restaurar_stock_venta_delete ON "VentaDetalle" IS
'AFTER DELETE: Restaura stock y registra movimiento tipo ajuste';

COMMENT ON TRIGGER trg_validar_proveedor_orden_detalle ON "OrdenDetalle" IS
'BEFORE INSERT: Valida que el proveedor de la orden existe';

COMMENT ON TRIGGER trg_incrementar_stock_compra ON "OrdenDetalle" IS
'AFTER INSERT: Incrementa stock y registra movimiento tipo compra';

COMMENT ON PROCEDURE sp_procesar_orden_compra(INTEGER) IS
'Procesa orden completa: cursor sobre detalles, loop, IF validaciones, EXCEPTION handling, actualiza estado';

COMMENT ON PROCEDURE sp_reporte_caducidades_proximas(INTEGER) IS
'Genera reporte de caducidades: REFCURSOR, loop, IF urgencia, EXCEPTION handling, NOTICE alertas';

COMMENT ON PROCEDURE sp_calcular_estadisticas_inventario(OUT,OUT,OUT,OUT,OUT) IS
'Calcula KPIs de inventario: 5 OUT parameters, agregaciones, sin cursor (procedimiento simple)';