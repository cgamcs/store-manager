-- ============================================================================
-- Normalizacion
--
-- 1FN: Proveedor.metodosPago era un arreglo (atributo multivaluado). Pasa a
--      la relacion ProveedorMetodoPago(proveedorId, metodo) con llave
--      compuesta. Los datos se copian antes de borrar la columna.
-- 3FN: OrdenCompra.total era un atributo derivado de OrdenDetalle
--      (SUM de cantidad * piezasPorUnidad * precioCompra) y ya estaba
--      desincronizado. Se elimina; el total se calcula al consultar.
-- ============================================================================

CREATE TABLE "ProveedorMetodoPago" (
    "proveedorId" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    CONSTRAINT "ProveedorMetodoPago_pkey" PRIMARY KEY ("proveedorId","metodo")
);

ALTER TABLE "ProveedorMetodoPago" ADD CONSTRAINT "ProveedorMetodoPago_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ProveedorMetodoPago" ("proveedorId", "metodo")
SELECT DISTINCT p.id, m.metodo
FROM "Proveedor" p
CROSS JOIN LATERAL unnest(p."metodosPago") AS m(metodo)
WHERE m.metodo IS NOT NULL AND m.metodo <> '';

ALTER TABLE "Proveedor" DROP COLUMN "metodosPago";

ALTER TABLE "OrdenCompra" DROP COLUMN "total";
