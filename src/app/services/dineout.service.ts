import { HttpClient } from '@angular/common/http';
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
}
