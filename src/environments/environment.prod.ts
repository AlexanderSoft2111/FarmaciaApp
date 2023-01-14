import { map } from 'rxjs/operators';

export const environment = {
  production: true,

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
  email: 'alex.tofis21@gmail.com',
  contrasenaMail: 'ekxguvptkermxhuc',
  urlApiEmail: 'https://us-central1-farmaciaapp-806af.cloudfunctions.net'   
};


