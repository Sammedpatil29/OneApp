import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

metaData = "https://oneapp-backend.onrender.com/api/metadata/"
activeOrders = "https://oneapp-backend.onrender.com/api/orders/active-orders-by-user/"

getMetaData(){
  return this.http.get(this.metaData)
}

getActiveOrders(params: any){
  console.log(params)
  return this.http.post(this.activeOrders, params)
}
}
