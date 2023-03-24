import { Injectable } from '@angular/core';
import { DatosUserAzudist, TipoComprobanteI, Cliente, Venta, DetVentaProducto, DetNotaCreditoProducto } from '../models/models';
import * as moment from 'moment';


declare const X2JS: any;

@Injectable({
  providedIn: 'root'
})
export class SriService {

  
  infoTributaria: DatosUserAzudist;

  private codDoc = {
    factura: 1,
    comprobanteRetencion: 7,
    guiaRemision: 6,
    notaCredito: 4,
    notaDebito: 5,
  };

  _claveAcceso: string = '';

  get claveAcceso(): string{

    return this._claveAcceso;
  }
  
  private path = "";

  constructor() {
              }
  


  p_generar_factura_xml(secuencial: string, venta: Venta, arrDetalle: DetVentaProducto[]) {
    
    let tipoIdenComp = '';
    (venta.cliente.ruc.length === 10) ? tipoIdenComp = '05' : tipoIdenComp = '04';

    return new Promise<any>( async (resolve, reject) => {
        const estructuraFactura = {
          factura: {
            _id: "comprobante",
            _version: "1.0.0",
            infoTributaria: {
              ambiente: '2',
              tipoEmision: '1',
              razonSocial: 'MORAN VIDAL JUAN PABLO',
              nombreComercial: 'AZUDIST',
              ruc: '0103663357001',
              claveAcceso: '',
              codDoc: '01',
              estab: '001',
              ptoEmi: '100',
              secuencial: secuencial, //secuencial
              dirMatriz: 'Camino del tejar 4-30 camino a las pencas',
            },
            infoFactura: {
              fechaEmision: moment().format('DD/MM/YYYY'),
              dirEstablecimiento: 'Camino del tejar 4-30 camino a las pencas',
              obligadoContabilidad: 'NO',
              tipoIdentificacionComprador: tipoIdenComp,
              razonSocialComprador: venta.cliente.nombre,
              identificacionComprador: venta.cliente.ruc,
              direccionComprador: venta.cliente.direccion,
              totalSinImpuestos: Number(venta.subtotal_sin_iva.toFixed(2)),
              totalDescuento: 0,
              totalConImpuestos: {
                totalImpuesto: [
                  {
                    codigo: 2,
                    codigoPorcentaje: 0,
                    baseImponible: Number(venta.subtotal_sin_iva.toFixed(2)),
                    valor: Number(venta.subtotal_con_iva.toFixed(2)),
                  },
                ],
              },
              propina: 0,
              importeTotal: Number(venta.total.toFixed(2)),
              moneda: 'DOLAR',
              pagos: {
                pago: [
                  {
                    formaPago: '01',
                    total: Number(venta.total.toFixed(2))
                  }
                ]
              }
            },
            detalles: {
              detalle: arrDetalle
            },
          },
        };
        
        const tipoInfo = 'infoFactura';
        const tipoComprobante: TipoComprobanteI = "factura"   

          estructuraFactura[tipoComprobante].infoTributaria.claveAcceso =
          this.p_obtener_codigo_autorizacion_desde_comprobante(tipoComprobante, tipoInfo ,estructuraFactura);

          this._claveAcceso = estructuraFactura[tipoComprobante].infoTributaria.claveAcceso;

        const x2js = new X2JS({ useDoubleQuotes: true });
        let xmlAsStr = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlAsStr += x2js.js2xml(estructuraFactura);
        resolve(xmlAsStr);
        return;
      
    });
  }
  p_generar_nota_credito_xml(secuencial: string, venta: Venta, cliente: Cliente,arrDetalle: DetNotaCreditoProducto[], motivo: string, fechaEmi: any) {
    
    console.log('No se asigno nuevamente la cedula')
    let tipoIdenComp = '';
    (cliente.ruc.length === 10) ? tipoIdenComp = '05' : tipoIdenComp = '04';

    return new Promise<any>( async (resolve, reject) => {
        const estructuraNota = {
          notaCredito: {
            _id: "comprobante",
            _version: "1.0.0",
            infoTributaria: {
              ambiente: '2',
              tipoEmision: '1',
              razonSocial: 'MORAN VIDAL JUAN PABLO',
              nombreComercial: 'AZUDIST',
              ruc: '0103663357001',
              claveAcceso: '',
              codDoc: '04',
              estab: '001',
              ptoEmi: '100',
              secuencial: secuencial, //secuencial
              dirMatriz: 'Camino del tejar 4-30 camino a las pencas',
            },
            infoNotaCredito: {
              fechaEmision: moment().format('DD/MM/YYYY'),
              dirEstablecimiento: 'Camino del tejar 4-30 camino a las pencas',
              tipoIdentificacionComprador: tipoIdenComp,
              razonSocialComprador: cliente.nombre,
              identificacionComprador: cliente.ruc,
              obligadoContabilidad: 'NO',
              codDocModificado: '01',
              numDocModificado: venta.numeroFactura,
              fechaEmisionDocSustento: moment(fechaEmi).format('DD/MM/YYYY'),
              totalSinImpuestos: venta.subtotal_sin_iva.toFixed(2),
              valorModificacion: venta.total.toFixed(2),
              moneda: 'DOLAR',
              totalConImpuestos: {
                totalImpuesto: [
                  {
                    codigo: 2,
                    codigoPorcentaje: 0,
                    baseImponible: Number(venta.subtotal_sin_iva.toFixed(2)),
                    valor: Number(venta.subtotal_con_iva.toFixed(2)),
                  },
                ],
              },
              motivo: motivo,
            },
            detalles: {
              detalle: arrDetalle
            }
          },
        };
        
        const tipoInfo = 'infoNotaCredito';
        const tipoComprobante: TipoComprobanteI = "notaCredito"   

          estructuraNota[tipoComprobante].infoTributaria.claveAcceso =
          this.p_obtener_codigo_autorizacion_desde_comprobante(tipoComprobante, tipoInfo,estructuraNota);

          this._claveAcceso = estructuraNota[tipoComprobante].infoTributaria.claveAcceso;

        const x2js = new X2JS({ useDoubleQuotes: true });
        let xmlAsStr = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlAsStr += x2js.js2xml(estructuraNota);
        resolve(xmlAsStr);
        return;
      
    });
  }



  p_comprobar_numero_cedula(cedula) {
    if (
      typeof cedula == "string" &&
      cedula.length == 10 &&
      /^\d+$/.test(cedula)
    ) {
      const digitos = cedula.split("").map(Number);
      const codigo_provincia = digitos[0] * 10 + digitos[1];

      if (codigo_provincia >= 1 && codigo_provincia <= 24 && digitos[2] < 6) {
        const digito_verificador = digitos.pop();

        const digito_calculado =
          digitos.reduce((valorPrevio, valorActual, indice) => {
            return (
              valorPrevio -
              ((valorActual * (2 - (indice % 2))) % 9) -
              (valorActual == 9 ? 1 : 0) * 9
            );
          }, 1000) % 10;
        return digito_calculado === digito_verificador;
      }
    }
    return false;
  }

  private p_calcular_digito_modulo11(numero: any) {
    let digito_calculado = -1;

    if (typeof numero == "string" && /^\d+$/.test(numero)) {
      const digitos = numero.split("").map(Number); //arreglo con los dígitos del número
    
      digito_calculado =
        11 -
        (digitos.reduce(function (valorPrevio, valorActual, indice) {
          return valorPrevio + valorActual * (7 - (indice % 6));
        }, 0) %
          11);

      digito_calculado = digito_calculado == 11 ? 0 : digito_calculado; //según ficha técnica
      digito_calculado = digito_calculado == 10 ? 1 : digito_calculado; //según ficha técnica
    }
    
    return digito_calculado;
  }


  p_obtener_secuencial(tipo_comprobante: TipoComprobanteI) {
    if (this.infoTributaria) {
      return this.infoTributaria.secuencial[tipo_comprobante];
    } else {
      return 0
    }
  }

  p_obtener_codigo_autorizacion_desde_comprobante(tipoComprobante: TipoComprobanteI, tipoInfo: string,comprobante: any) {
    // const tipoComprobante: TipoComprobanteI = Object.keys(comprobante)[0];
    const codigoAutorizacion = this.p_obtener_codigo_autorizacion(
      moment(comprobante[tipoComprobante][tipoInfo].fechaEmision, "DD/MM/YYYY"), //fechaEmision
      tipoComprobante, //tipoComprobante
      comprobante[tipoComprobante].infoTributaria.ruc, //ruc
      comprobante[tipoComprobante].infoTributaria.ambiente, //ambiente
      comprobante[tipoComprobante].infoTributaria.estab, //estab
      comprobante[tipoComprobante].infoTributaria.ptoEmi, //ptoEmi
      comprobante[tipoComprobante].infoTributaria.secuencial, //secuencial
      comprobante[tipoComprobante].infoTributaria.tipoEmision, //tipoEmision
      //  null, //codigo
    );

    return codigoAutorizacion;
  }

  p_obtener_codigo_autorizacion( 
            fechaEmision: any = new Date(), 
            tipoComprobante: TipoComprobanteI = 'factura', //1 factura, 4 nota de crédito, 5 nota de débito, 6 guía de remisión, 7 retención
            ruc =  "9999999999999",
            ambiente = 1, // 1 pruebas, 2 produccion, 
            estab = 1, ptoEmi = 1, 
            secuencial = this.p_obtener_secuencial(tipoComprobante),
            tipoEmision = 1,
            codigo =  moment(fechaEmision).format("DDMM") +
            this.pad(secuencial, 4).slice(-3) +
            this.p_calcular_digito_modulo11(
              moment(fechaEmision).format("DDMM") +
                this.pad(secuencial, 3).slice(-3)
            ),
            
            ) {
           
    let codigo_autorizacion =
      moment(fechaEmision).format("DDMMYYYY") +
      this.pad(this.codDoc[tipoComprobante], 2) +
      this.pad(ruc, 13) +
      this.pad(ambiente, 1) +
      this.pad(estab, 3) +
      this.pad(ptoEmi, 3) +
      this.pad(secuencial, 9) +
      this.pad(codigo, 8) +
      this.pad(tipoEmision, 1);     

      //0901202301010289812900110011000000000500901050912 factura profe
      //150120230101036633570012001100000000042342390451  factura alex
      //150120230101028981290011001100000000050090105091  factura prueba
      //codigo_autorizacion = '150120230101036633570012001100000000045342390451';
      const digito_calculado = this.p_calcular_digito_modulo11(codigo_autorizacion);
      if (digito_calculado > -1) {
        return codigo_autorizacion + digito_calculado;
      }

  }

  private pad(n: any, width: any, z = "0") {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }


}
