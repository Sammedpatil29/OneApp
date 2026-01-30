import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonFooter, IonButton, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, filterOutline, caretForwardOutline } from 'ionicons/icons';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ProductCardComponent } from "src/app/components/product-card/product-card.component";
import { ErrorComponent } from "src/app/components/error/error.component";

@Component({
  selector: 'app-grocery-special',
  templateUrl: './grocery-special.page.html',
  styleUrls: ['./grocery-special.page.scss'],
  standalone: true,
  imports: [IonSkeletonText, IonButton, IonFooter, IonIcon, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ProductCardComponent, ErrorComponent]
})
export class GrocerySpecialPage implements OnInit {

  // Dynamic Data (In real app, fetch based on Route ID)
  categoryInfo = {
    name: 'Farm Fresh Veggies',
    color: '#e8f5e9', // Light Green Theme
    bannerImg: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
    offerText: 'Up to 40% OFF'
  };

  // Filter Chips
  filters = ['All', 'Leafy', 'Root', 'Organic', 'Exotic', 'Cut & Peeled'];
  selectedFilter = 'All';
  token:any;
  term:any = '';
  cartItems: any[] = [];
  title: string = '';
  isLoading: boolean = false;
  isError: boolean = false;


  // Products List
  products:any = []
  // [
  //   { id: 1, name: 'Fresh Tomato', weight: '500g', price: 24, oldPrice: 30, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png', qty: 0 },
  //   { id: 2, name: 'Red Onion', weight: '1kg', price: 45, oldPrice: 60, discount: 25, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png', qty: 2 },
  //   { id: 3, name: 'Potato', weight: '1kg', price: 35, oldPrice: 40, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png', qty: 0 },
  //   { id: 4, name: 'Broccoli', weight: '1 pc', price: 60, oldPrice: 80, discount: 15, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329905.png', qty: 0 },
  //   { id: 5, name: 'Carrot', weight: '500g', price: 30, oldPrice: 40, discount: 10, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329954.png', qty: 0 },
  //   { id: 6, name: 'Spinach', weight: '1 bunch', price: 15, oldPrice: 20, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329937.png', qty: 1 },
  //   { id: 7, name: 'Capsicum', weight: '500g', price: 40, oldPrice: 50, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329932.png', qty: 0 },
  //   { id: 8, name: 'Cucumber', weight: '500g', price: 18, oldPrice: 25, discount: 5, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329921.png', qty: 0 },
  // ];

  constructor(private router: Router, private groceryService: GroceryService, private authService: AuthService, private cdr: ChangeDetectorRef,) { 
    addIcons({ searchOutline, filterOutline, caretForwardOutline });
  }

 async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['term']) {
      this.term = navigation.extras.state['term'];
      console.log('term:', this.term);
    }

    this.token = await this.authService.getToken();

    this.groceryService.cart$.subscribe((items) => {
      console.log('🛒 UI Cart Updated:', items);
      this.cartItems = items;
      this.cdr.detectChanges();
    });
    this.getProductsByTerm();
  }

  increase(productId: any) {
    this.groceryService.increaseQty(productId, this.token).subscribe({
      next: () => console.log('Increase Success'),
      error: (err) => console.error('API Failed', err),
    });
  }

  decrease(productId: any) {
    this.groceryService.decreaseQty(productId, this.token)?.subscribe({
      next: () => console.log('Decrease Success'),
      error: (err) => console.error('API Failed', err),
    });
  }

  // --- HELPERS ---

  getQty(productId: any): number {
    if (!this.cartItems || this.cartItems.length === 0) return 0;

    // Robust Match: Convert both to String
    const item = this.cartItems.find(
      (i: any) => String(i.productId) === String(productId),
    );

    return item ? item.quantity : 0;
  }

  // Filter Logic
  setFilter(f: string) {
    this.selectedFilter = f;
  }

  getProductsByTerm() {
    this.isLoading = true;
    this.isError = false;
    this.groceryService.getProductsByTerm(this.term).subscribe({
      next: (response:any) => {
        console.log('Products by term:', response);
        this.products = response.data.products;
        this.title = response.data.title;
        this.cdr.detectChanges();
        this.isLoading = false;
      },
      error: (error:any) => {
        console.error('Error fetching products by term:', error);
        this.isLoading = false;
        this.isError = true;
      }
    });
  }

  goToDetails(product?: any) {
    this.router.navigate([`/layout/grocery-layout/grocery-item-details/${product?.id}`], {
      state: { productId: product?.id }
    });
  }

  gotoSearch() {
    this.router.navigate(['/layout/grocery-layout/grocery-search']);
  }
}