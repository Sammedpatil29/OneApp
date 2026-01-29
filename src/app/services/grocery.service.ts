import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  quantity: number;
}

// 1. Define Interface for the summary data
export interface CartSummary {
  itemCount: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroceryService {

  private apiUrl = 'https://oneapp-express-singapore.onrender.com';

  // --- Cart Items State ---
  private _cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this._cartSubject.asObservable();

  // 2. --- Cart Summary State (New) ---
  private _summarySubject = new BehaviorSubject<CartSummary>({ itemCount: 0, totalAmount: 0 });
  public summary$ = this._summarySubject.asObservable();

  constructor(private http: HttpClient) { }

  getCartItems(token: any) {
    let headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/api/grocery-home`, { headers }).pipe(
      tap((responseItems: any) => {
        const rawCart = (responseItems.data && responseItems.data.cart) ? responseItems.data.cart : [];
        
        // Normalize Cart Items
        const cartData = rawCart.map((item: any) => {
          const keys = Object.keys(item);
          if (keys.length > 0) {
             const id = keys[0];
             const qty = item[id];
             return { productId: String(id), quantity: Number(qty) };
          }
          return null;
        }).filter((item: any) => item !== null);

        // 3. Extract Summary Data
        const itemData: CartSummary = {
          itemCount: responseItems.data.itemCount || 0,
          totalAmount: responseItems.data.totalPrice || 0
        };

        console.log('📦 API Cart Items:', cartData);
        console.log('💰 API Summary:', itemData);

        // 4. Update both Subjects
        this._cartSubject.next(cartData);
        this._summarySubject.next(itemData); 
      })
    );
  }

  increaseQty(productId: any, token: any) {
    const currentItems = this._cartSubject.value;
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
    let headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post<any>(`${this.apiUrl}/api/grocery/cart/update`, payload, { headers }).pipe(
      tap((res) => {
        // Update Local Items Array
        const currentItems = this._cartSubject.value;
        const index = currentItems.findIndex(i => String(i.productId) === String(productId));
        let updatedItems = [...currentItems];

        if (quantity <= 0) {
          updatedItems = updatedItems.filter(i => String(i.productId) !== String(productId));
        } else {
          if (index > -1) {
            updatedItems[index] = { ...updatedItems[index], quantity: quantity };
          } else {
            updatedItems.push({ productId: String(productId), quantity: quantity });
          }
        }

        const itemData: CartSummary = {
          itemCount: res.itemCount || 0,
          totalAmount: res.totalPrice || 0
        };
        console.log('💰 Updated Summary from API:', itemData);
        
        this._cartSubject.next(updatedItems);
        this._summarySubject.next(itemData); 

        // NOTE: We cannot update _summarySubject here accurately because 
        // we don't know the price of the product inside this service to calculate the new total.
        // The UI should rely on the component's calculated total OR call getCartItems() again to refresh totals.
      })
    );
  }

  getCategories(params:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/grocery-home/category`,  params );   
  }

  getProductsByCategory(params:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/grocery-home/productbycategory`,  params );   
  }

  getItemDetails(id:any){
    return this.http.get<any>(`${this.apiUrl}/api/grocery/${id}`);
  }

  getProductsByTerm(term:any): Observable<any> {
    let params = { term };
    return this.http.post<any>(`${this.apiUrl}/api/grocery-home/section`,  params );   
  }

  searchProducts(term: string): Observable<any> {
    let params = { searchTerm: term };
    return this.http.post<any>(`${this.apiUrl}/api/grocery-home/search`,  params );   
  }

  getCartdata(token: any, couponCode:any): Observable<any> {
    let headers = new HttpHeaders({
       'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/api/grocery/cart?coupon=${couponCode}`, { headers });
  }


}