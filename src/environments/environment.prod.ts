import { map } from 'rxjs/operators';

export const environment = {
  production: true,

 /* Pruebas 
    firebaseConfig: {
    projectId: 'farmaciaapp-806af',
    appId: '1:41337414954:web:389f89b80eb1ae1613ea53',
    storageBucket: 'farmaciaapp-806af.appspot.com',
    apiKey: 'AIzaSyDCo6N5Pv91_CBSs64PNxwORVkwHo8V3p8',
    authDomain: 'farmaciaapp-806af.firebaseapp.com',
    messagingSenderId: '41337414954'
  }, */

  //Produccion
  firebaseConfig: {
    apiKey: "AIzaSyAIsxXJrLwgqdQjtAAPzIBxkXu1XvTzu7w",
    authDomain: "azudist-7fcea.firebaseapp.com",
    projectId: "azudist-7fcea",
    storageBucket: "azudist-7fcea.appspot.com",
    messagingSenderId: "1042935587192",
    appId: "1:1042935587192:web:9e53e785655b4f89d6288d"
  },
  
  uidAdmin: 'X97WHElvz9emgkVVW0XbLnuyBxp2',
  //uidAdmin: 'XE4gaBzhkbga2Suyid03ppFjcqk1', Pruebas
  isAdmin: (next: any) => map( (user: any) => !!user),
  email: 'azudist@outlook.com', //gmail alex.tofis21@gmail.com
  contrasenaMail: 'oficina1', //gmail ekxguvptkermxhuc
  urlApiEmail: 'https://us-central1-azudist-7fcea.cloudfunctions.net',
  urlApiSriRecibirComprobante: 'https://us-central1-fakcil.cloudfunctions.net/validarComprobanteXml',
  urlApiSriAutorizarComprobante: 'https://us-central1-fakcil.cloudfunctions.net/autorizacionComprobante',  
  firmaP12: "https://firebasestorage.googleapis.com/v0/b/azudist-7fcea.appspot.com/o/Firma%20Electronica%2FJUAN%20PABLO%20MORAN%20VIDAL%20061222105141%20(1).p12?alt=media&token=3f546687-eaaf-41fe-9b8a-38759748697c",
  passFirma: "Mvjp3357" 
};


