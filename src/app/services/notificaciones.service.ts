import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private http: HttpClient) { }

  sendEmail(pdf: any):Observable<any>{
    
    const url = environment.urlApiEmail + '/api/sendEmail';
    const email = environment.email;
    const password = environment.contrasenaMail;
    
    return this.http.post(url, pdf, {
      headers: {
        email,
        password
      }
    }).pipe(
      retry(2)
    );
  }

}
