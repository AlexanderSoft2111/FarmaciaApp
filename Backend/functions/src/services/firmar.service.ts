import {XADESComprobanteI} from "../models";
const {DOMParser} = require("xmldom");
const moment = require("moment");
const forge = require("node-forge");
const Buffer = require("buffer/").Buffer;
const bigintConversion = require("bigint-conversion");
const btoa = require("btoa");

export class FirmarService {
  generarXADESComprobante(base64P12: any, pwdP12: any, factura: any, tipoDocumento: string): Promise<RESPONSE_GenerarXADESComprobante> {
    return new Promise(async (resolve) => {
      const respuesta: RESPONSE_GenerarXADESComprobante = {ok: false};
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(factura, "text/xml");
        const claveAcceso = xmlDoc.getElementsByTagName("claveAcceso")[0].childNodes[0].nodeValue;
        const res_generarFirma = await this.generarFirma(base64P12, factura, pwdP12);
        if (!res_generarFirma.ok) {
          respuesta.error = res_generarFirma.error;
          resolve(respuesta);
          return;
        }
        const certificado = res_generarFirma.data.certificado;
        const modulus = res_generarFirma.data.modulus;
        const certificateX509_der_hash = res_generarFirma.data.certificateX509_der_hash;
        const X509SerialNumber = res_generarFirma.data.X509SerialNumber;
        const exponent = res_generarFirma.data.exponent;
        const issuerName = res_generarFirma.data.issuerName;

        // console.log('certificado -> ',certificado);
        // console.log('modulus -> ', modulus);
        // console.log('certificateX509_der_hash -> ', certificateX509_der_hash);
        // console.log('X509SerialNumber -> ', X509SerialNumber);
        // console.log('exponent -> ', exponent);
        // console.log('issuerName -> ', issuerName);

        const sha1_factura = this.sha1_base64(factura.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n", ""));
        const xmlns = "xmlns:ds=\"http://www.w3.org/2000/09/xmldsig#\" xmlns:etsi=\"http://uri.etsi.org/01903/v1.3.2#\"";
        // numeros involucrados en los hash:
        const Certificate_number = this.p_obtener_aleatorio(); // 1562780 en el ejemplo del SRI
        const Signature_number = this.p_obtener_aleatorio(); // 620397 en el ejemplo del SRI
        const SignedProperties_number = this.p_obtener_aleatorio(); // 24123 en el ejemplo del SRI
        // numeros fuera de los hash:
        const SignedInfo_number = this.p_obtener_aleatorio(); // 814463 en el ejemplo del SRI
        const SignedPropertiesID_number = this.p_obtener_aleatorio(); // 157683 en el ejemplo del SRI
        const Reference_ID_number = this.p_obtener_aleatorio(); // 363558 en el ejemplo del SRI
        const SignatureValue_number = this.p_obtener_aleatorio(); // 398963 en el ejemplo del SRI
        const Object_number = this.p_obtener_aleatorio(); // 231987 en el ejemplo del SRI
        let SignedProperties = "";
        SignedProperties += "<etsi:SignedProperties Id=\"Signature" + Signature_number + "-SignedProperties" + SignedProperties_number + "\">"; // SignedProperties
        SignedProperties += "<etsi:SignedSignatureProperties>";
        SignedProperties += "<etsi:SigningTime>";
        SignedProperties += moment().format();
        // SignedProperties += moment().format('YYYY-MM-DD\THH:mm:ssZ');
        SignedProperties += "</etsi:SigningTime>";
        SignedProperties += "<etsi:SigningCertificate>";
        SignedProperties += "<etsi:Cert>";
        SignedProperties += "<etsi:CertDigest>";
        SignedProperties += "<ds:DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\">";
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
        SignedProperties += "<etsi:DataObjectFormat ObjectReference=\"#Reference-ID-" + Reference_ID_number + "\">";
        SignedProperties += "<etsi:Description>";
        SignedProperties += "contenido comprobante";
        SignedProperties += "</etsi:Description>";
        SignedProperties += "<etsi:MimeType>";
        SignedProperties += "text/xml";
        SignedProperties += "</etsi:MimeType>";
        SignedProperties += "</etsi:DataObjectFormat>";
        SignedProperties += "</etsi:SignedDataObjectProperties>";
        SignedProperties += "</etsi:SignedProperties>"; // fin SignedProperties
        const SignedProperties_para_hash = SignedProperties.replace("<etsi:SignedProperties", "<etsi:SignedProperties " + xmlns);
        const sha1_SignedProperties = this.sha1_base64(SignedProperties_para_hash);
        let KeyInfo = "";
        KeyInfo += "<ds:KeyInfo Id=\"Certificate" + Certificate_number + "\">";
        KeyInfo += "\n<ds:X509Data>";
        KeyInfo += "\n<ds:X509Certificate>\n";
        // CERTIFICADO X509 CODIFICADO EN Base64
        KeyInfo += certificado;
        KeyInfo += "\n</ds:X509Certificate>";
        KeyInfo += "\n</ds:X509Data>";
        KeyInfo += "\n<ds:KeyValue>";
        KeyInfo += "\n<ds:RSAKeyValue>";
        KeyInfo += "\n<ds:Modulus>\n";
        // MODULO DEL CERTIFICADO X509
        KeyInfo += modulus;
        KeyInfo += "\n</ds:Modulus>";
        KeyInfo += "\n<ds:Exponent>";
        // KeyInfo += 'AQAB';
        KeyInfo += exponent;
        KeyInfo += "</ds:Exponent>";
        KeyInfo += "\n</ds:RSAKeyValue>";
        KeyInfo += "\n</ds:KeyValue>";
        KeyInfo += "\n</ds:KeyInfo>";
        const KeyInfo_para_hash = KeyInfo.replace("<ds:KeyInfo", "<ds:KeyInfo " + xmlns);
        const sha1_certificado = this.sha1_base64(KeyInfo_para_hash);
        let SignedInfo = "";
        SignedInfo += "<ds:SignedInfo Id=\"Signature-SignedInfo" + SignedInfo_number + "\">";
        SignedInfo += "\n<ds:CanonicalizationMethod Algorithm=\"http://www.w3.org/TR/2001/REC-xml-c14n-20010315\">";
        SignedInfo += "</ds:CanonicalizationMethod>";
        SignedInfo += "\n<ds:SignatureMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#rsa-sha1\">";
        SignedInfo += "</ds:SignatureMethod>";
        SignedInfo += "\n<ds:Reference Id=\"SignedPropertiesID" + SignedPropertiesID_number + "\" Type=\"http://uri.etsi.org/01903#SignedProperties\" URI=\"#Signature" + Signature_number + "-SignedProperties" + SignedProperties_number + "\">";
        SignedInfo += "\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\">";
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";
        // HASH O DIGEST DEL ELEMENTO <etsi:SignedProperties>';
        SignedInfo += sha1_SignedProperties;
        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo += "\n<ds:Reference URI=\"#Certificate" + Certificate_number + "\">";
        SignedInfo += "\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\">";
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";
        // HASH O DIGEST DEL CERTIFICADO X509
        SignedInfo += sha1_certificado;
        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo += "\n<ds:Reference Id=\"Reference-ID-" + Reference_ID_number + "\" URI=\"#comprobante\">";
        SignedInfo += "\n<ds:Transforms>";
        SignedInfo += "\n<ds:Transform Algorithm=\"http://www.w3.org/2000/09/xmldsig#enveloped-signature\">";
        SignedInfo += "</ds:Transform>";
        SignedInfo += "\n</ds:Transforms>";
        SignedInfo += "\n<ds:DigestMethod Algorithm=\"http://www.w3.org/2000/09/xmldsig#sha1\">";
        SignedInfo += "</ds:DigestMethod>";
        SignedInfo += "\n<ds:DigestValue>";
        // HASH O DIGEST DE TODO EL ARCHIVO XML IDENTIFICADO POR EL id="comprobante"
        SignedInfo += sha1_factura;
        SignedInfo += "</ds:DigestValue>";
        SignedInfo += "\n</ds:Reference>";
        SignedInfo += "\n</ds:SignedInfo>";
        const SignedInfo_para_firma = SignedInfo.replace("<ds:SignedInfo", "<ds:SignedInfo " + xmlns);
        const res_p_firmar = await this.p_firmar(base64P12, SignedInfo_para_firma, pwdP12);
        if (!res_p_firmar.ok) {
          resolve(res_p_firmar.error);
          return;
        }
        const firma_SignedInfo = res_p_firmar.data;
        // INICIO DE LA FIRMA DIGITAL
        let xades_bes = "";
        xades_bes += "<ds:Signature " + xmlns + " Id=\"Signature" + Signature_number + "\">";
        xades_bes += "\n" + SignedInfo;
        xades_bes += "\n<ds:SignatureValue Id=\"SignatureValue" + SignatureValue_number + "\">\n";
        // VALOR DE LA FIRMA (ENCRIPTADO CON LA LLAVE PRIVADA DEL CERTIFICADO DIGITAL)
        xades_bes += firma_SignedInfo;
        xades_bes += "\n</ds:SignatureValue>";
        xades_bes += "\n" + KeyInfo;
        xades_bes += "\n<ds:Object Id=\"Signature" + Signature_number + "-Object" + Object_number + "\">";
        xades_bes += "<etsi:QualifyingProperties Target=\"#Signature" + Signature_number + "\">";
        // ELEMENTO <etsi:SignedProperties>';
        xades_bes += SignedProperties;
        xades_bes += "</etsi:QualifyingProperties>";
        xades_bes += "</ds:Object>";
        xades_bes += "</ds:Signature>";
        // FIN DE LA FIRMA DIGITAL

        respuesta.data = {
          xmlFirmado: (tipoDocumento === "factura") ? factura.replace("</factura>", xades_bes + "</factura>") : factura.replace("</notaCredito>", xades_bes + "</notaCredito>"),
          claveAcceso: claveAcceso ? claveAcceso : null,
        };
        respuesta.ok = true;
        resolve(respuesta);
        return;
      } catch (error: any) {
        respuesta.error = error;
        console.log("Falló el proceso general de la firma digital -> ", error);
        resolve(respuesta);
        return;
      }
    });
  }

  private generarFirma(p12B64: any, infoAFirmar: any, pwdP12: any): Promise<RESPONSE_GenerarFirma> {
    return new Promise((resolve) => {
      const respuesta: RESPONSE_GenerarFirma = {ok: false};
      try {
        let certificateX509 = "";
        if (p12B64 !== undefined && infoAFirmar !== undefined) {
          const p12Der = forge.util.decode64(p12B64);
          const p12Asn1 = forge.asn1.fromDer(p12Der);
          let p12 = null;
          p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pwdP12);
          const certBags = p12.getBags({bagType: forge.pki.oids.certBag});
          const cert = certBags[forge.oids.certBag][0].cert;
          const pkcs8bags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
          const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0];
          let key = pkcs8.key;
          if (key == null) {
            key = pkcs8.asn1;
          }
          const md = forge.md.sha1.create();
          md.update(infoAFirmar, "utf8");
          const signature = this.btoa(key.sign(md)).match(/.{1,76}/g).join("\n");
          const certificateX509_pem = forge.pki.certificateToPem(cert);
          certificateX509 = certificateX509_pem;
          certificateX509 = certificateX509.substr(certificateX509.indexOf("\n"));
          certificateX509 = certificateX509.substr(0, certificateX509.indexOf("\n-----END CERTIFICATE-----"));
          certificateX509 = certificateX509.replace(/\r?\n|\r/g, "").replace(/([^\0]{76})/g, "$1\n");
          // Pasar certificado a formato DER y sacar su hash:
          const certificateX509_asn1 = forge.pki.certificateToAsn1(cert);
          const certificateX509_der = forge.asn1.toDer(certificateX509_asn1).getBytes();
          const certificateX509_der_hash = this.sha1_base64(certificateX509_der);
          // Serial Number
          const X509SerialNumber = parseInt(cert.serialNumber, 16);
          const exponent = this.hexToBase64(key.e.data[0].toString(16));
          // let modulus_pem = modulus = bigint2base64(key.n);

          const modulus = bigintConversion.bigintToBase64(key.n);
          // let modulus = this.bigint2base64(key.n);
          const modulus_pem = modulus;
          const issuerName = cert.issuer.attributes[3].shortName + "=" + cert.issuer.attributes[3].value + "," +
            cert.issuer.attributes[2].shortName + "=" + cert.issuer.attributes[2].value + "," +
            cert.issuer.attributes[1].shortName + "=" + cert.issuer.attributes[1].value + "," +
            cert.issuer.attributes[0].shortName + "=" + cert.issuer.attributes[0].value;
          respuesta.data = {
            firma: signature,
            certificado: certificateX509,
            modulus,
            firma_pem: signature,
            certificado_pem: certificateX509_pem,
            modulus_pem,
            certificateX509_der_hash,
            X509SerialNumber,
            exponent,
            issuerName,
          };
          respuesta.ok = true;
          resolve(respuesta);
          return;
        } else {
          respuesta.error = "Debe seleccionar el archivo de certificado o No existe informacion a firmar";
          resolve(respuesta);
          return;
        }
      } catch (error) {
        console.log("Falló la generación de la firma digital -> ", error);
        respuesta.error = error;
        resolve(respuesta);
        return;
      }
    });
  }

  private btoa(datosbinarios: any): string {
    const base64 = Buffer.from(datosbinarios).toString("base64");
    return base64;
  }

  private p_firmar(p12B64: any, infoAFirmar: any, pwdP12: any): Promise<{ ok: boolean, data?: string, error?: any }> {
    return new Promise((resolve, reject) => {
      const respuesta: { ok: boolean, data?: string, error?: any } = {ok: false};
      try {
        let signature = "";
        const p12Der = forge.util.decode64(p12B64);
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        let p12 = null;
        p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, pwdP12);
        const pkcs8bags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
        const pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0];
        let key = pkcs8.key;
        if (key == null) {
          key = pkcs8.asn1;
        }
        const md = forge.md.sha1.create();
        md.update(infoAFirmar, "utf8");
        signature = btoa(key.sign(md)).match(/.{1,76}/g).join("\n");
        respuesta.data = signature;
        respuesta.ok = true;
        resolve(respuesta);
        return;
      } catch (error) {
        console.log("falló proceso de firmado -> ", error);
        respuesta.error = error;
        resolve(respuesta);
        return;
      }
    });
  }

  private p_obtener_aleatorio() {
    return Math.floor(Math.random() * 999000) + 990;
  }

  private hexToBase64(str: any) {
    const hex = ("00" + str).slice(0 - str.length - str.length % 2);
    return this.btoa(String.fromCharCode.apply(null,
        hex.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
  }

  private sha1_base64(txt: string) {
    const md = forge.md.sha1.create();
    md.update(txt);
    return new Buffer(md.digest().toHex(), "hex").toString("base64");
  }
}


export interface RESPONSE_GenerarXADESComprobante {
  ok: boolean;
  data?: XADESComprobanteI;
  error?: any
}

interface RESPONSE_GenerarFirma {
  ok: boolean;
  data?: {
    firma: any;
    certificado: any;
    modulus: any;
    firma_pem: any;
    certificado_pem: any;
    modulus_pem: any;
    certificateX509_der_hash: any;
    X509SerialNumber: any;
    exponent: any;
    issuerName: any;
  }
  error?: any
}
