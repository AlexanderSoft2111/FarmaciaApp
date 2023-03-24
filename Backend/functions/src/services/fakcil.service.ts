import {REQUEST_GET_AUTORIZACION_COMPROBANTE, REQUEST_VALIDAR_COMPROBANTE_XML, RESPONSE_EMITIR_COMPROBANTE_XML, RESPONSE_FIRMAR_XML, RESPONSE_GET_AUTORIZACION} from "../models";
import {FirmarService} from "./firmar.service";
import {SRIService} from "./sri.services";
const Buffer = require("buffer/").Buffer;
const Request = require("request").defaults({encoding: null});
const {DOMParser} = require("xmldom");


export class FakcilService {
  private firmarService = new FirmarService();
  private sriService = new SRIService();

  validarComprobanteXml(request: REQUEST_VALIDAR_COMPROBANTE_XML): Promise<RESPONSE_EMITIR_COMPROBANTE_XML> {
    return new Promise( async (resolve) => {
      const respuesta: RESPONSE_EMITIR_COMPROBANTE_XML = {ok: false};
      if (request.firmaP12 && request.passFirma && request.xmlBase64) {
        const res_firmarComprobante = await this.firmarComprobante(request.firmaP12, request.passFirma, request.xmlBase64, request.tipoDocumento);
        console.log("firmarComprobante res -> ", res_firmarComprobante.ok);
        if (res_firmarComprobante.ok) {
          respuesta.data = res_firmarComprobante.data;
          const xmlFirmadoBase64 = this.btoa(res_firmarComprobante.data.xmlFirmado);
          const parser = new DOMParser();
          const xml = this.atob(request.xmlBase64);
          const xmlDoc = parser.parseFromString(xml, "text/xml");
          const ambienteXml = xmlDoc.getElementsByTagName("ambiente")[0].childNodes[0].nodeValue;
          const ambiente = ambienteXml == "1" ? 1 : 2;
          const res_emitirComprobante = await this.sriService.emitirComprobante({xmlFirmadoBase64, ambiente, claveAcceso: res_firmarComprobante.data.claveAcceso});
          if (res_emitirComprobante.ok) {
            respuesta.ok = true;
            respuesta.data = res_emitirComprobante.data;
          } else {
            respuesta.error = res_emitirComprobante.error;
          }
        } else {
          respuesta.error = res_firmarComprobante.error;
        }
      } else {
        respuesta.error = "Argumentos inválidos, los campos requeridos son: firmaP12, passFirma, xmlBase64";
      }
      console.log("respuesta validarComprobanteXml -> ", respuesta);
      resolve(respuesta);
      return;
    });
  }

  autorizacionComprobante(request: REQUEST_GET_AUTORIZACION_COMPROBANTE): Promise<RESPONSE_GET_AUTORIZACION> {
    return new Promise( async (resolve) => {
      const respuesta: RESPONSE_GET_AUTORIZACION = {ok: false};
      const res_getAutorizacion = await this.sriService.getAutorizacionSRI(request);
      if (res_getAutorizacion.ok) {
        respuesta.ok = true;
        respuesta.data = res_getAutorizacion.data;
      } else {
        respuesta.error = res_getAutorizacion.error;
      }
      resolve(respuesta);
      return;
    });
  }

  firmarComprobante(firmaP12: string, passFirma: string, xmlBase64: string, tipoDocumento: string): Promise<RESPONSE_FIRMAR_XML> {
    return new Promise( async (resolve, reject) => {
      const respuesta: RESPONSE_FIRMAR_XML = {ok: false};
      try {
        const xml = this.atob(xmlBase64);
        let base64P12: string;
        if (firmaP12.search("http") == 0) {
          base64P12 = await this.urlToBase64(firmaP12);
        } else {
          base64P12 = firmaP12.split(",").length ? firmaP12.split(",")[1] : firmaP12;
        }
        const responseXADES = await this.firmarService.generarXADESComprobante(base64P12, passFirma, xml, tipoDocumento);
        if (!responseXADES.ok) {
          respuesta.error = responseXADES.error;
          resolve(respuesta);
          return;
        }
        respuesta.data = responseXADES.data;
        respuesta.ok = true;
        resolve(respuesta);
        return;
      } catch (error) {
        respuesta.error = error;
        resolve(respuesta);
        return;
      }
    });
  }

  private atob(base64: any) {
    const ascii = Buffer.from(base64, "base64").toString("ascii");
    return ascii;
  }

  private btoa(datosbinarios: any): string {
    const base64 = Buffer.from(datosbinarios).toString("base64");
    return base64;
  }

  private urlToBase64(url: any): Promise<string> {
    return new Promise((resolve, reject) => {
      return Request.get({uri: url}, (error: any, response: any, body: any) => {
        if (!error && response.statusCode == 200) {
          const data = this.btoa(body);
          resolve(data);
          return;
        }
      });
    });
  }
}


