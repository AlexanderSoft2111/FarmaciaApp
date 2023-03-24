export const Paths = {
   productos: 'Productos/',
   clientes: 'Clientes/',
   ventas: 'Ventas/',
   numeroVenta: 'Numeroventa/numeroventa',
   transacciones: 'Transacciones/',
   inventario: 'Inventario/',
   notasCredito: 'NotasCredito/',
   numeroNotaCredito: 'NotaCredito/numeroNotaCredito'
} 

export interface TransaccionProducto {
   numero_factura: string;
   numero_nota_credito?: string;
   proveedor: string;
   ruc: string
   cantidad: number;
   um: string;
   producto: Producto;
   fecha_transaccion: Date;
   tipo_transaccion: string
}

export interface InvProducto {
    cantidad: number;
    um: string;
    producto: Producto;
    descripcion: string;
    fecha_ingreso: Date;
    //cantidad_minima?: number;
    diferencia?: number;
 }
export interface Producto {
    codigo: string;
    codigoAux?: string;
    descripcion: string;
    lote: string;
    precio_compra: number;
    precio_venta: number;
    descuento: boolean;
    fecha_caducidad: Date | string;
    fecha_elaboracion?: Date;
    fecha_creacion: string;
 }


 export interface Cliente {
     id: string;
     nombre: string;
     ruc: string;
     direccion: string;
     telefono: string;
     email: string;
     codCliente: string;
     tipoIdentificacionComprador?:    
     { tipo: 'RUC', codigo: '04' } |
     { tipo: 'Cédula', codigo: '05' } |
     { tipo: 'Pasaporte', codigo: '06' } |
     { tipo: 'Consumidor final', codigo: '07' } |
     { tipo: 'Identificaión del Exterior', codigo: '08' }
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
     numeroFactura?: string;
     detalle?: string
     vendedor?: string;
     formaPago?: string;
     urlPDF: string
 }

 export interface NotaCredito {
     productos: ProductoVenta[];
     cliente: Cliente;
     subtotal_sin_iva: number;
     subtotal_con_iva: number;
     iva: number;
     total: number;
     fecha: Date;
     id: string;
     numeroNotaCredito: string;
     numeroFactura: string;
     motivo: string;
     urlPDF: string
 }

 export interface ProductoVenta {
    cantidad: number;
    producto: InvProducto;
    precio: number;
    descuento?: number;
    type?: 'iva' | 'no_iva' | 'no_objeto_iva'
 }

 export interface NumeroVenta {
     numero: number;
 }
 export interface NumeroNota {
     numero: number;
 }

 export interface DatosUserAzudist {
    plan: string;
    ruc: string;
    razonSocial: string;
    nombreComercial: string;
    rucDoc: {nombre: string, path: string, pdf: string}
    logo: string;
    firmaElecDoc: {nombre: string, path: string, pdf: string};
    passwordFirma: string;
    establecimiento: string;
    ptoEmision: string;
    secuencial: {
        factura: number,
        notaCredito: number,
        notaDebito: number,
        guiaRemision: number,
        comprobanteRetencion: number
    }
    celular: InputPhone
    dirMatriz: string;
    dirEstablecimiento: string;
    obligadoContabilidad: 'SI' | 'NO';
    ambiente?: 1 | 2;
}

export interface DetVentaProducto {
    codigoPrincipal: string;
    codigoAuxiliar: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    precioTotalSinImpuesto: number;
    impuestos: VentaPorductoImpuestos
}
export interface DetNotaCreditoProducto {
    codigoInterno: string;
    codigoAdicional: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
    descuento: number;
    precioTotalSinImpuesto: number;
    impuestos: VentaPorductoImpuestos
}

export interface VentaPorductoImpuestos{
    impuesto:  {
        codigo: number;
        codigoPorcentaje: number;
        tarifa: number;
        baseImponible: number;
        valor: number;
    }
}

export interface InputPhone {
    countryCode: string;
    number: string;
    e164Number: string;
  }

export type TipoComprobanteI = 'factura' | 'notaCredito' | 'notaDebito' | 'guiaRemision' | 'comprobanteRetencion';

 