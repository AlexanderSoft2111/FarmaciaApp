import { map } from 'rxjs/operators';

export const environment = {

  production: false,

  firebaseConfig: {
    projectId: 'farmaciaapp-806af',
    appId: '1:41337414954:web:389f89b80eb1ae1613ea53',
    storageBucket: 'farmaciaapp-806af.appspot.com',
    apiKey: 'AIzaSyDCo6N5Pv91_CBSs64PNxwORVkwHo8V3p8',
    authDomain: 'farmaciaapp-806af.firebaseapp.com',
    messagingSenderId: '41337414954'
  },
  
    uidAdmin: 'XE4gaBzhkbga2Suyid03ppFjcqk1',
    isAdmin: (next: any) => map( (user: any) => !!user),   
    email: 'azudist@outlook.com', //gmail alex.tofis21@gmail.com
    contrasenaMail: 'oficina1', //gmail ekxguvptkermxhuc
    urlApiEmail: 'http://localhost:5000/farmaciaapp-806af/us-central1',
    urlApiSriRecibirComprobante: 'https://us-central1-fakcil.cloudfunctions.net/validarComprobanteXml',
    urlApiSriAutorizarComprobante: 'https://us-central1-fakcil.cloudfunctions.net/autorizacionComprobante',
    firmaP12: "https://firebasestorage.googleapis.com/v0/b/farmaciaapp-806af.appspot.com/o/Facturas%2FJUAN%20PABLO%20MORAN%20VIDAL%20061222105141%20(1).p12?alt=media&token=cfd28d33-add3-40cd-85aa-ac9e3606092e",
    passFirma: "Mvjp3357"
};




