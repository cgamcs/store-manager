import type { Producto, Proveedor, Categoria, OrdenCompra, Descuento, Usuario, PerfilCajero, Venta } from './types'

export const categorias: Categoria[] = [
  { id: 1, nombre: 'Abarrotes', margen_ganancia: 35 },
  { id: 2, nombre: 'Lácteos', margen_ganancia: 40 },
  { id: 3, nombre: 'Bebidas', margen_ganancia: 45 },
  { id: 4, nombre: 'Carnes Frías', margen_ganancia: 50 },
  { id: 5, nombre: 'Frutas y Verduras', margen_ganancia: 60 },
  { id: 6, nombre: 'Limpieza', margen_ganancia: 40 },
  { id: 7, nombre: 'Higiene Personal', margen_ganancia: 45 },
]

export const proveedores: Proveedor[] = [
  { 
    id: 1, 
    codigo: 'PROV001',
    nombre: 'Distribuidora del Norte', 
    razon_social: 'Distribuidora del Norte SA de CV',
    rfc: 'DNO850101AB1',
    contacto: 'Juan Pérez', 
    correo: 'ventas@distnorte.com',
    telefono: '555-123-4567',
    direccion: 'Av. Industrial #500, Parque Industrial Norte',
    cantidad_minima_orden: 5000,
    tiempo_entrega_dias: 3,
    plazo_pago: '30 días',
    metodos_pago: ['Transferencia', 'Cheque']
  },
  { 
    id: 2, 
    codigo: 'PROV002',
    nombre: 'Lácteos Premium', 
    razon_social: 'Lácteos Premium de México SA de CV',
    rfc: 'LPM900215XY2',
    contacto: 'María García', 
    correo: 'pedidos@lacteospremium.com',
    telefono: '555-234-5678',
    direccion: 'Calle Lechera #123, Zona Industrial',
    cantidad_minima_orden: 3000,
    tiempo_entrega_dias: 1,
    plazo_pago: '15 días',
    metodos_pago: ['Transferencia', 'Efectivo']
  },
  { 
    id: 3, 
    codigo: 'PROV003',
    nombre: 'Bebidas Express', 
    razon_social: 'Bebidas Express del Centro SA de CV',
    rfc: 'BEC880520ZZ3',
    contacto: 'Carlos López', 
    correo: 'contacto@bebidasexpress.com',
    telefono: '555-345-6789',
    direccion: 'Blvd. de las Bebidas #789',
    cantidad_minima_orden: 8000,
    tiempo_entrega_dias: 2,
    plazo_pago: '45 días',
    metodos_pago: ['Transferencia', 'Cheque', 'Crédito']
  },
  { 
    id: 4, 
    codigo: 'PROV004',
    nombre: 'Productos Frescos SA', 
    razon_social: 'Productos Frescos del Bajío SA de CV',
    rfc: 'PFB920815WW4',
    contacto: 'Ana Martínez', 
    correo: 'compras@productosfrescos.com',
    telefono: '555-456-7890',
    direccion: 'Central de Abastos Local 45',
    cantidad_minima_orden: 2000,
    tiempo_entrega_dias: 1,
    plazo_pago: 'Contado',
    metodos_pago: ['Efectivo', 'Transferencia']
  },
]

export const productos: Producto[] = [
  { id: 1, proveedor_id: 1, categoria_id: 1, nombre: 'Arroz 1kg', sku: 'ARR-001', precio_compra: 35, precio_venta: 50, stock_actual: 150, stock_minimo: 30, es_merma: false },
  { id: 2, proveedor_id: 1, categoria_id: 1, nombre: 'Frijol Negro 1kg', sku: 'FRI-001', precio_compra: 22, precio_venta: 35, stock_actual: 120, stock_minimo: 25, es_merma: false },
  { id: 3, proveedor_id: 1, categoria_id: 1, nombre: 'Aceite Vegetal 1L', sku: 'ACE-001', precio_compra: 28, precio_venta: 42, stock_actual: 80, stock_minimo: 20, es_merma: false },
  { id: 4, proveedor_id: 2, categoria_id: 2, nombre: 'Leche Entera 1L', sku: 'LEC-001', precio_compra: 18, precio_venta: 26, stock_actual: 200, stock_minimo: 50, es_merma: false },
  { id: 5, proveedor_id: 2, categoria_id: 2, nombre: 'Queso Panela 400g', sku: 'QUE-001', precio_compra: 45, precio_venta: 68, stock_actual: 15, stock_minimo: 20, es_merma: true, descuento: 30 },
  { id: 6, proveedor_id: 2, categoria_id: 2, nombre: 'Yogurt Natural 1kg', sku: 'YOG-001', precio_compra: 32, precio_venta: 48, stock_actual: 45, stock_minimo: 15, es_merma: true, descuento: 25 },
  { id: 7, proveedor_id: 3, categoria_id: 3, nombre: 'Refresco Cola 2L', sku: 'REF-001', precio_compra: 18, precio_venta: 28, stock_actual: 180, stock_minimo: 40, es_merma: false },
  { id: 8, proveedor_id: 3, categoria_id: 3, nombre: 'Agua Natural 1L', sku: 'AGU-001', precio_compra: 6, precio_venta: 12, stock_actual: 300, stock_minimo: 60, es_merma: false },
  { id: 9, proveedor_id: 3, categoria_id: 3, nombre: 'Jugo de Naranja 1L', sku: 'JUG-001', precio_compra: 22, precio_venta: 35, stock_actual: 8, stock_minimo: 15, es_merma: true, descuento: 20 },
  { id: 10, proveedor_id: 4, categoria_id: 4, nombre: 'Jamón de Pavo 200g', sku: 'JAM-001', precio_compra: 38, precio_venta: 56, stock_actual: 25, stock_minimo: 10, es_merma: true, descuento: 35 },
  { id: 11, proveedor_id: 4, categoria_id: 4, nombre: 'Salchicha 500g', sku: 'SAL-001', precio_compra: 42, precio_venta: 62, stock_actual: 30, stock_minimo: 12, es_merma: true, descuento: 40 },
  { id: 12, proveedor_id: 1, categoria_id: 6, nombre: 'Detergente 1kg', sku: 'DET-001', precio_compra: 35, precio_venta: 52, stock_actual: 60, stock_minimo: 15, es_merma: false },
  { id: 13, proveedor_id: 1, categoria_id: 6, nombre: 'Jabón de Barra', sku: 'JAB-001', precio_compra: 12, precio_venta: 18, stock_actual: 100, stock_minimo: 25, es_merma: false },
  { id: 14, proveedor_id: 1, categoria_id: 7, nombre: 'Shampoo 400ml', sku: 'SHA-001', precio_compra: 45, precio_venta: 68, stock_actual: 40, stock_minimo: 10, es_merma: false },
  { id: 15, proveedor_id: 1, categoria_id: 7, nombre: 'Pasta Dental 100ml', sku: 'PAS-001', precio_compra: 28, precio_venta: 42, stock_actual: 55, stock_minimo: 15, es_merma: false },
]

export const descuentos: Descuento[] = [
  { id: 1, nombre: 'Merma Queso Panela Lote A', porcentaje: 30, fecha_inicio: new Date('2024-01-01'), fecha_fin: new Date('2024-12-31'), activo: true, productos_ids: [5] },
  { id: 2, nombre: 'Merma Yogurt Lote B', porcentaje: 25, fecha_inicio: new Date('2024-03-01'), fecha_fin: new Date('2024-03-31'), activo: true, productos_ids: [6] },
  { id: 3, nombre: 'Merma Carnes Frías Lote C', porcentaje: 35, fecha_inicio: new Date('2024-02-15'), fecha_fin: new Date('2024-02-28'), activo: true, productos_ids: [10, 11] },
  { id: 4, nombre: 'Merma Jugo Naranja Lote D', porcentaje: 20, fecha_inicio: new Date('2024-03-01'), fecha_fin: new Date('2024-03-15'), activo: true, productos_ids: [9] },
]

export const ordenesCompra: OrdenCompra[] = [
  { 
    id: 1, 
    proveedor_id: 1, 
    usuario_id: 1, 
    fecha_orden: new Date('2024-03-15'), 
    estado: 'recibida', 
    total: 15000,
    detalles: [
      { id: 1, orden_id: 1, producto_id: 1, producto_nombre: 'Arroz 1kg', cantidad: 50, precio_unitario: 18, precio_venta_sugerido: 24.30, precio_venta_final: 28, fecha_caducidad: new Date('2025-03-15'), unidad: 'caja' }
    ]
  },
  { 
    id: 2, 
    proveedor_id: 2, 
    usuario_id: 1, 
    fecha_orden: new Date('2024-03-18'), 
    estado: 'enviada', 
    total: 8500,
    detalles: [
      { id: 2, orden_id: 2, producto_id: 4, producto_nombre: 'Leche Entera 1L', cantidad: 100, precio_unitario: 18, precio_venta_sugerido: 25.20, precio_venta_final: 26, fecha_caducidad: new Date('2024-04-18'), unidad: 'caja' }
    ]
  },
  { id: 3, proveedor_id: 3, usuario_id: 1, fecha_orden: new Date('2024-03-20'), estado: 'pendiente', total: 12000 },
  { id: 4, proveedor_id: 4, usuario_id: 1, fecha_orden: new Date('2024-03-22'), estado: 'pendiente', total: 6800 },
]

export const usuarios: Usuario[] = [
  { id: 1, rol_id: 1, nombre: 'Admin Principal', correo: 'admin@abarrotes-don-tello.com' },
  { id: 2, rol_id: 2, nombre: 'Juan Hernández', correo: 'juan.h@abarrotes-don-tello.com' },
  { id: 3, rol_id: 2, nombre: 'María López', correo: 'maria.l@abarrotes-don-tello.com' },
]

export const perfilesCajero: PerfilCajero[] = [
  { id: 1, usuario_id: 2, direccion: 'Calle Reforma #123', telefono: '555-123-4567', nss: '12345678901', rfc: 'HEJM900101ABC', fecha_ingreso: new Date('2023-01-15'), sueldo: 8500, horas_semana: 48, turno: 'matutino' },
  { id: 2, usuario_id: 3, direccion: 'Av. Juárez #456', telefono: '555-987-6543', nss: '98765432109', rfc: 'LOMA950520XYZ', fecha_ingreso: new Date('2023-06-01'), sueldo: 8000, horas_semana: 40, turno: 'vespertino' },
]

export const ventasRecientes: Venta[] = [
  { id: 1, cajero_id: 2, corte_id: 1, fecha_hora: new Date('2024-03-25T09:30:00'), total: 458.50 },
  { id: 2, cajero_id: 2, corte_id: 1, fecha_hora: new Date('2024-03-25T10:15:00'), total: 235.00 },
  { id: 3, cajero_id: 3, corte_id: 2, fecha_hora: new Date('2024-03-25T14:45:00'), total: 892.75 },
  { id: 4, cajero_id: 2, corte_id: 1, fecha_hora: new Date('2024-03-25T11:30:00'), total: 156.00 },
  { id: 5, cajero_id: 3, corte_id: 2, fecha_hora: new Date('2024-03-25T16:00:00'), total: 1245.50 },
]

export const dashboardStats = {
  ventasHoy: 15680.50,
  ventasSemana: 98450.00,
  ventasMes: 425680.00,
  productosVendidosHoy: 342,
  ticketPromedio: 186.50,
  clientesAtendidos: 84,
}

export const productosMasVendidos = [
  { nombre: 'Leche Entera 1L', cantidad: 145, total: 3770 },
  { nombre: 'Arroz 1kg', cantidad: 98, total: 2744 },
  { nombre: 'Refresco Cola 2L', cantidad: 87, total: 2436 },
  { nombre: 'Aceite Vegetal 1L', cantidad: 65, total: 2730 },
  { nombre: 'Agua Natural 1L', cantidad: 210, total: 2520 },
]

// Helper function to generate SKU from product name
export function generateSKU(nombre: string, existingSKUs: string[]): string {
  // Take first 3 letters of first word, uppercase
  const words = nombre.trim().split(/\s+/)
  let prefix = words[0].substring(0, 3).toUpperCase()
  
  // Remove accents
  prefix = prefix.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  // Find the next available number
  let counter = 1
  let sku = `${prefix}-${counter.toString().padStart(3, '0')}`
  
  while (existingSKUs.includes(sku)) {
    counter++
    sku = `${prefix}-${counter.toString().padStart(3, '0')}`
  }
  
  return sku
}

// Helper function to calculate suggested price based on category margin
export function calculateSuggestedPrice(precioCompra: number, categoriaId: number): number {
  const categoria = categorias.find(c => c.id === categoriaId)
  const margen = categoria?.margen_ganancia || 30
  return Number((precioCompra * (1 + margen / 100)).toFixed(2))
}
