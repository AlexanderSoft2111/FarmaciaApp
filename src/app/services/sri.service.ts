import { Injectable } from '@angular/core';
import { DatosUserAzudist, TipoComprobanteI } from '../models/models';
import { Subscription } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { VentaService } from './venta.service';
import { InteraccionService } from './interaccion.service';
import * as moment from 'moment';

declare const X2JS: any;

@Injectable({
  providedIn: 'root'
})
export class SriService {

  
  infoTributaria: DatosUserAzudist;
  subscriberInfo: Subscription

  private codDoc = {
    factura: 1,
    comprobanteRetencion: 7,
    guiaRemision: 6,
    notaCredito: 4,
    notaDebito: 5,
  };

  private tipoIdentificacionComprador = {
    ruc: '04',
    cedula: '05',
    pasaporte: '06',
    consumidor_final: '07',
    id_exterior: '08'
  }

  tipoImpuesto = {
    IVA: '2',
    ICE: '3',
    IRBPNR: '5'
  }

  tarifaIVA = {
    0: '0',
    12: '2',
    14: '3',
    NoObjetodeImpuesto: 6,
    ExentodeIVA: 7,
    IVAdiferenciado: 8
  }
  
  private path = "";

  constructor(private firestoreService: FirestoreService,
              private ventaService: VentaService,
              private interaccionService: InteraccionService) {
              this.loadInfoTributaria();
              }
  
  p_generar_factura_xml() {
    return new Promise<any>( async (resolve, reject) => {
        const estructuraFactura = {
          factura: {
            _id: "comprobante",
            _version: "1.0.0",
            infoTributaria: {
              ambiente: '1',
              tipoEmision: '1',
              razonSocial: 'Azudist',
              nombreComercial: 'Prueba Aazudist',
              ruc: '0107563323001',
              claveAcceso: '2110201101179214673900110020010000000011234567813',
              codDoc: '01',
              estab: '002',
              ptoEmi: '001',
              secuencial: '000000001',
              dirMatriz: 'Enrique Guerrero Portilla OE1-34 AV. Galo Plaza Lasso',
            },
            // infoFactura: {},
            // infoAdicional: {},
            // detalles: {},
            infoFactura: {
              fechaEmision: '21/10/2012',
              dirEstablecimiento: 'Sebastián Moreno S/N Francisco García',
              contribuyenteEspecial: '',
              obligadoContabilidad: 'SI',
              tipoIdentificacionComprador: '04',
              guiaRemision: 'null',
              razonSocialComprador: '>PRUEBAS SERVICIO DE RENTAS INTERNAS',
              identificacionComprador: '1713328506001',
              direccionComprador: 'salinas y santiago',
              totalSinImpuestos: 30,
              totalDescuento: 1.20,
              totalConImpuestos: {
                totalImpuesto: [
                  {
                    codigo: 2,
                    codigoPorcentaje: 2,
                    //descuentoAdicional:null,
                    baseImponible: null,
                    valor: null,
                  },
                  {
                    codigo: 3,
                    codigoPorcentaje: 3072,
                    baseImponible: null,
                    valor: null,
                  },
                  {
                    codigo: 5,
                    codigoPorcentaje: 5001,
                    baseImponible: null,
                    valor: null,
                  },
                ],
              },
              propina: 0,
              importeTotal: 40,
              moneda: 'DOLAR',
            },
            detalles: {
              detalle: [
                {
                  codigoPrincipal: null, //opcional
                  codigoAuxiliar: null, //obliatorio cuando corresponda
                  descripcion: null,
                  cantidad: null,
                  precioUnitario: null,
                  descuento: null,
                  precioTotalSinImpuesto: null,
                  detallesAdicionales: {
                    detAdicional: [
                      {
                        _nombre: "",
                        _valor: "",
                      },
                    ],
                  },
    
                  impuestos: {
                    impuesto: [ 
                        {
                          codigo: 2,
                          codigoPorcentaje: 2,
                          tarifa: 12,
                          baseImponible: null,
                          valor: null,
                        },
                        {
                          codigo: 3,
                          codigoPorcentaje: 3072,
                          tarifa: 5,
                          baseImponible: null,
                          valor: null,
                        },
                        {
                          codigo: 5,
                          codigoPorcentaje: 5001,
                          tarifa: 0.02,
                          baseImponible: null,
                          valor: null,
                        },
                      ],
                    },
                  },
              ],
            },
            infoAdicional: {
              campoAdicional: [
                  {
                    _nombre: "Codigo Impuesto ISD",
                    __text: 4580,
                  },
                  {
                    _nombre: "Impuesto ISD",
                    __text: "15.42x",
                  },
                //<campoAdicional nombre="Codigo Impuesto ISD">4580</campoAdicional> //Obligatorio cuando corresponda
                //<campoAdicional nombre="Impuesto ISD">15.42x</campoAdicional> //Obligatorio cuando corresponda
              ],
            },
            pagos: {
              pago: []
            }
          },
        };
    
        /* const tipoComprobante: TipoComprobanteI = "factura";
        let valid = false;
        valid = await this.setInfoTributaria(estructuraFactura[tipoComprobante].infoTributaria);
        if (!valid) { resolve(null); return;} 
        valid = await this.setInfoFacturaVendedor(estructuraFactura[tipoComprobante].infoFactura);
        if (!valid) { resolve(null); return;} 
        valid = await this.setInfoFacturaComprador(estructuraFactura[tipoComprobante].infoFactura);
        if (!valid) { resolve(null); return;} 
        valid = await this.setInfoFacturaVenta(estructuraFactura[tipoComprobante].infoFactura);
        if (!valid) { resolve(null); return;} 
        valid = await this.setDetallesFactura(estructuraFactura[tipoComprobante].detalles);
        if (!valid) { resolve(null); return;} 
        valid = await this.setImpuestosFactura(estructuraFactura[tipoComprobante].impuestos);
        if (!valid) { resolve(null); return;} 
        valid = await this.setPagosFactura(estructuraFactura[tipoComprobante].pagos);
        if (!valid) { resolve(null); return;}  */
        
        
        
        /*  estructuraFactura[tipoComprobante].infoTributaria.claveAcceso =
          this.p_obtener_codigo_autorizacion_desde_comprobante(tipoComprobante, estructuraFactura);
      */
        console.log('estructuraFactura -> ', estructuraFactura);
        const x2js = new X2JS({ useDoubleQuotes: true });
        let xmlAsStr = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlAsStr += x2js.js2xml(estructuraFactura);
        resolve(estructuraFactura);
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

  private getRandomInt() {
    return Math.floor(Math.random() * 10000) + 1;
  }

  p_obtener_secuencial(tipo_comprobante: TipoComprobanteI) {
    if (this.infoTributaria) {
      return this.infoTributaria.secuencial[tipo_comprobante];
    } else {
      return 0
    }
  }

  p_obtener_codigo_autorizacion_desde_comprobante(tipoComprobante: TipoComprobanteI, comprobante: any) {
    // const tipoComprobante: TipoComprobanteI = Object.keys(comprobante)[0];
    const codigoAutorizacion = this.p_obtener_codigo_autorizacion(
      moment(comprobante[tipoComprobante].infoFactura.fechaEmision, "DD/MM/YYYY"), //fechaEmision
      tipoComprobante, //tipoComprobante
      comprobante[tipoComprobante].infoTributaria.ruc, //ruc
      comprobante[tipoComprobante].infoTributaria.ambiente, //ambiente
      comprobante[tipoComprobante].infoTributaria.estab, //estab
      comprobante[tipoComprobante].infoTributaria.ptoEmi, //ptoEmi
      comprobante[tipoComprobante].infoTributaria.secuencial, //secuencial
      comprobante[tipoComprobante].infoTributaria.tipoEmision //tipoEmision
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

              
    const codigo_autorizacion =
      moment(fechaEmision).format("DDMMYYYY") +
      this.pad(this.codDoc[tipoComprobante], 2) +
      this.pad(ruc, 13) +
      this.pad(ambiente, 1) +
      this.pad(estab, 3) +
      this.pad(ptoEmi, 3) +
      this.pad(secuencial, 9) +
      this.pad(codigo, 8) +
      this.pad(tipoEmision, 1);     
      console.log('codigo_autorizacion -> ', codigo_autorizacion);
       
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


  async setInfoTributaria(varInfoTributaria: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const infoTributaria = await this.getInfoTributaria();
      if (infoTributaria) {
        console.log('infoTributaria -> ', infoTributaria);
        const tipoComprobante: TipoComprobanteI = "factura";
        const estab = infoTributaria.establecimiento;
        const ptoEmi = infoTributaria.ptoEmision;
        const ambiente = infoTributaria.ambiente ? infoTributaria.ambiente : '1'; //1 pruebas, 2 produccion
        varInfoTributaria.ambiente =  ambiente; 
        varInfoTributaria.tipoEmision = 1; //1 emision normal
        varInfoTributaria.razonSocial = infoTributaria.razonSocial;
        varInfoTributaria.nombreComercial = infoTributaria.razonSocial;
        varInfoTributaria.ruc = infoTributaria.ruc;
        varInfoTributaria.claveAcceso = ""; //se lo llena más abajo
        varInfoTributaria.codDoc = this.pad(
          this.codDoc[tipoComprobante], 2 );
        varInfoTributaria.estab = this.pad(
          estab, 3);
        varInfoTributaria.ptoEmi = this.pad(
          ptoEmi, 3);
        varInfoTributaria.secuencial = this.pad(
          this.p_obtener_secuencial(tipoComprobante), 9);
        varInfoTributaria.dirMatriz = infoTributaria.dirMatriz
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información tributaria');
          resolve(false);
          return;
      }
    });
  }

  async setInfoFacturaVendedor(infoFactura: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const infoTributaria = await this.getInfoTributaria();
      if (infoTributaria) {
        infoFactura.fechaEmision = moment().format("DD/MM/YYYY");
        infoFactura.dirEstablecimiento = infoTributaria.dirEstablecimiento;
        // infoFactura.contribuyenteEspecial =  "5368";
        infoFactura.obligadoContabilidad = infoTributaria.obligadoContabilidad;
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información tributaria');
          resolve(false);
          return;
      }
    });
  }

  async setInfoFacturaComprador(varInfoFactura: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const infoTributaria = await this.getInfoTributaria();
      if (infoTributaria) {
        const comprador = this.ventaService.venta.cliente;  
        varInfoFactura.tipoIdentificacionComprador =
          this.pad(comprador.tipoIdentificacionComprador.codigo, 2);
        varInfoFactura.razonSocialComprador = comprador.nombre;
        varInfoFactura.identificacionComprador = comprador.ruc;
        varInfoFactura.direccionComprador = comprador.direccion;
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información del comprador');
          resolve(false);
          return;
      }
    });

  }

  async setInfoFacturaVenta(varInfoFactura: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const infoTributaria = await this.getInfoTributaria();
      if (infoTributaria) {
        // varInfoFactura.guiaRemision = "001-001-000000001";
        const venta = this.ventaService.getVenta();
        varInfoFactura.totalSinImpuestos = (venta.total - venta.iva).toFixed(2);
        let descuento = 0;
        venta.productos.forEach( item => {
          if (item.descuento) {
            descuento = descuento + item.descuento;
          }
        });
        console.log(' varInfoFactura.totalDescuento -> ', descuento);
        
        varInfoFactura.totalDescuento = descuento.toFixed(2);
        let index = 0;
        venta.productos.forEach( (item) => {
          if (item.type == 'iva') {
            varInfoFactura.totalConImpuestos.totalImpuesto[index] = {};
            varInfoFactura.totalConImpuestos.totalImpuesto[index].codigo = this.tipoImpuesto.IVA;
            varInfoFactura.totalConImpuestos.totalImpuesto[index].codigoPorcentaje = this.tarifaIVA[12];
            varInfoFactura.totalConImpuestos.totalImpuesto[index].tarifa = 12;
            //varInfoFactura.totalConImpuestos.totalImpuesto[index].valor = (item.impuesto).toFixed(2);
            varInfoFactura.totalConImpuestos.totalImpuesto[index].valor = (item.precio).toFixed(2);
            //varInfoFactura.totalConImpuestos.totalImpuesto[index].baseImponible = (item.subtotal_sinImpuestos).toFixed(2);
            varInfoFactura.totalConImpuestos.totalImpuesto[index].baseImponible = (item.precio).toFixed(2);
            index = index + 1;
          }
        }); 
        varInfoFactura.propina = "0.00";
        varInfoFactura.importeTotal = venta.total.toFixed(2);
        varInfoFactura.moneda = "DOLAR";
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información de la venta');
          resolve(false);
          return;
      }
    });

   
  }

  async setDetallesFactura(detalles: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const venta = this.ventaService.getVenta();
      if (venta) {
        // varInfoFactura.guiaRemision = "001-001-000000001";
        venta.productos.forEach( (item, index) => {
          detalles.detalle[index] = {};
          detalles.detalle[index].codigoPrincipal = item.producto.producto.codigo;
          detalles.detalle[index].codigoAuxiliar = item.producto.producto.codigo;
          detalles.detalle[index].descripcion = item.producto.descripcion;
          detalles.detalle[index].cantidad = item.cantidad;
          detalles.detalle[index].precioUnitario = item.producto.producto.precio_venta;
          detalles.detalle[index].descuento = item.descuento;
          detalles.detalle[index].precioTotalSinImpuesto = (item.precio).toFixed(2);
          // if (item.producto.type == 'iva') {
            // detalles.detalle[0].detallesAdicionales.detAdicional[0]._nombre
            // detalles.detalle[0].detallesAdicionales.detAdicional[0]._valor
            detalles.detalle[index].impuestos = {
              impuesto: [{}]
            };
            detalles.detalle[index].impuestos.impuesto[0].baseImponible = (item.precio).toFixed(2);
            detalles.detalle[index].impuestos.impuesto[0].valor = (item.precio).toFixed(2); 
          // }
        }); 
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información de la venta');
          resolve(false);
          return;
      }
    });

   
  }

  async setImpuestosFactura(impuestos: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const venta = this.ventaService.getVenta();
      if (venta) {
        let index = 0;
        venta.productos.forEach( (item) => {
          if (item.type == 'iva') {
            impuestos.impuesto[index] = {};
            impuestos.impuesto[index].baseImponible = (item.precio).toFixed(2);
            impuestos.impuesto[index].valor = (item.precio).toFixed(2); 
            index = index + 1;
          }
        }); 
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información de la venta');
          resolve(false);
          return;
      }
    });

   
  }

  async setPagosFactura(pagos: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const venta = this.ventaService.getVenta();
      if (venta) {
        //pagos.pago[0].formaPago = venta.forma_pago.codigo '';
        pagos.pago[0].formaPago = '';
        pagos.pago[0].total = (venta.total).toFixed(2); 
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información de pago');
          resolve(false);
          return;
      }
    });

   
  }

/*   async setInfoAdicionalFactura(infoAdicional: any): Promise<boolean> {
    return new Promise( async (resolve) => {
      const venta = this.ventaService.getVenta();
      if (venta) {
        pagos.pago[0].formaPago = venta.forma_pago.codigo;
        pagos.pago[0].total = (venta.total).toFixed(2); 
        resolve(true);
        return;
      } else {
          this.interaccionService.preguntaAlert('Error', 'No se ha podido cargar la información de pago');
          resolve(false);
          return;
      }
    });

   
  } */



  loadInfoTributaria(): Promise<DatosUserAzudist> {
    return new Promise( async (resolve) => {
        //const uid = await this.ventaService.getUidVenta();
        const uid = '1232908902183';
        const path = 'Usuarios/' + uid;
        this.subscriberInfo = this.firestoreService.getDocumentChanges<DatosUserAzudist>(path).subscribe( res => {
            if (res) {
                this.infoTributaria = res;
                resolve(this.infoTributaria);
                return;
            } else {
              resolve(null);
              return;
            }
        });
    });
  }

  getInfoTributaria(): Promise<DatosUserAzudist> {
     return new Promise( async (resolve) => {
            if (!this.infoTributaria) {
                const res = await this.loadInfoTributaria();
                resolve(res) 
                return;
            }
            resolve(this.infoTributaria);
            return;
     });
  }

  //console.log('XML: ', p_generar_factura_xml());

  // saveFile_noui(p_generar_factura_xml(), 'factura-'+moment().format('YYYYMMDD-hhmm')+'.xml', p_firmar_factura);

/*   p_firmar_factura(path) {
    // this.openFile(path, (factura) => {
    const factura = "";
    this.p_generar_xades_bes(factura, (factura_firmada, claveAcceso) => {
      console.log('factura_firmada:', factura_firmada);
      console.log('base 64 de factura firmada: ', forge.util.encode64(factura_firmada));
      // this.p_("xml").value = forge.util.encode64(factura_firmada);
      // this.p_("xmlcodigo").value = claveAcceso;
      // this.p_("factura").value = factura;
      // this.p_("factura_firmada").value = factura_firmada;
      // });
    });
  } */

/*   private sha1_base64(txt) {
    const md = forge.md.sha1.create();
    md.update(txt);
    return new Buffer(md.digest().toHex(), "hex").toString("base64");
  }

  private p_generar_xades_bes(factura, callback) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(factura, "text/xml");
    const claveAcceso =
      xmlDoc.getElementsByTagName("claveAcceso")[0].childNodes[0].nodeValue;

    const p12_path = "/home/yop/edgar_patricio_valarezo_vargas.p12";
    // const p12xxx = new File(p12_path, 'binary');
    const p12xxx = "";
    const pwdCert = "XXXXXXXXXXX";

    this.generarFirma(p12xxx, factura, pwdCert, (
            firma,
            certificado,
            modulus,
            firma_pem,
            certificado_pem,
            modulus_pem,
            certificateX509_der_hash,
            X509SerialNumber,
            exponent,
            issuerName ) => {
        const sha1_factura = this.sha1_base64(
          factura.replace('<?xml version="1.0" encoding="UTF-8"?>\n', "")
        );

        const xmlns =
          'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"';

        //numeros involucrados en los hash:
        const Certificate_number = this.p_obtener_aleatorio(); //1562780 en el ejemplo del SRI
        const Signature_number = this.p_obtener_aleatorio(); //620397 en el ejemplo del SRI
        const SignedProperties_number = this.p_obtener_aleatorio(); //24123 en el ejemplo del SRI

        //numeros fuera de los hash:
        const SignedInfo_number = this.p_obtener_aleatorio(); //814463 en el ejemplo del SRI
        const SignedPropertiesID_number = this.p_obtener_aleatorio(); //157683 en el ejemplo del SRI
        const Reference_ID_number = this.p_obtener_aleatorio(); //363558 en el ejemplo del SRI
        const SignatureValue_number = this.p_obtener_aleatorio(); //398963 en el ejemplo del SRI
        const Object_number = this.p_obtener_aleatorio(); //231987 en el ejemplo del SRI

        let SignedProperties = "";

        SignedProperties +=
          '<etsi:SignedProperties Id="Signature' +
          Signature_number +
          "-SignedProperties" +
          SignedProperties_number +
          '">'; //SignedProperties
        SignedProperties += "<etsi:SignedSignatureProperties>";
        SignedProperties += "<etsi:SigningTime>";

        SignedProperties += moment().format("YYYY-MM-DDTHH:mm:ssZ");

        SignedProperties += "</etsi:SigningTime>";
        SignedProperties += "<etsi:SigningCertificate>";
        SignedProperties += "<etsi:Cert>";
        SignedProperties += "<etsi:CertDigest>";
        SignedProperties +=
          '<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
        SignedProperties += "</ds:DigestMethod>";
        SignedProperties += "<ds:DigestValue>";

        SignedProperties += certificateX509_der_hash;

        SignedProperties += "</ds:DigestValue>";
        SignedProperties += "</etsi:CertDigest>";
        SignedProperties += "<etsi:IssuerSerial>";
        SignedProperties += "<ds:X509IssuerName>";
        SignedProperties += issuerName;
        SignedProperties += "</ds:X509IssuerName>";
        SignedProperties += "<ds:X509SerialNumber>";

        SignedProperties += X509SerialNumber;

        SignedProperties += "</ds:X509SerialNumber>";
        SignedProperties += "</etsi:IssuerSerial>";
        SignedProperties += "</etsi:Cert>";
        SignedProperties += "</etsi:SigningCertificate>";
        SignedProperties += "</etsi:SignedSignatureProperties>";
        SignedProperties += "<etsi:SignedDataObjectProperties>";
        SignedProperties +=
          '<etsi:DataObjectFormat ObjectReference="#Reference-ID-' +
          Reference_ID_number +
          '">';
        SignedProperties += "<etsi:Description>";

        SignedProperties += "contenido comprobante";

        SignedProperties += "</etsi:Description>";
        SignedProperties += "<etsi:MimeType>";
        SignedProperties += "text/xml";
        SignedProperties += "</etsi:MimeType>";
        SignedProperties += "</etsi:DataObjectFormat>";
        SignedProperties += "</etsi:SignedDataObjectProperties>";
        SignedProperties += "</etsi:SignedProperties>"; //fin SignedProperties

        const SignedProperties_para_hash = SignedProperties.replace(
          "<etsi:SignedProperties",
          "<etsi:SignedProperties " + xmlns
        );

        const sha1_SignedProperties = this.sha1_base64(
          SignedProperties_para_hash
        );

        let KeyInfo = "";

        KeyInfo += '<ds:KeyInfo Id="Certificate' + Certificate_number + '">';
        KeyInfo += "\n<ds:X509Data>";
        KeyInfo += "\n<ds:X509Certificate>\n";

        //CERTIFICADO X509 CODIFICADO EN Base64
        KeyInfo += certificado;

        KeyInfo += "\n</ds:X509Certificate>";
        KeyInfo += "\n</ds:X509Data>";
        KeyInfo += "\n<ds:KeyValue>";
        KeyInfo += "\n<ds:RSAKeyValue>";
        KeyInfo += "\n<ds:Modulus>\n";

        //MODULO DEL CERTIFICADO X509
        KeyInfo += modulus;

        KeyInfo += "\n</ds:Modulus>";
        KeyInfo += "\n<ds:Exponent>";

        //KeyInfo += 'AQAB';
        KeyInfo += exponent;

        KeyInfo += "</ds:Exponent>";
        KeyInfo += "\n</ds:RSAKeyValue>";
        KeyInfo += "\n</ds:KeyValue>";
        KeyInfo += "\n</ds:KeyInfo>";

        const KeyInfo_para_hash = KeyInfo.replace(
          "<ds:KeyInfo",
          "<ds:KeyInfo " + xmlns
        );

        const sha1_certificado = this.sha1_base64(KeyInfo_para_hash);

        let SignedInfo = "";

        SignedInfo +=
          '<ds:SignedInfo Id="Signature-SignedInfo' + SignedInfo_number + '">';
        SignedInfo +=
          '\n<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">';
        SignedInfo += "</ds:CanonicalizationMethod>";
        SignedInfo +=
          '\n<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1">';
        SignedInfo += "</ds:SignatureMethod>";
        SignedInfo +=
          '\n<ds:Reference Id="SignedPropertiesID' +
          SignedPropertiesID_number +
          '" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature' +
          Signature_number +
          "-SignedProperties" +
          SignedProperties_number +
          '">';
        SignedInfo +=
          '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";

        //HASH O DIGEST DEL ELEMENTO <etsi:SignedProperties>';
        SignedInfo += sha1_SignedProperties;

        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo +=
          '\n<ds:Reference URI="#Certificate' + Certificate_number + '">';
        SignedInfo +=
          '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";

        //HASH O DIGEST DEL CERTIFICADO X509
        SignedInfo += sha1_certificado;

        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo +=
          '\n<ds:Reference Id="Reference-ID-' +
          Reference_ID_number +
          '" URI="#comprobante">';
        SignedInfo += "\n<ds:Transforms>";
        SignedInfo +=
          '\n<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature">';
        SignedInfo += "</ds:Transform>";
        SignedInfo += "\n</ds:Transforms>";
        SignedInfo +=
          '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";

        //HASH O DIGEST DE TODO EL ARCHIVO XML IDENTIFICADO POR EL id="comprobante"
        SignedInfo += sha1_factura;

        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo += "\n</ds:SignedInfo>";

        const SignedInfo_para_firma = SignedInfo.replace(
          "<ds:SignedInfo",
          "<ds:SignedInfo " + xmlns
        );

        this.p_firmar(
          p12xxx,
          SignedInfo_para_firma,
          pwdCert,
          function (firma_SignedInfo) {
            let xades_bes = "";

            //INICIO DE LA FIRMA DIGITAL
            xades_bes +=
              "<ds:Signature " +
              xmlns +
              ' Id="Signature' +
              Signature_number +
              '">';
            xades_bes += "\n" + SignedInfo;

            xades_bes +=
              '\n<ds:SignatureValue Id="SignatureValue' +
              SignatureValue_number +
              '">\n';

            //VALOR DE LA FIRMA (ENCRIPTADO CON LA LLAVE PRIVADA DEL CERTIFICADO DIGITAL)
            xades_bes += firma_SignedInfo;

            xades_bes += "\n</ds:SignatureValue>";

            xades_bes += "\n" + KeyInfo;

            xades_bes +=
              '\n<ds:Object Id="Signature' +
              Signature_number +
              "-Object" +
              Object_number +
              '">';
            xades_bes +=
              '<etsi:QualifyingProperties Target="#Signature' +
              Signature_number +
              '">';

            //ELEMENTO <etsi:SignedProperties>';
            xades_bes += SignedProperties;

            xades_bes += "</etsi:QualifyingProperties>";
            xades_bes += "</ds:Object>";
            xades_bes += "</ds:Signature>";

            //FIN DE LA FIRMA DIGITAL

            callback(
              factura.replace("</factura>", xades_bes + "</factura>"),
              claveAcceso
            );
          }
        );
      }
    );
  }

  private generarFirma(p12File, infoAFirmar, pwdCert, callback2) {
    const pemMessagep7 = "";
    let certificateX509 = "";

    if (p12File !== undefined && infoAFirmar !== undefined) {
      const reader = new FileReader();
      let arrayBuffer = null;
      const resultReader = null;

      reader.readAsArrayBuffer(p12File);

      reader.onloadend = () => {
        arrayBuffer = reader.result;
        const arrayUint8 = new Uint8Array(arrayBuffer);
        const p12B64 = forge.util.binary.base64.encode(arrayUint8);
        const p12Der = forge.util.decode64(p12B64);
        const p12Asn1 = forge.asn1.fromDer(p12Der);

        let p12 = null;

        p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pwdCert);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const cert = certBags[forge.oids.certBag][0].cert;
        const pkcs8bags = p12.getBags({
          bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
        });
        const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0];
        let key = pkcs8.key;

        if (key == null) {
          key = pkcs8.asn1;
        }

        const md = forge.md.sha1.create();
        md.update(infoAFirmar, "utf8");
        const signature = btoa(key.sign(md))
          .match(/.{1,76}/g)
          .join("\n");

        const certificateX509_pem = forge.pki.certificateToPem(cert);

        certificateX509 = certificateX509_pem;
        certificateX509 = certificateX509.substr(certificateX509.indexOf("\n"));
        certificateX509 = certificateX509.substr(
          0,
          certificateX509.indexOf("\n-----END CERTIFICATE-----")
        );

        certificateX509 = certificateX509
          .replace(/\r?\n|\r/g, "")
          .replace(/([^\0]{76})/g, "$1\n");

        //Pasar certificado a formato DER y sacar su hash:
        const certificateX509_asn1 = forge.pki.certificateToAsn1(cert);
        const certificateX509_der = forge.asn1
          .toDer(certificateX509_asn1)
          .getBytes();
        const certificateX509_der_hash = this.sha1_base64(certificateX509_der);

        //Serial Number
        const X509SerialNumber = parseInt(cert.serialNumber, 16);

        const exponent = this.hexToBase64(key.e.data[0].toString(16));
        const modulus_pem = this.bigint2base64(key.n);

        const issuerName =
          cert.issuer.attributes[4].shortName +
          "=" +
          cert.issuer.attributes[4].value +
          ", " +
          cert.issuer.attributes[3].shortName +
          "=" +
          cert.issuer.attributes[3].value +
          ", " +
          cert.issuer.attributes[2].shortName +
          "=" +
          cert.issuer.attributes[2].value +
          ", " +
          cert.issuer.attributes[1].shortName +
          "=" +
          cert.issuer.attributes[1].value +
          ", ";

        callback2(
          signature,
          certificateX509,
          modulus_pem,
          signature,
          certificateX509_pem,
          modulus_pem,
          certificateX509_der_hash,
          X509SerialNumber,
          exponent,
          issuerName
        );
      };
    } else {
      if ($.isEmptyObject(p12File)) {
        const msg = "Debe seleccionar el archivo de certificado digital (.p12)";
        console.error(msg);
      }

      if ($.isEmptyObject(infoAFirmar)) {
        const msg = "No existe informacion a firmar";
        console.error(msg);
      }
    }

    return pemMessagep7;
  }

  private bigint2base64(bigint: any) {
    let base64 = "";
    base64 = btoa(
      bigint
        .toString(16)
        .match(/\w{2}/g)
        .map(function (a) {
          return String.fromCharCode(parseInt(a, 16));
        })
        .join("")
    );

    base64 = base64.match(/.{1,76}/g).join("\n");

    return base64;
  }

  private p_firmar(p12File, infoAFirmar, pwdCert, callback) {
    const reader = new FileReader();
    let arrayBuffer = null;
    const resultReader = null;
    let signature = "";

    reader.readAsArrayBuffer(p12File);

    reader.onloadend = () => {
      arrayBuffer = reader.result;
      const arrayUint8 = new Uint8Array(arrayBuffer);
      const p12B64 = forge.util.binary.base64.encode(arrayUint8);
      const p12Der = forge.util.decode64(p12B64);
      const p12Asn1 = forge.asn1.fromDer(p12Der);

      let p12 = null;

      p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pwdCert);

      const pkcs8bags = p12.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      });
      const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0];
      let key = pkcs8.key;
      if (key == null) {
        key = pkcs8.asn1;
      }

      const md = forge.md.sha1.create();
      md.update(infoAFirmar, "utf8");
      signature = btoa(key.sign(md))
        .match(/.{1,76}/g)
        .join("\n");

      callback(signature);
    };

    return;
  }

  private p_obtener_aleatorio() {
    return Math.floor(Math.random() * 999000) + 990;
  }

  private hexToBase64(str) {
    const hex = ("00" + str).slice(0 - str.length - (str.length % 2));

    return btoa(
      String.fromCharCode.apply(
        null,
        hex
          .replace(/\r|\n/g, "")
          .replace(/([\da-fA-F]{2}) ?/g, "0x$1 ")
          .replace(/ +$/, "")
          .split(" ")
      )
    );
  }

 */}
