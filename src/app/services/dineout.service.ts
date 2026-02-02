import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DineoutService {

  constructor(private http: HttpClient) { }

  url = 'https://oneapp-express-singapore.onrender.com';

  getRestaurants(){
    let city = localStorage.getItem('selectedCity') || 'Athani';
    return this.http.get(`${this.url}/api/dineout?city=${city}`);
  }

  getRestaurantDetails(restaurantId: number){
    return this.http.get(`${this.url}/api/dineout/${restaurantId}`);
  }

  createOrder(token:any, params:any){
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.post(`${this.url}/api/dineout/orders/create`,params, {headers: headers})
  }

  orderById(id: string) {
    let params = {
      'orderId': id
    }
    return this.http.post(`${this.url}/api/dineout/orders/details`, params);
  }

  cancelOrder(id: string, token:any) {
    let params = {
      'orderId': id
    }

    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.post(`${this.url}/api/dineout/orders/cancel`, params, {headers: headers});
  }
}
