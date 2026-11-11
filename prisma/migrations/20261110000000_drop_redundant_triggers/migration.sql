-- Drop triggers that never contribute behavior.
--
-- trg_validar_proveedor_orden_detalle: redundant with the NOT NULL foreign key
-- "OrdenCompra_proveedorId_fkey"; an order without a valid supplier cannot exist.
--
-- trg_ajustar_stock_venta_update: the app never updates "VentaDetalle" rows
-- (sales are only created or deleted), so it never fires.
--
-- Remaining triggers still cover INSERT, UPDATE and DELETE with BEFORE and AFTER:
-- trg_validar_stock_venta_detalle, trg_descontar_stock_venta,
-- trg_recibir_orden_compra, trg_restaurar_stock_venta_delete.

DROP TRIGGER IF EXISTS trg_validar_proveedor_orden_detalle ON "OrdenDetalle";
DROP FUNCTION IF EXISTS fn_validar_proveedor_orden();

DROP TRIGGER IF EXISTS trg_ajustar_stock_venta_update ON "VentaDetalle";
DROP FUNCTION IF EXISTS fn_ajustar_stock_venta_update();
