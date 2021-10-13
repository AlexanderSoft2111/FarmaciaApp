import { map } from 'rxjs/operators';

export const environment = {
  production: false,
 /*  firebaseConfig : {
    apiKey: "AIzaSyAfv57CfsTQu6_a1V6fmBQ65XDyIW6QLaI",
    projectId: "appfarmaceutica",
    storageBucket: "appfarmaceutica.appspot.com",
    messagingSenderId: "433333229189",
    appId: "1:433333229189:web:b5807b1077f1dfd68d3bec",
    measurementId: "G-ZKP82451F8",
    authDomain: "appfarmaceutica.firebaseapp.com",
    },
    uidAdmin: 'uF9Ng3DDPmhUZ1d8EDbGwUlJSby1',
  isAdmin: (next: any) => map( (user: any) => !!user),  */


  firebaseConfig: {
    apiKey: "AIzaSyAxMfMkkeKntFUUYbRfPRJ0KllR2MzIQo4",
    authDomain: "appmarket-68601.firebaseapp.com",
    projectId: "appmarket-68601",
    storageBucket: "appmarket-68601.appspot.com",
    messagingSenderId: "157223563753",
    appId: "1:157223563753:web:d8879df1bdb71600ce9b78"
  },
  
    uidAdmin: 'mkq6K3arNyTydGQLbKL9GcCPRAO2',
    isAdmin: (next: any) => map( (user: any) => !!user), 
};
