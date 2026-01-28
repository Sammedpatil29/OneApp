import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonFooter, IonButtons, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, homeOutline, search, timeOutline, caretForwardOutline, add, remove } from 'ionicons/icons';
import { Router } from '@angular/router';
import { GroceryService } from '../services/grocery.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-grocery',
  templateUrl: 'grocery.page.html',
  styleUrls: ['grocery.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonFooter, IonIcon, IonToolbar, IonTitle, IonHeader, IonContent, CommonModule, FormsModule]
})
export class GroceryPage implements OnInit, OnDestroy {

  deliveryTime = '10 mins';
  currentLocation = 'Home - Indiranagar, Bengaluru';
  token: any;
  
  // LIVE CART STATE
  cartItems: any[] = [];

  // Data Containers
  banners = [
    { 
      title: '50% OFF', 
      subtitle: 'On First Order', 
      img: 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png',
      bg: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)'
    },
    { 
      title: 'Fresh', 
      subtitle: 'Vegetables', 
      img: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
      bg: 'linear-gradient(to right, #ff9966 0%, #ff5e62 100%)'
    }
  ];
  categories: any = [];
  productSections: any = [];

  constructor(
    private router: Router, 
    private cartService: GroceryService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) { 
    addIcons({ chevronDownOutline, homeOutline, search, timeOutline, caretForwardOutline, add, remove });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();

    // 1. Subscribe to Cart Changes
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      console.log('🛒 UI Cart Updated:', this.cartItems);
      
      // Force UI Update
      this.cdr.detectChanges(); 
    });

    // 2. Fetch Initial Data
    this.cartService.getCartItems(this.token).subscribe({
      next: (res: any) => {
        if(res.data) {
          this.categories = res.data.categories;
          this.productSections = res.data.productSections;
          
          // FIX: Force change detection once products are loaded so getQty() updates in HTML
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Initial Load Error:', err)
    });
  }

  ngOnDestroy() {}
  
  // --- ACTIONS ---

  increase(productId: any) {
    this.cartService.increaseQty(productId, this.token).subscribe({
      next: () => console.log('Increase Success'),
      error: (err) => console.error('API Failed', err)
    });
  }

  decrease(productId: any) {
    this.cartService.decreaseQty(productId, this.token)?.subscribe({
      next: () => console.log('Decrease Success'),
      error: (err) => console.error('API Failed', err)
    });
  }

  // --- HELPERS ---

  getQty(productId: any): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;

    // Robust Match: Convert both to String
    const item = this.cartItems.find((i: any) => String(i.productId) === String(productId));

    return item ? item.quantity : 0;
  }

  // --- COMPUTED PROPERTIES ---

  get totalItems() {
    if (!this.cartItems) return 0;
    return this.cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  }

  get totalPrice() {
    if (!this.cartItems) return 0;
    return this.cartItems.reduce((acc, item) => {
      const product = this.findProductById(item.productId);
      const price = product ? product.price : 0; 
      return acc + (price * (item.quantity || 0));
    }, 0);
  }

  private findProductById(id: any) {
    for (const section of this.productSections) {
      const found = section.products.find((p: any) => String(p.id) === String(id));
      if (found) return found;
    }
    return null;
  }

  // --- NAVIGATION ---

  gotoSearch() { this.router.navigate(['/layout/grocery-search']); }
  goToSpecialCategory() { this.router.navigate(['/layout/grocery-special']); }
  goToGrocerybyCategory(catName?: string) { this.router.navigate(['/layout/grocery-by-category'], { state: { category: catName } }); }
  goToDetails(product?: any) { this.router.navigate(['/layout/grocery-item-details'], { state: { product } }); }
  goToCart() { this.router.navigate(['/layout/cart']); }
  goToHome() { this.router.navigate(['/layout/example/home']); }
}