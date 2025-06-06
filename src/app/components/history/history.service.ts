import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  url = 'https://oneapp-backend.onrender.com/api/orders/user-orders/'

  constructor(private http: HttpClient) {}

  getHistory(params:any): Observable<any> {
    return this.http.post(this.url, params)
  }

}
