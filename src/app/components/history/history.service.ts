import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  // url = 'https://oneapp-backend.onrender.com/api/orders/user-orders/'
  url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHistory(params:any, token:any): Observable<any> {
    let headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
    })
    return this.http.post(`${this.url}/api/history`, params, {headers: headers})
  }

}
