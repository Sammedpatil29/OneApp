import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GroceryService {
  getGroceryUrl = 'https://oneapp-backend.onrender.com/api/grocery/grocery-list/';
  getCartItemsUrl = 'https://oneapp-backend.onrender.com/api/cart/view/';
  updateCartItemsUrl = 'https://oneapp-backend.onrender.com/api/cart/update/';

  constructor(private http: HttpClient) {}

  getGroceryList(params: any) {
    return this.http.post(this.getGroceryUrl, params);
  }

  getCartItems(params: any) {
    return this.http.post(this.getCartItemsUrl, params)
  }

  updateCartItems(params:any){
    return this.http.post(this.updateCartItemsUrl, params)
  }
}
