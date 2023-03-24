import { map } from 'rxjs/operators';

export const environment = {

  production: false,

 //Pruebas 
  /*    firebaseConfig: {
    projectId: 'farmaciaapp-806af',
    appId: '1:41337414954:web:389f89b80eb1ae1613ea53',
    storageBucket: 'farmaciaapp-806af.appspot.com',
    apiKey: 'AIzaSyDCo6N5Pv91_CBSs64PNxwORVkwHo8V3p8',
    authDomain: 'farmaciaapp-806af.firebaseapp.com',
    messagingSenderId: '41337414954'
  }, 
  
    uidAdmin: 'VSPlXO7rBkglfqboweGqz3N9Rkq2',
    isAdmin: (next: any) => map( (user: any) => !!user),   
    email: 'alex.tofis21@gmail.com',
    contrasenaMail: 'ekxguvptkermxhuc',
    urlApiEmail: 'http://localhost:5000/azudist-7fcea/us-central1',
    urlApiSriRecibirComprobante: 'https://us-central1-fakcil.cloudfunctions.net/validarComprobanteXml',
    urlApiSriAutorizarComprobante: 'https://us-central1-fakcil.cloudfunctions.net/autorizacionComprobante',
    firmaP12: 'https://firebasestorage.googleapis.com/v0/b/farmaciaapp-806af.appspot.com/o/FrimaElectronica%2FJUAN%20PABLO%20MORAN%20VIDAL%20061222105141%20(1)%20(1).p12?alt=media&token=5158af36-57f6-47ec-93f4-b18f43afbb5a',
    passFirma: 'Mvjp3357',
    infoTributaria : {
      ambiente: '1',
      tipoEmision: '1',
      razonSocial: 'MORAN VIDAL JUAN PABLO',
      nombreComercial: 'AZUDIST',
      ruc: '0103663357001',
      codDoc: '01',
      estab: '001',
      ptoEmi: '100',
      dirMatriz: 'Camino del tejar 4-30 camino a las pencas',
    }  */
 

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
    isAdmin: (next: any) => map( (user: any) => !!user),   
    email: 'azudist@outlook.com', 
    contrasenaMail: 'oficina1',
    urlApiEmail: 'http://localhost:5000/azudist-7fcea/us-central1',
    urlApiSriRecibirComprobante: 'http://localhost:5000/azudist-7fcea/us-central1',
    urlApiSriAutorizarComprobante: 'http://localhost:5000/azudist-7fcea/us-central1',
    firmaP12: "https://firebasestorage.googleapis.com/v0/b/azudist-7fcea.appspot.com/o/Firma%20Electronica%2FJUAN%20PABLO%20MORAN%20VIDAL%20061222105141_c.p12?alt=media&token=710859c4-79e4-432a-855e-9bfdb5a834c4",
    passFirma: "Mvjp3357",
    infoTributaria : {
      ambiente: '2',
      tipoEmision: '1',
      razonSocial: 'MORAN VIDAL JUAN PABLO',
      nombreComercial: 'AZUDIST',
      ruc: '0103663357001',
      codDoc: '01',
      estab: '001',
      ptoEmi: '100',
      dirMatriz: 'Camino del tejar 4-30 camino a las pencas',
    }  

  };




