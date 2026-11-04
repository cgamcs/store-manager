# Anteproyecto del Producto Integrador

**Sistema de Gestión para la Tienda de Abarrotes "Don Tello"**

Unidad de aprendizaje: Bases de Datos y Lenguajes
Facultad de Ingeniería Mecánica y Eléctrica — Universidad Autónoma de Nuevo León

<!-- REVISAR: nombre(s) del equipo, matrícula(s), grupo, profesor y fecha de entrega -->

---

## 1. Descripción general del proyecto

### 1.1 Antecedentes

Las tiendas de abarrotes son una parte esencial del comercio minorista en México. Abastecen a la población de productos básicos de consumo diario y, en su mayoría, son negocios familiares o de pequeña escala. En este tipo de establecimientos, la operación cotidiana suele registrarse de forma manual en libretas y notas de venta, o simplemente no se registra, ya que depende de la memoria del encargado.

Esta forma de trabajo provoca problemas recurrentes de control de información:

- No se conoce con exactitud la existencia real de cada producto.
- Los productos perecederos caducan en anaquel sin que se detecte a tiempo, lo que genera merma.
- Las compras a proveedores se realizan sin considerar las existencias mínimas ni los montos mínimos de pedido.
- No existe un historial confiable de ventas por cajero, por categoría ni por periodo.
- Los cambios en el inventario (ventas, compras, ajustes y mermas) no dejan rastro, por lo que es imposible auditar las diferencias de existencias.

El presente proyecto atiende esta problemática en una tienda de abarrotes ("Don Tello") mediante una aplicación web respaldada por una base de datos relacional. <!-- REVISAR: confirmar si "Don Tello" es un negocio real o un caso de estudio, y agregar datos de contexto (ubicación, tamaño, número de empleados) si aplica -->

### 1.2 Motivación

El proyecto se desarrolla como producto integrador de la unidad de aprendizaje de Bases de Datos y Lenguajes. Se eligió esta problemática porque reúne en un mismo dominio varios retos de modelado de datos:

- Relaciones de uno a muchos y de muchos a muchos.
- Datos históricos, como los precios al momento de la venta o de la compra.
- Reglas de integridad que conviene garantizar desde el propio gestor de base de datos, como no vender sin existencias o no recibir una orden que no alcanza el monto mínimo.

Todos estos retos permiten aplicar de manera práctica los conceptos de la materia. Además, la operación de una tienda de abarrotes es un contexto cotidiano y cercano, lo que facilita validar que el sistema resuelva necesidades reales de información. <!-- REVISAR: agregar la motivación personal del equipo (por ejemplo, un familiar o conocido con un negocio de este tipo) -->

### 1.3 Justificación

Una base de datos relacional normalizada permite centralizar la información del negocio, eliminar redundancias y garantizar la consistencia de los datos que hoy se manejan de forma dispersa. En particular:

- **Integridad del inventario:** las existencias se actualizan de manera automática y atómica con cada venta, cancelación o recepción de mercancía. Así se evitan diferencias entre lo registrado y lo físico.
- **Trazabilidad:** cada movimiento de inventario queda registrado con su tipo, cantidad, usuario responsable, fecha y referencia al documento que lo originó.
- **Reducción de merma:** el control de lotes con fecha de caducidad permite identificar con anticipación los productos próximos a vencer y aplicarles descuentos.
- **Toma de decisiones:** las consultas agregadas sobre ventas, categorías, cajeros y existencias ofrecen al administrador información que hoy no tiene disponible.
- **Control de acceso:** separar los roles de administrador y cajero protege la información sensible del negocio.

### 1.4 Objetivos

#### Objetivo general

Diseñar e implementar una base de datos relacional, normalizada hasta la tercera forma normal, integrada en una aplicación web para la gestión de una tienda de abarrotes. El sistema debe permitir registrar y consultar ventas, inventario, proveedores y órdenes de compra de forma confiable y trazable.

#### Objetivos específicos

1. Modelar las entidades del negocio (productos, categorías, proveedores, ventas, órdenes de compra, lotes de caducidad, descuentos, usuarios y movimientos de inventario) mediante un diagrama Entidad-Relación.
2. Normalizar todas las relaciones del modelo hasta la tercera forma normal (3FN).
3. Implementar la base de datos en PostgreSQL mediante el ORM Prisma y su sistema de migraciones.
4. Garantizar la integridad del inventario mediante reglas implementadas en el propio sistema gestor de base de datos.
5. Desarrollar una aplicación web que permita realizar consultas, altas, modificaciones y eliminaciones sobre la base de datos.
6. Implementar un punto de venta que registre las ventas y actualice automáticamente las existencias.
7. Proveer reportes de ventas, existencias bajas y productos próximos a caducar para apoyar la toma de decisiones.
8. Restringir el acceso a las funciones del sistema según el rol del usuario (administrador o cajero).

### 1.5 Hipótesis

Si la información de inventario, ventas y compras de una tienda de abarrotes se centraliza en una base de datos relacional normalizada, cuyas reglas de integridad se aplican desde el propio gestor, entonces:

- Las existencias registradas coincidirán con las operaciones realizadas, sin intervención manual.
- Se podrá rastrear el origen de cualquier cambio en el inventario.
- El administrador podrá obtener en segundos información agregada (ventas por categoría, desempeño por cajero, productos con existencias bajas o próximos a caducar) que actualmente no puede obtener.

### 1.6 Alcances

**El sistema cubre:**

- Autenticación de usuarios con contraseña cifrada, verificación de correo electrónico y recuperación de contraseña.
- Dos roles con interfaces separadas: administrador (panel de gestión) y cajero (punto de venta).
- Gestión de catálogos: categorías, productos y proveedores, incluidos los métodos de pago que acepta cada proveedor.
- Punto de venta con búsqueda de productos, carrito de compra y registro de ventas.
- Historial de ventas con detalle por venta y cancelación de ventas.
- Órdenes de compra a proveedores, con su ciclo de estados (pendiente, enviada, recibida, cancelada) y el ingreso de mercancía al recibirlas.
- Control de lotes por fecha de caducidad y consumo de inventario con criterio FEFO (*First Expired, First Out*: primero en caducar, primero en salir).
- Descuentos aplicables a productos y registro de mermas.
- Bitácora de movimientos de inventario (ventas, compras, ajustes, mermas e inventario inicial).
- Tablero de indicadores y reportes de inventario.

**El sistema no cubre:**

- Facturación electrónica (CFDI) ni conexión con el SAT.
- Cobro con terminales bancarias ni integración con pasarelas de pago.
- Contabilidad, nómina ni cuentas por pagar a proveedores.
- Manejo de varias sucursales o almacenes.
- Venta en línea o aplicación para clientes finales.
- Lectura de códigos de barras mediante hardware especializado. <!-- REVISAR: confirmar si se planea agregar lector de código de barras -->

### 1.7 Beneficios

| Beneficiario | Beneficio |
|--------------|-----------|
| **Dueño / administrador** | Conoce en tiempo real las existencias, las ventas y el desempeño de cada cajero. Detecta a tiempo los productos con existencias bajas o próximos a caducar y realiza pedidos a proveedores con información confiable. |
| **Cajero** | Registra las ventas de forma rápida desde una interfaz sencilla. El sistema le impide vender productos sin existencias. |
| **Proveedores** | Reciben pedidos que respetan sus montos mínimos de orden y sus condiciones de pago. |
| **Clientes de la tienda** | Encuentran mayor disponibilidad de productos y menor riesgo de adquirir mercancía caducada. |
| **El negocio en general** | Menos merma, menos errores de inventario y un historial auditable de todas sus operaciones. |

---

## 2. Especificación de requerimientos

### 2.1 Descripción de las funciones del sistema

El sistema está organizado en módulos que corresponden a las entidades principales de la base de datos. Este documento describe las diez funciones principales del sistema, que cubren las operaciones de consulta, alta, modificación y eliminación.

La aplicación cuenta con funciones adicionales: gestión de categorías, descuentos y cajeros, ajustes manuales de inventario, registro de mermas y bitácora de movimientos. Estas funciones forman parte del sistema, pero no se detallan en esta especificación.

**Autenticación.** El acceso al sistema requiere una cuenta registrada. Al iniciar sesión, el sistema identifica el rol del usuario y lo dirige a su interfaz correspondiente. Los cajeros solo pueden ingresar si su perfil está activo.

**Productos.** El administrador mantiene el catálogo de productos. Cada producto pertenece a una categoría y a un proveedor, y tiene un SKU único, precio de compra, precio de venta, existencia actual y existencia mínima.

**Proveedores.** El administrador mantiene el registro de proveedores con sus datos fiscales y de contacto, el monto mínimo de pedido, el tiempo de entrega, el plazo de pago y los métodos de pago aceptados.

**Punto de venta.** El cajero arma una venta seleccionando productos y cantidades. Al confirmarla, el sistema registra la venta y su detalle, descuenta las existencias y consume los lotes de caducidad más próximos a vencer.

**Ventas.** El administrador consulta el historial de ventas y el desempeño de cada cajero, y puede cancelar una venta para devolver las existencias al inventario.

**Órdenes de compra.** El administrador registra pedidos a proveedores y actualiza su estado. Cuando una orden se marca como recibida, el sistema ingresa la mercancía al inventario y registra los lotes de caducidad.

**Reportes.** El administrador consulta un tablero de indicadores y reportes de inventario: valor del inventario, productos con existencias bajas o agotados, merma acumulada y lotes próximos a caducar.

### 2.2 Tabla de requerimientos funcionales

| Módulo | Id | Nombre | Descripción |
|--------|----|--------|-------------|
| Autenticación | RF-01 | Iniciar sesión | Permite al usuario ingresar con su correo y contraseña. El sistema valida que la cuenta exista, que la contraseña coincida con la almacenada (cifrada), que el correo haya sido verificado y, en el caso de los cajeros, que su perfil esté activo. Si el correo no está verificado, muestra un mensaje que lo indica y, si el código anterior ya expiró, envía un nuevo código de verificación con un enlace a la página de verificación. Si los datos son válidos, redirige al administrador al panel de gestión y al cajero al punto de venta; en caso contrario, muestra un mensaje de error y no concede el acceso. *(Consulta)* |
| Productos | RF-02 | Registrar producto | Permite dar de alta un producto ingresando nombre, SKU, categoría, proveedor, precio de compra, precio de venta, existencia actual y existencia mínima. El sistema valida que el SKU sea único y tenga un formato válido (mayúsculas, números y guiones), y que las cantidades y los precios no sean negativos. *(Alta)* |
| Productos | RF-03 | Modificar producto | Permite actualizar los datos de un producto existente, como el nombre, los precios, la categoría, el proveedor o la existencia mínima. Aplica las mismas validaciones que el registro. *(Modificación)* |
| Proveedores | RF-04 | Eliminar proveedor | Permite eliminar un proveedor del catálogo, previa confirmación. El sistema impide la eliminación si el proveedor tiene productos u órdenes de compra asociadas, para preservar la integridad referencial. *(Eliminación)* |
| Punto de venta | RF-05 | Registrar venta | Permite al cajero registrar una venta con uno o más productos y sus cantidades. El sistema guarda la venta y su detalle con el precio unitario vigente, descuenta las existencias, registra el movimiento de inventario y consume primero los lotes más próximos a caducar. Si algún producto no tiene existencias suficientes, rechaza la venta completa. *(Alta)* |
| Ventas | RF-06 | Cancelar venta | Permite al administrador cancelar una venta registrada, previa confirmación. El sistema elimina la venta y su detalle, devuelve al inventario las cantidades vendidas y registra el movimiento de ajuste correspondiente. *(Eliminación)* |
| Ventas | RF-07 | Consultar rendimiento de cajeros | Muestra, por cada cajero con ventas, el número de ventas, el ingreso total, el ticket promedio, la venta mínima y la máxima, las unidades vendidas, los días con ventas y su posición en un ranking por ingresos. *(Consulta)* |
| Órdenes de compra | RF-08 | Recibir orden de compra | Permite cambiar una orden de compra al estado "recibida". El sistema verifica que la orden exista, que no se haya recibido antes, que sus líneas sean válidas y que su monto total alcance el monto mínimo de pedido del proveedor. Si la orden es válida, ingresa la mercancía al inventario (cantidad × piezas por unidad), registra los movimientos y crea los lotes de caducidad; si no, la rechaza indicando el motivo. *(Modificación)* |
| Reportes | RF-09 | Consultar tablero de indicadores | Muestra al administrador las ventas del día y de la semana comparadas con el periodo anterior, las ventas e ingresos por categoría ordenados por ganancia estimada, y los productos con existencias por debajo del mínimo junto con su proveedor, categoría y tiempo de entrega. *(Consulta)* |
| Reportes | RF-10 | Generar reporte de inventario | Muestra las estadísticas generales del inventario (total de productos, valor del inventario, productos con existencias bajas, productos agotados y valor de la merma) y un reporte de lotes que caducan dentro de un número de días indicado por el usuario (entre 1 y 365). Cada lote se clasifica como caducado, urgente, próximo o en vigilancia, y se sugiere un descuento cuando conviene. *(Consulta)* |

### 2.3 Resumen por tipo de operación

| Tipo de operación | Requerimientos |
|-------------------|----------------|
| Consulta | RF-01, RF-07, RF-09, RF-10 |
| Alta (registro) | RF-02, RF-05 |
| Actualización / modificación | RF-03, RF-08 |
| Eliminación | RF-04, RF-06 |

---

## 3. Tecnologías

### 3.1 Lenguajes de programación

| Lenguaje | Uso |
|----------|-----|
| **TypeScript 5.7** | Lenguaje principal de la aplicación, tanto del lado del servidor como del cliente. Agrega tipado estático a JavaScript, lo que reduce errores y permite usar los tipos que genera el ORM a partir del esquema de la base de datos. |
| **SQL (PL/pgSQL)** | Lenguaje de definición y manipulación de datos, y lenguaje procedural de PostgreSQL. Se usa en las migraciones para definir las tablas, las restricciones y la lógica que se ejecuta en el gestor de base de datos. |

### 3.2 Frameworks

| Framework | Descripción |
|-----------|-------------|
| **Next.js 16.2 (App Router)** | Framework de React para aplicaciones web *full-stack*. Ofrece enrutamiento basado en archivos, componentes de servidor y *Server Actions*, que permiten ejecutar operaciones sobre la base de datos directamente en el servidor sin construir una API REST aparte. |
| **React 19.2** | Biblioteca para construir interfaces de usuario basadas en componentes. |
| **Prisma ORM 7.6** | Mapeador objeto-relacional (ORM) para TypeScript. Define el modelo de datos en un esquema declarativo (`schema.prisma`), administra la evolución de la base de datos mediante migraciones versionadas en SQL y genera un cliente tipado para las consultas. Se conecta a PostgreSQL mediante el adaptador `@prisma/adapter-pg`. |
| **Auth.js (NextAuth v5)** | Framework de autenticación para Next.js. Gestiona el inicio de sesión con credenciales (correo y contraseña) y la sesión del usuario mediante JWT. |
| **Tailwind CSS 4.2** | Framework de CSS basado en clases utilitarias para el diseño de la interfaz. |

### 3.3 Sistema gestor de base de datos

**PostgreSQL 17**, alojado en **Neon**, un servicio de PostgreSQL *serverless* en la nube. PostgreSQL es un sistema gestor de bases de datos relacional de código abierto que cumple con las propiedades ACID. Soporta llaves foráneas, restricciones de verificación (`CHECK`), vistas, disparadores (*triggers*), procedimientos almacenados en PL/pgSQL y transacciones, características necesarias para garantizar la integridad de la información del sistema.

### 3.4 Herramientas y librerías relevantes

| Herramienta / librería | Uso |
|------------------------|-----|
| **Zod** | Validación de los datos de entrada de los formularios del lado del servidor. |
| **React Hook Form** | Manejo del estado y la validación de los formularios en el cliente. |
| **shadcn/ui y Radix UI** | Componentes de interfaz accesibles (diálogos, tablas, menús, formularios). |
| **TanStack React Table** | Tablas de datos con ordenamiento, filtrado y paginación. |
| **Recharts** | Gráficas del tablero de indicadores. |
| **bcryptjs** | Cifrado (*hash*) de las contraseñas de los usuarios. |
| **Nodemailer** (con SMTP de Gmail) | Envío de correos de verificación de cuenta y recuperación de contraseña. |
| **date-fns** | Manejo y cálculo de fechas (periodos de ventas, caducidades). |
| **Lucide React** | Iconografía de la interfaz. |
| **Sonner** | Notificaciones emergentes (*toasts*) de confirmación y error. |
| **tsx** | Ejecución de scripts de TypeScript, como el *seed* que carga los datos iniciales. |

### 3.5 Ambientes de desarrollo

| Herramienta | Uso |
|-------------|-----|
| **Node.js 22** | Entorno de ejecución de JavaScript del lado del servidor. |
| **pnpm** | Gestor de paquetes y dependencias del proyecto. |
| **Prisma CLI** | Creación y aplicación de migraciones, generación del cliente y carga de datos iniciales. |
| **Git y GitHub** | Control de versiones y repositorio remoto del código fuente. |
| **Vercel** | Plataforma de despliegue de la aplicación, con publicación automática en cada cambio de la rama principal. <!-- REVISAR: confirmar que la aplicación está desplegada en Vercel --> |
| **VS Code** | Editor de código utilizado durante el desarrollo. <!-- REVISAR: confirmar el IDE/editor que usa el equipo --> |

El proyecto no utiliza contenedores (Docker): tanto la base de datos (Neon) como el despliegue (Vercel) son servicios administrados en la nube.

---

## Referencias

1. R. S. Pressman, *Ingeniería de Software – Un enfoque práctico*, 7ma ed., McGraw Hill Educación, 2010.
2. I. Sommerville, *Ingeniería de Software*, 9na ed., Pearson Educación, 2011.
