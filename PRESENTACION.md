# Sistema de Gestión — Abarrotes Don Tello

Aplicación web full-stack para la administración completa de una tienda de abarrotes mexicana. Cubre punto de venta, inventario, proveedores, órdenes de compra, descuentos y gestión de usuarios.

---

## Índice

1. [Visión general](#visión-general)
2. [Infraestructura y despliegue](#infraestructura-y-despliegue)
3. [Stack tecnológico](#stack-tecnológico)
4. [Arquitectura de la aplicación](#arquitectura-de-la-aplicación)
5. [Base de datos](#base-de-datos)
6. [Autenticación y seguridad](#autenticación-y-seguridad)
7. [Módulos del sistema](#módulos-del-sistema)
8. [Lógicas de negocio especiales](#lógicas-de-negocio-especiales)
9. [Correos electrónicos](#correos-electrónicos)
10. [Datos iniciales (Seed)](#datos-iniciales-seed)

---

## Visión general

El sistema tiene **dos tipos de usuario** con interfaces separadas:

| Rol | Acceso | Ruta |
|-----|--------|------|
| **Administrador** | Panel de gestión completo | `/admin/*` |
| **Cajero** | Punto de venta | `/pos` |

El acceso está protegido por roles desde la base de datos — no hay lógica de permisos en el frontend.

---

## Infraestructura y despliegue

```
Usuario (navegador)
       │
       ▼
 Vercel (Edge Network)
       │
  Next.js App Router
  ┌────┴──────────────────────────┐
  │  Server Components            │
  │  Server Actions               │
  │  Route Handlers (mínimos)     │
  └────┬──────────────────────────┘
       │
       ▼
  PostgreSQL — Neon (serverless)
       │
    Prisma ORM
```

- **Hosting:** Vercel — build automático en cada push a `main`
- **Base de datos:** Neon — PostgreSQL serverless con conexión vía pool (`@prisma/adapter-pg`)
- **Email:** Mailtrap — sandbox SMTP para verificación de correos y recuperación de contraseña
- **No hay servidor propio** — todo es serverless (funciones y base de datos)

### Variables de entorno requeridas

```env
DATABASE_URL=postgresql://...      # Cadena de conexión Neon
AUTH_SECRET=...                    # Secret JWT de NextAuth (mín. 32 chars, base64)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=...
MAILTRAP_PASS=...
```

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2 |
| Lenguaje | TypeScript | 5.7 |
| UI | Tailwind CSS + Radix UI + shadcn/ui | 4.2 |
| Autenticación | NextAuth.js v5 beta | 5.0.0-beta.30 |
| ORM | Prisma | 7.6 |
| Base de datos | PostgreSQL (Neon) | 15 |
| Validación | Zod | — |
| Hash de contraseñas | bcryptjs | — |
| Tablas de datos | TanStack React Table | — |
| Gráficos | Recharts | — |
| Email | Nodemailer | — |
| Iconos | Lucide React | — |

---

## Arquitectura de la aplicación

### Estructura de carpetas

```
app/
├── (auth)/              ← Páginas públicas de autenticación
│   ├── page.tsx         ← Login
│   ├── registro/
│   ├── verificar/
│   ├── recuperar/
│   └── cambiar-password/
├── admin/               ← Panel de administración (protegido, rolId=1)
│   ├── layout.tsx       ← Sidebar con navegación
│   ├── dashboard/
│   ├── ventas/
│   ├── ordenes/
│   ├── descuentos/
│   ├── proveedores/
│   ├── productos/
│   ├── categorias/
│   └── usuarios/
├── pos/                 ← Punto de venta (protegido, cualquier rol)
│   ├── page.tsx
│   ├── pos-client.tsx
│   └── actions.ts
└── lib/actions/         ← Server Actions de autenticación
    ├── auth.ts
    ├── password.ts
    └── verify.ts

components/ui/           ← Componentes shadcn (no editar manualmente)
lib/
├── prisma.ts            ← Singleton de Prisma Client
├── utils.ts             ← cn() para clases Tailwind
└── validations/         ← Esquemas Zod por módulo
prisma/
├── schema.prisma        ← Modelos de base de datos
└── seed.ts              ← Datos iniciales
proxy.ts                 ← Middleware de autenticación y rutas
auth.ts                  ← Configuración NextAuth
auth.config.ts           ← Callbacks JWT y sesión
```

### Patrón de cada módulo admin

Cada módulo sigue el mismo patrón de tres capas:

```
page.tsx (Server Component)
  └── Fetches data con Prisma directamente
  └── Renderiza ClientComponent con data como props

*-client.tsx (Client Component)
  └── Maneja estado UI (modales, formularios, filtros)
  └── Llama Server Actions para mutaciones

actions.ts (Server Actions)
  └── "use server"
  └── Validación Zod
  └── Operaciones Prisma
  └── Revalidación de caché con revalidatePath()
```

---

## Base de datos

### Diagrama de modelos

```
Rol ──────────── Usuario
                    │
          ┌─────────┼──────────┐
          │         │          │
    PerfilCajero  Venta     OrdenCompra
                    │          │
               VentaDetalle  OrdenDetalle
                    │          │
               Producto ───────┘
                    │
          ┌─────────┼──────────┐
          │         │          │
     Categoria  Proveedor  FechaCaducidad
                         DescuentoProducto
                              │
                          Descuento
```

### Modelos principales

#### Usuario
```
id, nombre, correo (unique), contrasena (bcrypt), rolId, correoVerificado
```

#### Producto
```
id, nombre, sku (unique), precioCompra, precioVenta,
stockActual, stockMinimo, esMerma, categoriaId, proveedorId
```

#### Proveedor
```
id, codigo (unique), nombreComercial, razonSocial,
rfc (unique, 13 chars), contacto, correo, telefono,
cantidadMinimaOrden, tiempoEntregaDias, plazoPago, metodosPago[]
```

#### OrdenCompra
```
id, proveedorId, usuarioId, fechaOrden, estado, total
estados: "pendiente" → "enviada" → "recibida" | "cancelada"
```

#### OrdenDetalle
```
id, ordenId, productoId, cantidad, unidad, piezasPorUnidad,
precioCompra, precioVenta, fechaCaducidad
unidades: "pieza", "caja", "bulto", "tarima"
```

#### Venta + VentaDetalle
```
Venta: id, cajeroId, fechaHora, total
VentaDetalle: id, ventaId, productoId, cantidad, precioUnitario
```

#### FechaCaducidad
```
id, productoId, fechaCaducidad, cantidad
```
Registra lotes individuales con su fecha de caducidad para aplicar FEFO.

#### Descuento + DescuentoProducto
```
Descuento: id, nombre, porcentaje, activo, fechaInicio, fechaFin
DescuentoProducto: descuentoId + productoId (PK compuesta, relación many-to-many)
```

#### Token
```
id, token (unique), usuarioId, expira
```
Tokens de verificación de email y recuperación de contraseña.

---

## Autenticación y seguridad

### Flujo de autenticación

```
Usuario ingresa correo + contraseña
          │
    NextAuth Credentials Provider
          │
    Busca usuario en BD por correo
          │
    Verifica correoVerificado === true
          │
    bcryptjs.compare(password, hash)
          │
    Genera JWT con { id, rolId, rememberMe }
          │
    proxy.ts evalúa ruta solicitada
          │
    ┌─────┴──────────────────────────────────┐
    │                                        │
rolId=1 → /admin/*               otros roles → /pos
```

### Protección de rutas — proxy.ts

El archivo `proxy.ts` es el único lugar donde vive la lógica de redirección:

| Situación | Resultado |
|-----------|-----------|
| Sin sesión → ruta privada | Redirect a `/` (login) |
| Con sesión (admin) → `/` | Redirect a `/admin/dashboard` |
| Con sesión (cajero) → `/` | Redirect a `/pos` |
| Cajero → `/admin/*` | Redirect a `/pos` |

**Regla importante:** No hay validaciones de rol en el frontend. Toda la lógica de autorización vive en el servidor.

### Duración de sesión JWT

- **"Recordarme" activado:** 30 días
- **"Recordarme" desactivado:** 8 horas

### Registro de cajeros

Los cajeros no se registran solos desde el panel público — el administrador los crea desde `/admin/usuarios`. El flujo de `/registro` existe para que el admin asigne credenciales al cajero de manera controlada.

Sin embargo, el sistema sí implementa verificación de correo:

```
Registro → Token 6 dígitos (expira 5 min) → Email → /verificar → cuenta activa
```

### Recuperación de contraseña

```
/recuperar → ingresa correo → token 6 dígitos por email → /cambiar-password → nueva contraseña
```

### Seguridad en datos

- Contraseñas hasheadas con **bcryptjs** (salt rounds: 10)
- Tokens de un solo uso con expiración
- Validación de entrada con **Zod** en todas las Server Actions
- Constraints de unicidad en BD: `correo`, `sku`, `codigo (proveedor)`, `rfc`
- Transacciones atómicas en operaciones críticas (registrar venta, recibir orden)
- Las contraseñas nunca se devuelven en queries (select explícito)

---

## Módulos del sistema

### Dashboard (`/admin/dashboard`)

Vista general del negocio. Muestra métricas clave y gráficos con Recharts.

### Productos (`/admin/productos`)

CRUD completo de productos con:
- Selección de proveedor y categoría
- Precio de compra y precio de venta
- Stock actual y stock mínimo
- Generación automática de SKU (ver sección especial)
- Precio de venta sugerido por margen de categoría
- Flag `esMerma` para productos próximos a vencer

### Categorías (`/admin/categorias`)

Cada categoría tiene un **porcentaje de ganancia** que sirve como margen por defecto al crear productos:

```
precioVentaSugerido = precioCompra × (1 + margen / 100)
```

Categorías predefinidas: Abarrotes, Lácteos, Bebidas, Carnes Frías, Frutas y Verduras, Limpieza, Higiene Personal.

### Proveedores (`/admin/proveedores`)

Registro detallado que incluye:
- Código interno único (formato: letras/números/guión)
- RFC validado (13 caracteres)
- Métodos de pago aceptados (array)
- Plazo de pago, tiempo de entrega y cantidad mínima de orden

### Órdenes de Compra (`/admin/ordenes`)

Ciclo de vida de una orden:

```
pendiente → enviada → recibida
                  ↘ cancelada
```

**Al marcar como "recibida"** (lógica especial):
1. Incrementa `stockActual` del producto
2. Actualiza `precioCompra` si cambió
3. Crea registros `FechaCaducidad` si se proporcionó fecha
4. Todo ocurre en una **transacción atómica**

Cada detalle de orden soporta distintas unidades:

| Unidad | Ejemplo |
|--------|---------|
| Pieza | 1 unidad individual |
| Caja | Múltiples piezas |
| Bulto | Paquete mayor |
| Tarima | Volumen industrial |

El precio total se calcula automáticamente según `cantidad × piezasPorUnidad × precio`.

### Descuentos (`/admin/descuentos`)

- Descuentos por porcentaje con vigencia (fecha inicio / fecha fin)
- Se asocian a productos específicos (many-to-many)
- Diseñados principalmente para productos en merma (próximos a vencer)
- Se desactivan automáticamente cuando:
  - La fecha de fin ya pasó
  - Todos los productos asociados tienen stock 0

### Ventas (`/admin/ventas`)

Historial completo de ventas con:
- Fecha y hora
- Cajero que realizó la venta
- Detalle de productos vendidos y cantidades
- Total de la transacción

### Usuarios / Cajeros (`/admin/usuarios`)

El admin gestiona los perfiles de cajero con:
- Datos personales (nombre, correo)
- Datos laborales: turno, sueldo, horas semanales, NSS, RFC, dirección
- Estado activo/inactivo (controla acceso al POS)

Un cajero inactivo no puede iniciar sesión en el POS.

### Punto de Venta (`/pos`)

Interfaz diseñada para velocidad:
- Búsqueda de productos por nombre o SKU
- Filtrado por categoría
- Carrito con ajuste de cantidad (+/-)
- Descuentos aplicados automáticamente en productos elegibles
- Confirmación del total antes de registrar
- Sincronización automática de inventario cada 30 segundos
- Pantalla de resumen post-venta

---

## Lógicas de negocio especiales

### Generación de SKU

Los SKUs se generan automáticamente al crear un producto (con opción de override manual).

**Algoritmo:**

```
1. Tomar las primeras 3 letras del nombre del producto
2. Normalizar: quitar acentos (NFD), convertir a mayúsculas
3. Formato: [PREFIJO]-[CONTADOR 5 dígitos con ceros]
4. Verificar unicidad incrementando el contador si ya existe

Ejemplo: "Arroz" → ARR-00001
         "Arroz Extra" → ARR-00002
         "Frijol" → FRI-00001
```

El campo `sku` en la base de datos tiene constraint `UNIQUE` y acepta `null` (para productos sin SKU asignado).

### FEFO — First Expiry First Out

Al registrar una venta en el POS, el sistema no descuenta del stock de forma genérica. En cambio:

```
1. Obtiene todos los lotes FechaCaducidad del producto, ordenados por fecha ASC
2. Consume desde el lote más próximo a vencer primero
3. Si el lote se agota completamente → elimina el registro FechaCaducidad
4. Si queda cantidad → actualiza la cantidad restante del lote
5. Decrementa stockActual del producto
```

Esto garantiza que el inventario físico rote correctamente y minimiza las mermas.

### Sistema de Mermas

Un producto se marca como `esMerma = true` cuando tiene lotes con fecha de caducidad dentro de los próximos 7 días.

```
actualizarMermas(diasUmbral = 7)
  → Busca FechaCaducidad donde fechaCaducidad <= hoy + 7 días
  → Marca los productos asociados con esMerma = true
  → Productos elegibles para descuentos especiales
```

### Precio sugerido de venta

Al crear o editar un producto, si el administrador selecciona una categoría, el sistema calcula automáticamente el precio de venta recomendado:

```
precioVentaSugerido = precioCompra × (1 + porcentajeGanancia / 100)
```

El admin puede aceptar la sugerencia o ingresar un precio manualmente.

### Verificación de stock en POS

Antes de registrar una venta, el servidor verifica que haya stock suficiente para cada producto en el carrito. Si algún producto no tiene stock suficiente, la operación falla completamente (transacción atómica — o se registra todo o nada).

---

## Correos electrónicos

El sistema envía correos en dos situaciones:

### Verificación de cuenta

```
Nuevo usuario se registra
    → Se genera token numérico de 6 dígitos
    → Expira en 5 minutos
    → Se envía al correo del usuario
    → Usuario ingresa el token en /verificar
    → correoVerificado se marca como true
```

### Recuperación de contraseña

```
Usuario solicita recuperación en /recuperar
    → Se genera token de 6 dígitos
    → Expira en 5 minutos
    → Se envía al correo
    → Usuario ingresa token en /cambiar-password
    → Ingresa nueva contraseña (mín. 6 caracteres)
    → Token se elimina de la BD
```

Los correos se envían usando **Nodemailer** con **Mailtrap** como servidor SMTP sandbox (entorno de desarrollo/pruebas).

---

## Datos iniciales (Seed)

El archivo `prisma/seed.ts` inicializa la base de datos con datos de prueba. Se ejecuta con:

```bash
pnpm prisma db seed
```

El seed es **idempotente** — borra los datos existentes antes de insertar, para evitar duplicados.

### Datos que inserta

| Entidad | Cantidad | Detalle |
|---------|----------|---------|
| Roles | 2 | Administrador, Cajero |
| Usuarios | 2 | Admin + Cajero demo |
| Categorías | 7 | Abarrotes, Lácteos, Bebidas, Carnes Frías, Frutas/Verduras, Limpieza, Higiene |
| Proveedores | 4 | Distribuidora del Norte, Lácteos Premium, Bebidas Express, Productos Frescos |
| Productos | 15 | Arroz, Frijol, Aceite, Leche, Queso, Yogurt, Refresco, Agua, Jugo, Jamón, Salchicha, Detergente, Jabón, Shampoo, Pasta Dental |
| Descuentos | 4 | Descuentos de merma (20–40%) |
| Ventas | 5 | Ventas de ejemplo con detalles |
| Órdenes | Varias | Órdenes de compra de ejemplo |

Credenciales de los usuarios demo:

```
Admin:  admin@dontello.com  /  password
Cajero: cajero@dontello.com /  password
```

---

## Notas técnicas adicionales

### Por qué proxy.ts y no middleware.ts

Next.js tiene un archivo `middleware.ts` nativo, pero este proyecto usa `proxy.ts` como punto centralizado de autenticación y enrutamiento. Esto mantiene la lógica de protección de rutas desacoplada del middleware nativo de Next.js y permite mayor control sobre los flujos de redirección.

### Por qué Server Actions en lugar de API Routes

Las Server Actions de Next.js permiten llamar lógica del servidor directamente desde componentes React, eliminando la necesidad de crear endpoints REST intermedios. En este proyecto, prácticamente todas las mutaciones de datos usan Server Actions, reservando los Route Handlers (`app/api/`) solo para integraciones externas si fueran necesarias.

### Errores de TypeScript ignorados en build

El archivo `next.config.mjs` tiene `typescript.ignoreBuildErrors: true`. Esto es intencional para agilizar el desarrollo. Los tipos de Prisma generados automáticamente cubren la mayor parte de la seguridad de tipos en la capa de datos.

### Singleton de Prisma

`lib/prisma.ts` exporta una única instancia del PrismaClient para evitar múltiples conexiones a la base de datos en desarrollo (Next.js hace hot reload y sin singleton crea conexiones nuevas en cada reload).

```typescript
// lib/prisma.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```
