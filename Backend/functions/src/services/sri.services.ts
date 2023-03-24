import {REQUEST_GET_AUTORIZACION_COMPROBANTE, RESPONSE_GET_AUTORIZACION} from "../models";
const axios = require("axios");
const xml2js = require("xml2js");

export class SRIService {
  urlWsSri = {
    production: "https://cel.sri.gob.ec/comprobantes-electronicos-ws/",
    test: "https://celcer.sri.gob.ec/comprobantes-electronicos-ws/",
    services: {
      recepcion: "RecepcionComprobantesOffline?wsdl",
      autorizacion: "AutorizacionComprobantesOffline?wsdl",
    },
  };

  emitirComprobante(request: REQUEST_EMITIR_FACTURA_SRI): Promise<RESPONSE_EMITIR_FACTURA_SRI> {
    return new Promise((resolve) => {
      const respuesta: RESPONSE_EMITIR_FACTURA_SRI = {ok: false};
      try {
        let url = request.ambiente === 2 ? this.urlWsSri.production : this.urlWsSri.test;
        url = url + this.urlWsSri.services.recepcion;
        const requestSri = `
                        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.recepcion">
                        <soapenv:Header/>
                            <soapenv:Body>
                            <ec:validarComprobante>
                                <!--Optional:-->
                                <xml>${request.xmlFirmadoBase64}</xml>
                            </ec:validarComprobante>
                        </soapenv:Body>
                        </soapenv:Envelope>`;
        axios.post(
            url,
            requestSri,
            {"Content-Type": "text/xml; charset=utf-8",
              "soapAction": "",
            }
        )
            .then((res: any) => {
              let respuestaRecepcionComprobante: string;
              try {
                respuestaRecepcionComprobante = res.data.split("<RespuestaRecepcionComprobante>")[1];
                respuestaRecepcionComprobante = respuestaRecepcionComprobante.split("</RespuestaRecepcionComprobante>")[0];
                respuestaRecepcionComprobante = "<respuestaRecepcionComprobante>" + respuestaRecepcionComprobante + "</respuestaRecepcionComprobante>";
              } catch (error) {
                respuestaRecepcionComprobante = res.data;
              }
              xml2js.parseString(respuestaRecepcionComprobante, (error: any, result: RESPONSE_SRI_JSON) => {
                if (error) {
                  console.log("error -> ", error);
                  respuesta.error = error;
                  resolve(respuesta);
                  return;
                }
                respuesta.data = {
                  ambiente: request.ambiente,
                  claveAcceso: request.claveAcceso,
                  sriResponse: result,
                };
                respuesta.ok = true;
                resolve(respuesta);
                return;
              });
            })
            .catch((error: any) => {
              console.log("sri error -> ", error);
              respuesta.error = error;
              resolve(respuesta);
              return;
            });
      } catch (error) {
        respuesta.error = error;
        resolve(respuesta);
        return;
      }
    });
  }

  getAutorizacionSRI(data: REQUEST_GET_AUTORIZACION_COMPROBANTE): Promise<RESPONSE_GET_AUTORIZACION> {
    return new Promise((resolve, reject) => {
      const respuesta: RESPONSE_GET_AUTORIZACION = {ok: false};
      try {
        console.log(" getAutorizacionSRI -> ", data);
        let url = ( + data.ambiente ) == 2 ? this.urlWsSri.production : this.urlWsSri.test;
        url = url + this.urlWsSri.services.autorizacion;
        const requestSri = `
                  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ec="http://ec.gob.sri.ws.autorizacion">
                      <soapenv:Header/>
                      <soapenv:Body>
                          <ec:autorizacionComprobante>
                              <claveAccesoComprobante>${data.claveAcceso}</claveAccesoComprobante>
                          </ec:autorizacionComprobante>
                      </soapenv:Body>
                  </soapenv:Envelope>`;
        axios.post(
            url,
            requestSri,
            {
              //   'Content-Type': 'text/xml; charset=utf-8',
              //   'soapAction': '',
            })
            .then((res: any) => {
              let respuestaAutorizacionComprobante: string;
              try {
                respuestaAutorizacionComprobante = res.data.split("<RespuestaAutorizacionComprobante>")[1];
                respuestaAutorizacionComprobante = respuestaAutorizacionComprobante.split("</RespuestaAutorizacionComprobante>")[0];
                respuestaAutorizacionComprobante = "<respuestaAutorizacionComprobante>" + respuestaAutorizacionComprobante + "</respuestaAutorizacionComprobante>";
              } catch (error) {
                respuestaAutorizacionComprobante = res.data;
              }
              xml2js.parseString(respuestaAutorizacionComprobante, (error: any, result: RESPONSE_SRI_AUTORIZACION_JSON) => {
                if (error) {
                  console.log("error -> ", error);
                  respuesta.error = error;
                  resolve(respuesta);
                  return;
                }
                respuesta.data = {
                  ambiente: ( + data.ambiente ) as 1 | 2,
                  sriResponse: result,
                };
                respuesta.ok = true;
                resolve(respuesta);
                return;
              });
            })
            .catch((error: any) => {
              console.log("sri error -> ", error);
              respuesta.error = error;
              resolve(respuesta);
              return;
            });
      } catch (error) {
        respuesta.error = error;
        resolve(respuesta);
        return;
      }
    });
  }
}


interface REQUEST_EMITIR_FACTURA_SRI {
    xmlFirmadoBase64: string;
    ambiente: 1 | 2;
    claveAcceso: string;
}

interface RESPONSE_EMITIR_FACTURA_SRI {
    ok: boolean;
    error?: any
    data?: {
       ambiente: 1 | 2;
       sriResponse: any;
       claveAcceso: string;
    }
}


interface RESPONSE_SRI_JSON {
    "soap:Envelope": {
      "$": {
        "xmlns:soap": string;
      };
      "soap:Body": {
        "ns2:validarComprobanteResponse": {
          "$": {
            "xmlns:ns2": string;
          };
          RespuestaRecepcionComprobante: {
            comprobantes: {
                comprobante: {
                    claveAcceso: string[];
                    mensajes: {
                        mensaje: {
                            identificador: string[];
                            informacionAdicional: string[];
                            mensaje: string[];
                            tipo: string[];
                        }[]
                    }[]

                }
            }[];
            estado: string[];
          }[]
        }[]
      }[]
    }
}

interface RESPONSE_SRI_AUTORIZACION_JSON {
    "soap:Envelope": {
      "$": {
        "xmlns:soap": string;
      };
      "soap:Body": {
        "ns2:autorizacionComprobanteResponse": {
          "$": {
            "xmlns:ns2": string;
          };
          RespuestaAutorizacionComprobante: {
            claveAccesoConsultada: string[];
            numeroComprobantes: string[];
            autorizaciones: {
                autorizacion: {
                    ambiente: string[];
                    comprobante: string[];
                    estado: string[];
                    fechaAutorizacion: string[];
                    mensajes: {
                        mensaje: {
                            identificador: string[];
                            informacionAdicional: string[];
                            mensaje: string[];
                            tipo: string[];
                        }[]
                    }[]
                }[]
            }[];
          }[]
        }[]
      }[]
    }
}

