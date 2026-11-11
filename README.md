# Instalación

Para instalar las dependencias hay que ejecutar el comando `npm install`.

# Regenerar Prisma

Para regenerar los modelos y configuraciones de prisma se debe ejecutar el comando `npx prisma generate`.
# Datos de prueba

- `pnpm db:reset`: borra todos los datos excepto los roles y los administradores.
- `pnpm db:seed`: ejecuta el reset y carga datos de prueba (lotes vencidos y por vencer, órdenes en cada estado, ventas y movimientos de inventario).

## Usuarios de prueba

Los crea `pnpm db:seed`. Todos usan la contraseña `password`.

| Rol | Correo | Contraseña | Estado |
|---|---|---|---|
| Cajero | `elena@tienda.com` | `password` | Activo |
| Cajero | `brandon@tienda.com` | `password` | Activo |
| Cajero | `ricardo@tienda.com` | `password` | Inactivo (no puede iniciar sesión) |
| Administrador | `admin@abarrotes-don-tello.com` | `password` | Solo si el seed lo crea; si ya existía un administrador, conserva su contraseña |

Estas credenciales son solo para desarrollo.
