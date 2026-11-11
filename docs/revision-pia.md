# Revisión del PIA: Sistema de gestión «Don Tello»

Revisión del documento `Pia BD.pdf` (33 páginas) contra los requisitos de la tarea y contra el código del repositorio.

## 1. Cumplimiento de los requisitos

| Requisito | Estado | Evidencia en el documento |
|---|---|---|
| Al menos 3 vistas con JOIN de dos tablas, agregación, `GROUP BY`, `HAVING` y `ORDER BY` | Cumple | Las 3 vistas (sección 4.1) incluyen todos los elementos. |
| Al menos 3 triggers que cubran INSERT, UPDATE y DELETE en BEFORE y AFTER | Cumple | T1 `BEFORE INSERT OR UPDATE`, T2 `AFTER UPDATE`, T3 `AFTER DELETE`. Hay 4 en total: `trg_validar_proveedor_orden_detalle` y `trg_ajustar_stock_venta_update` se eliminaron en `20261110000000_drop_redundant_triggers`. |
| Al menos 3 procedimientos; 2 con cursor, iteración, decisión y excepciones | Cumple | SP1 usa cursor implícito (`FOR … LOOP`) y SP2 un `REFCURSOR` explícito; ambos con `IF` y `EXCEPTION`. |
| Normalización de las tablas | Cumple parcialmente | La sección 5.2 presenta criterios, dependencias funcionales de las 16 tablas, correcciones y desnormalizaciones, pero no muestra el proceso paso a paso. |

### Coherencia entre el documento y el código

- `prisma/schema.prisma` tiene 16 modelos, igual que el diagrama E-R.
- La migración `20261013000200_normalizacion_3fn` aplica las dos correcciones descritas (`ProveedorMetodoPago` y eliminación de `OrdenCompra.total`).
- Los objetos que ya no existen (`trg_incrementar_stock_compra`, `sp_procesar_orden_compra`) se eliminan en migraciones posteriores; el documento describe el estado actual de la base.

## 2. Hallazgos a corregir

### 2.1 Marcadores pendientes (bloquea la entrega)

- Portada: `[fecha de entrega]`.
- Sección 5.1: `[pegar captura]` en los 23 casos de prueba (PU-01 a PU-23).

### 2.2 Ubicación de la normalización

La normalización aparece como 5.2, dentro de «Pruebas de software», y no corresponde a esa sección. Se recomienda moverla a la sección 3 (Especificación de diseño), como 3.2, justo después del diagrama Entidad-Relación, y recorrer la numeración.

### 2.3 Falta el proceso de normalización

El documento muestra el resultado final y dos correcciones, pero no el paso de 0FN → 1FN → 2FN → 3FN sobre datos de ejemplo. Si el profesor pidió normalizar las tablas, lo más probable es que quiera ver ese proceso. Ver la sección 3 de este archivo.

### 2.4 Atributos que pueden cuestionarse en 3FN

| Atributo | Posible objeción | Justificación a agregar |
|---|---|---|
| `Producto.precioVenta` | Parece derivarse de `precioCompra × (1 + Categoria.porcentajeGanancia)`, lo que sería una dependencia transitiva. | La aplicación solo **sugiere** ese precio (`productos-client.tsx`); el administrador puede capturar otro. El precio de venta es una decisión comercial, no un cálculo. |
| `OrdenDetalle.precioCompra`, `OrdenDetalle.precioVenta` | Parecen duplicar los precios de `Producto`. | Son los precios históricos de esa compra, igual que `VentaDetalle.precioUnitario`. Si el producto cambia de precio, la orden debe conservar el precio pactado. |

Se recomienda agregar ambos casos a la tabla de 3FN o a la de «Desnormalizaciones controladas».

### 2.5 Observaciones menores

- RF-09 solo tiene casos válidos. Se explica en el resumen de cobertura, pero podría agregarse un caso límite (tablero sin ventas registradas: las vistas regresan vacías y no hay error).
- Si el PDF todavía describe `trg_validar_proveedor_orden_detalle` o `trg_ajustar_stock_venta_update`, hay que quitarlos: ya no existen en la base.

## 3. Normalización paso a paso

El proceso parte de los documentos que la tienda manejaba en papel: la **nota de venta** y la **orden de compra al proveedor**. Cada uno se representa como una relación sin normalizar y se descompone hasta 3FN.

### 3.1 Caso A: nota de venta

#### Forma no normalizada (0FN)

Así se registraba una venta en la libreta: un encabezado y una lista variable de productos.

```
NotaVenta(folio, fechaHora, cajeroCorreo, cajeroNombre, cajeroRol,
          { sku, productoNombre, categoriaNombre, porcentajeGanancia,
            cantidad, precioUnitario },
          total)
```

| folio | fechaHora | cajeroCorreo | cajeroNombre | cajeroRol | productos | total |
|---|---|---|---|---|---|---|
| 101 | 2026-10-05 09:12 | ana@dontello.mx | Ana López | cajero | ABC-001 Coca-Cola 600 ml (Bebidas, 30 %) ×2 a $18; LAC-010 Leche Lala 1 L (Lácteos, 20 %) ×1 a $28 | 64 |
| 102 | 2026-10-05 10:40 | luis@dontello.mx | Luis Pérez | cajero | ABC-001 Coca-Cola 600 ml (Bebidas, 30 %) ×1 a $18 | 18 |

**Problema:** la columna `productos` es un grupo repetitivo; no es atómica y no tiene un número fijo de elementos.

#### Primera forma normal (1FN)

Se elimina el grupo repetitivo: cada producto vendido ocupa su propia fila. La llave primaria pasa a ser compuesta, `(folio, sku)`.

```
NotaVenta1FN(folio, sku, fechaHora, cajeroCorreo, cajeroNombre, cajeroRol,
             productoNombre, categoriaNombre, porcentajeGanancia,
             cantidad, precioUnitario, total)
PK = (folio, sku)
```

| folio | sku | fechaHora | cajeroCorreo | cajeroNombre | cajeroRol | productoNombre | categoriaNombre | porcentajeGanancia | cantidad | precioUnitario | total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 101 | ABC-001 | 2026-10-05 09:12 | ana@dontello.mx | Ana López | cajero | Coca-Cola 600 ml | Bebidas | 30 | 2 | 18 | 64 |
| 101 | LAC-010 | 2026-10-05 09:12 | ana@dontello.mx | Ana López | cajero | Leche Lala 1 L | Lácteos | 20 | 1 | 28 | 64 |
| 102 | ABC-001 | 2026-10-05 10:40 | luis@dontello.mx | Luis Pérez | cajero | Coca-Cola 600 ml | Bebidas | 30 | 1 | 18 | 18 |

Todos los valores son atómicos, pero hay redundancia: los datos del cajero y el total se repiten en cada línea de la venta 101, y los datos de la Coca-Cola se repiten en cada venta. Esto provoca anomalías:

- **Inserción:** no se puede registrar un producto nuevo hasta que se venda.
- **Actualización:** cambiar el nombre de un producto obliga a modificar todas las filas donde aparece.
- **Eliminación:** al borrar la venta 102 se pierde que Luis Pérez es cajero.

#### Segunda forma normal (2FN)

Se identifican las dependencias funcionales respecto de la llave `(folio, sku)`:

| Dependencia | Tipo |
|---|---|
| `folio → fechaHora, cajeroCorreo, cajeroNombre, cajeroRol, total` | Parcial (solo una parte de la llave) |
| `sku → productoNombre, categoriaNombre, porcentajeGanancia` | Parcial (solo una parte de la llave) |
| `(folio, sku) → cantidad, precioUnitario` | Completa |

Las dependencias parciales violan 2FN. Cada una se separa en su propia relación:

```
Venta(folio, fechaHora, cajeroCorreo, cajeroNombre, cajeroRol, total)    PK = folio
Producto(sku, productoNombre, categoriaNombre, porcentajeGanancia)       PK = sku
VentaDetalle(folio, sku, cantidad, precioUnitario)                       PK = (folio, sku)
```

`precioUnitario` se queda en `VentaDetalle` y no en `Producto` porque depende de la llave completa: es el precio de **ese** producto en **esa** venta. Si el precio del producto cambia mañana, la venta 101 debe seguir registrando $18.

#### Tercera forma normal (3FN)

Se buscan dependencias transitivas (un atributo no llave que determina a otro atributo no llave):

| Relación | Dependencia transitiva | Solución |
|---|---|---|
| `Venta` | `folio → cajeroCorreo → cajeroNombre, cajeroRol` | Los datos del cajero pasan a `Usuario`; la venta solo guarda la referencia al cajero. |
| `Usuario` (resultante) | `correo → rolNombre` se repite como texto en cada usuario | El rol pasa a `Rol`; el usuario guarda `rolId`. |
| `Producto` | `sku → categoriaNombre → porcentajeGanancia` | La categoría pasa a `Categoria`; el producto guarda `categoriaId`. |
| `Venta` | `total` se calcula como `SUM(cantidad × precioUnitario)` de `VentaDetalle` | Se conserva como desnormalización controlada (ver nota). |

Resultado en 3FN:

```
Rol(id, nombre)                                                  PK = id
Usuario(id, nombre, correo, contrasena, correoVerificado, rolId)  PK = id, FK rolId → Rol
Categoria(id, nombre, porcentajeGanancia)                        PK = id
Producto(id, sku, nombre, categoriaId, ...)                      PK = id, FK categoriaId → Categoria
Venta(id, cajeroId, fechaHora, total)                            PK = id, FK cajeroId → Usuario
VentaDetalle(id, ventaId, productoId, cantidad, precioUnitario)  PK = id, FK ventaId → Venta, FK productoId → Producto
```

Datos de ejemplo ya normalizados:

**Rol**

| id | nombre |
|---|---|
| 1 | administrador |
| 2 | cajero |

**Usuario**

| id | nombre | correo | rolId |
|---|---|---|---|
| 2 | Ana López | ana@dontello.mx | 2 |
| 3 | Luis Pérez | luis@dontello.mx | 2 |

**Categoria**

| id | nombre | porcentajeGanancia |
|---|---|---|
| 1 | Bebidas | 30 |
| 2 | Lácteos | 20 |

**Producto**

| id | sku | nombre | categoriaId |
|---|---|---|---|
| 1 | ABC-001 | Coca-Cola 600 ml | 1 |
| 2 | LAC-010 | Leche Lala 1 L | 2 |

**Venta**

| id | cajeroId | fechaHora | total |
|---|---|---|---|
| 101 | 2 | 2026-10-05 09:12 | 64 |
| 102 | 3 | 2026-10-05 10:40 | 18 |

**VentaDetalle**

| id | ventaId | productoId | cantidad | precioUnitario |
|---|---|---|---|---|
| 1 | 101 | 1 | 2 | 18 |
| 2 | 101 | 2 | 1 | 28 |
| 3 | 102 | 1 | 1 | 18 |

**Notas de implementación**

- En la base de datos, las llaves naturales (`folio`, `sku`, `correo`) se sustituyeron por llaves sustitutas `id` autoincrementales. `sku` y `correo` se conservan con restricción `UNIQUE`, por lo que siguen siendo llaves candidatas y no rompen 3FN.
- `VentaDetalle` usa una llave sustituta `id` en lugar de `(ventaId, productoId)`. Con llave simple, 2FN se cumple de forma automática.
- `Venta.total` se conserva como desnormalización controlada: es el monto cobrado al momento de la venta y evita recalcular la suma en cada reporte.

### 3.2 Caso B: orden de compra al proveedor

#### Forma no normalizada (0FN)

```
OrdenProveedor(folioOrden, fechaOrden, estado,
               proveedorCodigo, proveedorNombre, rfc, cantidadMinimaOrden,
               { metodosPago },
               { sku, productoNombre, cantidad, unidad, piezasPorUnidad,
                 precioCompra, fechaCaducidad },
               total)
```

| folioOrden | fechaOrden | proveedorCodigo | proveedorNombre | metodosPago | productos | total |
|---|---|---|---|---|---|---|
| 501 | 2026-10-01 | PRV-01 | Coca-Cola FEMSA | efectivo, transferencia | ABC-001 ×3 cajas de 24 a $12 (cad. 2027-01-10) | 864 |

**Problemas:** hay dos grupos repetitivos (`metodosPago` y `productos`) y un atributo derivado (`total`).

#### Primera forma normal (1FN)

Se separa cada grupo repetitivo en su propia relación:

```
OrdenProveedor(folioOrden, fechaOrden, estado, proveedorCodigo, proveedorNombre,
               rfc, cantidadMinimaOrden, total)                      PK = folioOrden
ProveedorMetodoPago(proveedorCodigo, metodo)                         PK = (proveedorCodigo, metodo)
OrdenLinea(folioOrden, sku, productoNombre, cantidad, unidad,
           piezasPorUnidad, precioCompra, fechaCaducidad)            PK = (folioOrden, sku)
```

| proveedorCodigo | metodo |
|---|---|
| PRV-01 | efectivo |
| PRV-01 | transferencia |

Esta es la corrección real que se hizo en el proyecto: `Proveedor.metodosPago` era un arreglo de PostgreSQL (atributo multivaluado) y la migración `20261013000200_normalizacion_3fn` lo convirtió en la relación `ProveedorMetodoPago`.

#### Segunda forma normal (2FN)

En `OrdenLinea`, `sku → productoNombre` es una dependencia parcial. El nombre se elimina de la línea y se obtiene de `Producto`.

`piezasPorUnidad` **no** depende solo de `unidad`: una caja de Coca-Cola puede traer 12 o 24 piezas según la presentación. Por eso depende de la línea completa y se queda en `OrdenDetalle`.

`ProveedorMetodoPago` no tiene atributos no llave, así que cumple 2FN.

#### Tercera forma normal (3FN)

| Relación | Problema | Solución |
|---|---|---|
| `OrdenProveedor` | `folioOrden → proveedorCodigo → proveedorNombre, rfc, cantidadMinimaOrden` | Los datos del proveedor pasan a `Proveedor`; la orden guarda `proveedorId`. |
| `OrdenProveedor` | `total` se calcula como `SUM(cantidad × piezasPorUnidad × precioCompra)` de las líneas | Se **elimina**. Esta es la segunda corrección real del proyecto: el valor ya estaba desincronizado con el detalle. |

Resultado en 3FN:

```
Proveedor(id, codigo, rfc, nombreComercial, cantidadMinimaOrden, ...)  PK = id
ProveedorMetodoPago(proveedorId, metodo)                               PK = (proveedorId, metodo)
OrdenCompra(id, proveedorId, usuarioId, fechaOrden, estado)            PK = id
OrdenDetalle(id, ordenId, productoId, cantidad, unidad, piezasPorUnidad,
             precioCompra, precioVenta, fechaCaducidad)                PK = id
```

`OrdenDetalle.precioCompra` y `precioVenta` se conservan porque son los precios pactados en esa orden, no los precios actuales del producto.

### 3.3 Por qué `Venta.total` se conserva y `OrdenCompra.total` no

Ambos son atributos derivados, pero la decisión fue distinta:

| | `Venta.total` | `OrdenCompra.total` |
|---|---|---|
| ¿Quién lo calcula? | La aplicación, en la misma transacción que crea la venta y su detalle. | Se guardaba aparte de las líneas, sin una regla que lo mantuviera igual a ellas. |
| Riesgo de desincronización | Bajo | Alto (ya había ocurrido en los datos) |
| Uso | Se consulta en todos los reportes de ventas | Se consulta poco |
| Decisión | Desnormalización controlada | Se elimina y se calcula al consultar |
