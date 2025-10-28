import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroceryService {
  getGroceryUrl = 'https://oneapp-backend.onrender.com/api/grocery/grocery-list/';
  getCartItemsUrl = 'https://oneapp-backend.onrender.com/api/cart/view/';
  updateCartItemsUrl = 'https://oneapp-backend.onrender.com/api/cart/create/';
  createCartUrl = 'https://oneapp-backend.onrender.com/api/cart/view/';
  getBannerUrl = 'https://oneapp-backend.onrender.com/api/banner/banners'
  getCategoriesUrl = 'https://oneapp-backend.onrender.com/api/grocery/categories/'

  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();
  constructor(private http: HttpClient) {}

  getGroceryList(params: any) {
    return this.http.post(this.getGroceryUrl, params);
  }

  getCartItems1(): any[] {
    return this.cartItemsSubject.getValue();
  }

  updateCartItems1(newItems: any[]): void {
    this.cartItemsSubject.next(newItems); // Emit new cart items
  }

  getCartItems(params: any) {
    return this.http.post(this.getCartItemsUrl, params)
  }

  updateCartItems(params:any){
    return this.http.post(this.updateCartItemsUrl, params)
  }

  createCart(params:any){
    return this.http.post(this.createCartUrl, params)
  }

  getCategories(){
    return this.http.get(this.getCategoriesUrl)
  }

  getBanner(type:any){
    return this.http.get(`${this.getBannerUrl}/?type=${type}`)
  }

  
}
