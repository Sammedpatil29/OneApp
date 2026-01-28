import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

// 1. Define the Interface based on your requested pattern
export interface CartItem {
  productId: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroceryService {

  private apiUrl = 'https://your-api.com/api/cart'; // Replace with your API

  // 2. Initialize BehaviorSubject with an empty array
  private _cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  // 3. Expose as Observable for components to subscribe to
  public cart$ = this._cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * GET: Fetch initial cart items
   * Updates Subject on success
   */
  getCartItems() {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap((responseItems) => {
        // Update the BehaviorSubject with data from API
        this._cartSubject.next(responseItems);
      })
    );
  }

  /**
   * LOGIC: Increase Quantity
   * 1. Check current local value to find item.
   * 2. Calculate new qty.
   * 3. Call API.
   * 4. Update Subject ON RESPONSE.
   */
  increaseQty(productId: string) {
    const currentItems = this._cartSubject.value;
    const item = currentItems.find(i => i.productId === productId);
    
    // If item exists, add 1. If not, start at 1.
    const newQty = item ? item.quantity + 1 : 1;

    return this.updateCartApi(productId, newQty);
  }

  /**
   * LOGIC: Decrease Quantity
   * 1. Check current local value.
   * 2. Calculate new qty.
   * 3. Call API.
   */
  decreaseQty(productId: string) {
    const currentItems = this._cartSubject.value;
    const item = currentItems.find(i => i.productId === productId);

    if (!item) return; // Item not in cart, do nothing

    const newQty = item.quantity - 1;
    
    // If Qty becomes 0, usually we remove it, handled in updateCartApi
    return this.updateCartApi(productId, newQty);
  }

  /**
   * SHARED HELPER: Calls API and updates State
   */
  private updateCartApi(productId: string, quantity: number) {
    const payload = { productId, quantity };

    // Assuming your API endpoint is POST /cart/update or similar
    return this.http.post<any>(`${this.apiUrl}/update`, payload).pipe(
      tap(() => {
        // ✅ THIS CODE RUNS ONLY AFTER API SUCCESS RESPONSE
        
        const currentItems = this._cartSubject.value;
        const index = currentItems.findIndex(i => i.productId === productId);
        
        // Clone array to ensure immutability
        let updatedItems = [...currentItems];

        if (quantity <= 0) {
          // Remove item if quantity is 0
          updatedItems = updatedItems.filter(i => i.productId !== productId);
        } else {
          if (index > -1) {
            // Update existing item
            updatedItems[index] = { ...updatedItems[index], quantity: quantity };
          } else {
            // Add new item (if it was an 'Add' action from 0)
            updatedItems.push({ productId, quantity });
          }
        }

        // 🚀 Push new state to BehaviorSubject
        this._cartSubject.next(updatedItems);
      })
    );
  }
}