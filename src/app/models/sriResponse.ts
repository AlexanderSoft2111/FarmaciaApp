export interface ComprobanteRecibidoSri {
    ok:   boolean;
    data: Data;
}

export interface Data {
    ambiente:    number;
    claveAcceso: string;
    sriResponse: SriResponse;
}

interface SriResponse {
    respuestaRecepcionComprobante: RespuestaRecepcionComprobante;
}

interface RespuestaRecepcionComprobante {
    estado:       string[];
    comprobantes: string[];
}

