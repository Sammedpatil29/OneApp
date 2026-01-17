import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient) { }

  url = 'https://oneapp-express-singapore.onrender.com/'

// metaData = "https://oneapp-backend.onrender.com/api/metadata/"
// activeOrders = "https://oneapp-backend.onrender.com/api/orders/active-orders-by-user/"

getMetaData(){
  // return this.http.get(this.metaData)
}

 getHomeData(token: string) {
    // 1. Create the headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.url}verify-token`, { headers: headers });
  }

getActiveOrders(params: any){
  console.log(params)
  // return this.http.post(this.activeOrders, params)
}
}
