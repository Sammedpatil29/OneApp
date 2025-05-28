import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService{

  constructor(private http: HttpClient) { }

  getServices(){
    return this.http.get('assets/json/events.json')
  }
}
