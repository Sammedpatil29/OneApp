import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroceryService {

  private apiUrl = 'https://oneapp-express-singapore.onrender.com';

  // Initialize with empty array
  private _cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this._cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * GET CART:
   * Fetches cart and normalizes data to ensure 'productId' and 'quantity' exist.
   */
  getCartItems(token: any) {
  let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
  });

  return this.http.get<any>(`${this.apiUrl}/api/grocery-home`, { headers }).pipe(
    tap((responseItems: any) => {
      const rawCart = (responseItems.data && responseItems.data.cart) ? responseItems.data.cart : [];
      
      // FIX: Handle { "PRODUCT_ID": QUANTITY } structure
      const cartData = rawCart.map((item: any) => {
        const keys = Object.keys(item); // Get keys like ["9"]
        if (keys.length > 0) {
           const id = keys[0];      // "9"
           const qty = item[id];    // 1
           return {
             productId: String(id),
             quantity: Number(qty)
           };
        }
        return null;
      }).filter((item: any) => item !== null); // Remove any empty/null objects

      console.log('📦 API Cart Data Normalized:', cartData);
      this._cartSubject.next(cartData);
    })
  );
}

  increaseQty(productId: any, token: any) {
    const currentItems = this._cartSubject.value;
    // Robust match using String comparison
    const item = currentItems.find(i => String(i.productId) === String(productId));
    
    const newQty = item ? item.quantity + 1 : 1;
    return this.updateCartApi(productId, newQty, token);
  }

  decreaseQty(productId: any, token: any) {
    const currentItems = this._cartSubject.value;
    const item = currentItems.find(i => String(i.productId) === String(productId));

    if (!item) return; 

    const newQty = item.quantity - 1;
    return this.updateCartApi(productId, newQty, token);
  }

  private updateCartApi(productId: any, quantity: number, token: any) {
    const payload = { productId, quantity };
    
    let headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
    });

    return this.http.post<any>(`${this.apiUrl}/api/grocery/cart/update`, payload, { headers }).pipe(
      tap(() => {
        const currentItems = this._cartSubject.value;
        const index = currentItems.findIndex(i => String(i.productId) === String(productId));
        
        // Clone array
        let updatedItems = [...currentItems];

        if (quantity <= 0) {
          // Remove item
          updatedItems = updatedItems.filter(i => String(i.productId) !== String(productId));
        } else {
          if (index > -1) {
            // Update existing
            updatedItems[index] = { ...updatedItems[index], quantity: quantity };
          } else {
            // Add new
            updatedItems.push({ productId: String(productId), quantity: quantity });
          }
        }

        this._cartSubject.next(updatedItems);
      })
    );
  }
}