export interface autorizaComprobante {
    ok:   boolean;
    data: Data;
}

interface Data {
    ambiente:    number;
    sriResponse: SriResponse;
}

interface SriResponse {
    respuestaAutorizacionComprobante: RespuestaAutorizacionComprobante;
}

interface RespuestaAutorizacionComprobante {
    claveAccesoConsultada: string[];
    numeroComprobantes:    string[];
    autorizaciones:        Autorizacione[];
}

interface Autorizacione {
    autorizacion: Autorizacion[];
}

interface Autorizacion {
    estado:             string[];
    numeroAutorizacion: string[];
    fechaAutorizacion:  Date[];
    ambiente:           string[];
    comprobante:        string[];
    mensajes:           string[];
}
