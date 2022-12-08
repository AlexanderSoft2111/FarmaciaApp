export const Paths = {
   productos: 'Productos/',
   clientes: 'Clientes/',
   ventas: 'Ventas/',
   numeroVenta: 'Numeroventa/numeroventa',
   transacciones: 'Transacciones/',
   inventario: 'Inventario/'
} 

export interface TransaccionProducto {
   numero_factura: string;
   proveedor: string;
   ruc: string
   cantidad: number;
   um: string;
   producto: Producto;
   fecha_transaccion: string;
   tipo_transaccion: string
}

export interface InvProducto {
    cantidad: number;
    um: string;
    producto: Producto;
    descripcion: string;
    fecha_ingreso: Date
 }
export interface Producto {
    codigo: string;
    descripcion: string;
    lote: string;
    precio_compra: number;
    precio_venta: number;
    descuento: boolean;
    fecha_caducidad: Date;
    fecha_elaboracion?: Date;
    fecha_creacion: string;
 }


 export interface Cliente {
     nombre: string;
     ruc: string;
     direccion: string;
     telefono: string;
     email: string;
 }

 export interface Venta {
     productos: ProductoVenta[];
     cliente: Cliente;
     subtotal_sin_iva: number;
     subtotal_con_iva: number;
     iva: number;
     total: number;
     fecha: Date;
     id: string;
     numero: number;
     detalle?: string
 }

 export interface ProductoVenta {
    cantidad: number;
    producto: InvProducto;
    precio: number;
 }

 export interface NumeroVenta {
     numero: number;
 }
 