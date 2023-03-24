import * as functions from "firebase-functions";
import {REQUEST_FIRMAR_XML, REQUEST_GET_AUTORIZACION_COMPROBANTE, REQUEST_VALIDAR_COMPROBANTE_XML, RESPONSE_FIRMAR_XML, RESPONSE_GET_AUTORIZACION, RESPONSE_VALIDAR_COMPROBANTE_XML} from "../models";
import {FakcilService} from "../services/fakcil.service";
const cors = require("cors")({
  origin: true,
});

const fakcilService = new FakcilService();

export const validarComprobanteXmlAPI = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    console.log("validarComprobanteXmlAPI");
    let respuesta: RESPONSE_VALIDAR_COMPROBANTE_XML = {ok: false};
    const data: REQUEST_VALIDAR_COMPROBANTE_XML = request.body;
    if (data) {
      respuesta = await fakcilService.validarComprobanteXml(data);
    } else {
      respuesta.error = "Data vacia";
    }
    response.status(200).send(respuesta);
  });
});

export const autorizacionComprobanteAPI = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    console.log("autorizacionComprobanteAPI");
    let respuesta: RESPONSE_GET_AUTORIZACION = {ok: false};
    const data: REQUEST_GET_AUTORIZACION_COMPROBANTE = request.body;
    if (data) {
      respuesta = await fakcilService.autorizacionComprobante(data);
    } else {
      respuesta.error = "Data vacia";
    }
    response.status(200).send(respuesta);
  });
});

export const firmarComprobanteAPI = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    console.log("autorizacionComprobanteAPI");
    let respuesta: RESPONSE_FIRMAR_XML = {ok: false};
    const data: REQUEST_FIRMAR_XML = request.body;
    if (data) {
      respuesta = await fakcilService.firmarComprobante(data.firmaP12, data.passFirma, data.xmlBase64, data.tipoDocumento);
    } else {
      respuesta.error = "Data vacia";
    }
    response.status(200).send(respuesta);
  });
});


export const testAPI = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    console.log(" testAPI");
    const respuesta = {
      data: true,
    };
    return response.status(200).send(respuesta);
  });
});
