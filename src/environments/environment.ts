import { map } from 'rxjs/operators';

export const environment = {

  production: false,

  /* firebaseConfig : {
    apiKey: "AIzaSyDCo6N5Pv91_CBSs64PNxwORVkwHo8V3p8",
    authDomain: "farmaciaapp-806af.firebaseapp.com",
    projectId: "farmaciaapp-806af",
    storageBucket: "farmaciaapp-806af.appspot.com",
    messagingSenderId: "41337414954",
    appId: "1:41337414954:web:389f89b80eb1ae1613ea53"
  },
  
  uidAdmin: 'XE4gaBzhkbga2Suyid03ppFjcqk1',
  isAdmin: (next: any) => map( (user: any) => !!user), */
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

    

};




