// Types based on ER diagram

export type Rol = {
  id: number
  nombre: 'administrador' | 'cajero'
}

export type Usuario = {
  id: number
  rol_id: number
  nombre: string
  correo: string
  contrasena?: string
  token?: string
}

export type PerfilCajero = {
  id: number
  usuario_id: number
  direccion: string
  telefono: string
  nss: string
  rfc: string
  fecha_ingreso: Date
  sueldo: number
  horas_semana: number
  turno: 'matutino' | 'vespertino' | 'nocturno'
}

export type Proveedor = {
  id: number
  codigo: string
  nombre: string
  razon_social: string
  rfc: string
  contacto: string
  correo: string
  telefono: string
  direccion: string
  cantidad_minima_orden: number
  tiempo_entrega_dias: number
  plazo_pago: string
  metodos_pago: string[]
}

export type Categoria = {
  id: number
  nombre: string
  margen_ganancia: number // Porcentaje de ganancia por defecto para esta categoría
}

export type Producto = {
  id: number
  proveedor_id: number
  categoria_id: number
  nombre: string
  sku: string
  precio_compra: number
  precio_venta: number
  stock_actual: number
  stock_minimo: number
  es_merma: boolean
  descuento?: number
}

export type Descuento = {
  id: number
  nombre: string
  porcentaje: number
  fecha_inicio: Date
  fecha_fin: Date
  activo: boolean
  productos_ids: number[] // IDs de productos específicos con este descuento
}

export type OrdenCompra = {
  id: number
  proveedor_id: number
  usuario_id: number
  fecha_orden: Date
  estado: 'pendiente' | 'enviada' | 'recibida' | 'cancelada'
  total: number
  detalles?: OrdenDetalle[]
}

export type OrdenDetalle = {
  id: number
  orden_id: number
  producto_id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  precio_venta_sugerido: number
  precio_venta_final: number
  fecha_caducidad?: Date
  unidad: 'tarima' | 'bulto' | 'pieza' | 'caja'
}

export type Venta = {
  id: number
  cajero_id: number
  corte_id: number
  fecha_hora: Date
  total: number
}

export type VentaDetalle = {
  id: number
  venta_id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  descuento_aplicado: number
}

export type CartItem = Producto & {
  cantidad: number
  descuento?: number
}
