import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonSearchbar, IonButtons, IonButton, IonIcon, IonFooter, IonTitle, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, timeOutline, closeCircleOutline, caretForwardOutline, trendingUpOutline, add, remove } from 'ionicons/icons';
import { NavController } from '@ionic/angular';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grocery-search',
  templateUrl: './grocery-search.page.html',
  styleUrls: ['./grocery-search.page.scss'],
  standalone: true,
  imports: [IonSkeletonText, IonTitle, IonFooter, IonIcon, IonButton, IonButtons, IonSearchbar, IonToolbar, IonHeader, IonContent, CommonModule, FormsModule]
})
export class GrocerySearchPage implements OnInit {

  query = '';
  token: any;
  cartItems: any[] = [];
  isLoading: boolean = false;
  
  // 1. Dummy History
  recentSearches = ['Milk', 'Bread', 'Eggs', 'Chips'];

  // 2. Trending Chips
  trending = [
    { name: 'Summer Drinks', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png' },
    { name: 'Mangoes', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png' },
    { name: 'Ice Cream', img: 'https://cdn-icons-png.flaticon.com/512/1046/1046771.png' },
    { name: 'Sunscreen', img: 'https://cdn-icons-png.flaticon.com/512/2855/2855353.png' },
  ];

  // 3. Database of Products (to filter from)
  allProducts = []
  // [
  //   { id: 1, name: 'Amul Taaza Milk', weight: '500 ml', price: 27, oldPrice: 30, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', qty: 0 },
  //   { id: 2, name: 'Brown Bread', weight: '400g', price: 40, oldPrice: 45, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png', qty: 0 },
  //   { id: 3, name: 'Farm Eggs', weight: '6 pcs', price: 60, oldPrice: 75, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/837/837560.png', qty: 0 },
  //   { id: 4, name: 'Lays Chips', weight: '50g', price: 20, oldPrice: 20, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', qty: 0 },
  //   { id: 5, name: 'Coca Cola', weight: '750ml', price: 40, oldPrice: 45, discount: 10, img: 'https://cdn-icons-png.flaticon.com/512/2405/2405536.png', qty: 0 },
  //   { id: 6, name: 'Fresh Tomato', weight: '500g', price: 24, oldPrice: 30, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png', qty: 0 },
  // ];

  // 4. Live Results
  results: any[] = [];

  constructor(
    private navCtrl: NavController,
    private groceryService: GroceryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { 
    addIcons({ arrowBack, timeOutline, closeCircleOutline, caretForwardOutline, trendingUpOutline, add, remove });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    this.groceryService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cdr.detectChanges();
    });
  }

  // Search Logic
  onSearchChange(event: any) {
    const val = event.target.value;
    this.query = val;

    if (val && val.trim().length >= 3) {
      this.isLoading = true;
      // Assuming a 'searchProducts' method exists in your service
      this.groceryService.searchProducts(this.query).subscribe((res: any) => {
        this.results = res.data.products;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.results = [];
      this.isLoading = false;
    }
  }

  // Clear History
  clearHistory() {
    this.recentSearches = [];
  }

  increase(productId: any) {
    this.groceryService.increaseQty(productId, this.token).subscribe();
  }

  decrease(productId: any) {
    this.groceryService.decreaseQty(productId, this.token)?.subscribe();
  }

  getQty(productId: any): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;
    const item = this.cartItems.find(
      (i: any) => String(i.productId) === String(productId),
    );
    return item ? item.quantity : 0;
  }

  goToDetails(product?: any) {
    this.router.navigate(['/layout/grocery-layout/grocery-item-details'], {
      state: { productId: product?.id },
    });
  }

  back() {
    this.navCtrl.back();
  }
}