export interface REQUEST_VALIDAR_COMPROBANTE_XML {
    xmlBase64: string;
    firmaP12: string;
    passFirma: string;
    tipoDocumento: string;
}

export type REQUEST_FIRMAR_XML = REQUEST_VALIDAR_COMPROBANTE_XML;
export type RESPONSE_FIRMAR_XML = RESPONSE_VALIDAR_COMPROBANTE_XML;

export interface XADESComprobanteI {
    xmlFirmado: string
    claveAcceso: string
}

export interface RESPONSE_VALIDAR_COMPROBANTE_XML {
    ok: boolean;
    error?: any;
    data?: XADESComprobanteI
}

export interface RESPONSE_EMITIR_COMPROBANTE_XML {
    ok: boolean;
    error?: any;
    data?: any
}

export interface REQUEST_GET_AUTORIZACION_COMPROBANTE {
    claveAcceso: string;
    ambiente: 1 | 2;
}

export interface RESPONSE_GET_AUTORIZACION {
    ok: boolean;
    error?: any
    data?: {
       claveAcceso?: string;
       ambiente: 1 | 2;
       sriResponse: any;
    }
}
