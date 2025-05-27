import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

metaData = "https://oneapp-backend.onrender.com/api/metadata/"

getMetaData(){
  return this.http.get(this.metaData)
}
}
