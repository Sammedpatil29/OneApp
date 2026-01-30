import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonBackButton, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, heartOutline, shareSocialOutline, timeOutline, shieldCheckmarkOutline, leafOutline, star } from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GroceryService } from 'src/app/services/grocery.service';
import { ErrorComponent } from "src/app/components/error/error.component";

@Component({
  selector: 'app-grocery-item-details',
  templateUrl: './grocery-item-details.page.html',
  styleUrls: ['./grocery-item-details.page.scss'],
  standalone: true,
  imports: [IonSkeletonText, IonBackButton, IonFooter, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ErrorComponent]
})
export class GroceryItemDetailsPage implements OnInit {

  // State
  qty = 0;
  isExpanded = false; // For description text
  productId: any;
  token: any;
  // Dummy Product Data
  product:any = {}
  cartItems: any[] = [];
  isLoading: boolean = false;
  isError: boolean = false;
  
  // {
  //   id: 101,
  //   name: 'Fresh Organic Tomatoes (Hybrid)',
  //   weight: '500 g',
  //   price: 24,
  //   originalPrice: 30,
  //   discount: 20,
  //   description: 'Freshly handpicked tomatoes from local farms. These hybrid tomatoes are rich in antioxidants and perfect for curries, salads, and soups.',
  //   images: ['https://cdn-icons-png.flaticon.com/512/1202/1202125.png'], // Usually an array for sliders
  //   tags: ['Organic', 'Farm Fresh', 'No Preservatives']
  // };

  // Similar Products
  similarProducts = [
    { name: 'Red Onion', weight: '1kg', price: 45, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png' },
    { name: 'Potato', weight: '1kg', price: 35, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png' },
    { name: 'Cucumber', weight: '500g', price: 18, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329921.png' },
  ];

  constructor(private router: Router, private groceryService: GroceryService, private authService: AuthService, private cdr: ChangeDetectorRef,) { 
    addIcons({ arrowBack, heartOutline, shareSocialOutline, timeOutline, shieldCheckmarkOutline, leafOutline, star });
  }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['productId']) {
      this.productId = navigation.extras.state['productId'];
      console.log('Product ID:', this.productId);
    }

    this.token = await this.authService.getToken();

    this.groceryService.cart$.subscribe((items) => {
      console.log('🛒 UI Cart Updated:', items);
      this.cartItems = items;
      this.cdr.detectChanges();
    });
    this.getDetails();
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

  getDetails(){
    this.isLoading = true;
    this.isError = false
    this.groceryService.getItemDetails(this.productId).subscribe((res)=>{
      this.product = res.data;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.isError = true
    });
  }

}