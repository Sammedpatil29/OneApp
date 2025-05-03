import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private http: HttpClient) {}

  getHistory(): Observable<any> {
    return this.http.get('../../../assets/json/history.json')
  }

}
