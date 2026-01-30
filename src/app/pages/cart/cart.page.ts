import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, locationOutline, timeOutline, checkmarkCircle, arrowForward, pricetagOutline } from 'ionicons/icons';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
// import { CartResponse, CartItem, Suggestion } from './cart.models'; // Ensure you have the interface file
import { ProductCardComponent } from "../../components/product-card/product-card.component";
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ProductCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartPage implements OnInit {

  isLoading = true;
  isOrderPlaced = false;
  
  // Data Containers
  cartData: any | null = null;
  items: any[] = [];
  suggestions: any[] = [];
  billDetails: any = {};

  // UI State
  address = "Home - 123, Green Street, Bengaluru";
  selectedPayment = 'online'; // Default
  couponCode = '';
  isCouponApplied = false;
  token:any;
  cartItems: any[] = [];


  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private groceryService: GroceryService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { 
    addIcons({ arrowBack, locationOutline, timeOutline, checkmarkCircle, arrowForward, pricetagOutline });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    this.groceryService.cart$.subscribe((cartItems) => {
      console.log('Cart Items Updated:', cartItems);
      this.cartItems = cartItems;
      this.fetchCartData();

      this.cdr.detectChanges();
    });
  }

  fetchCartData() {
    this.isLoading = true;
     this.groceryService.getCartdata(this.token, this.couponCode).subscribe(apiResponse => {
        console.log('📦 Cart API Response:', apiResponse);

      this.cartData = apiResponse.data;
      this.items = apiResponse.data.items;
      this.billDetails = apiResponse.data.billDetails;
      this.suggestions = apiResponse.data.suggestions;
      if(this.billDetails.couponStatus === 'applied') {
        this.isCouponApplied = true;
      } else {
        this.isCouponApplied = false;
      }
      this.isLoading = false
  }, error =>{
      console.error('Error fetching cart data:', error);
      this.isLoading = false;
  })
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

  addSuggestion(productId: number) {
    console.log(`Add Suggestion ID: ${productId}`);
    this.presentToast('Item added to cart');
  }

  applyCoupon() {
    if(!this.couponCode) {
      this.presentToast('Please enter a coupon code');
      return;
    }
    // Simulate API check
    this.fetchCartData()
    if(this.billDetails.couponStatus === 'applied') {
      this.isCouponApplied = true;
      this.presentToast('Coupon applied successfully');
    } else {
      this.isCouponApplied = false;
      this.presentToast('Invalid coupon code');
    }
    // Update bill details logic would happen here based on API response
  }

  removeCoupon() {
    this.isCouponApplied = false;
    this.couponCode = '';
    this.fetchCartData();
  }

  pay() {
    if(this.selectedPayment === 'cod' && parseFloat(this.billDetails.toPay) > 1500) {
      this.presentToast('COD not available for orders above ₹1500');
      return;
    }
    
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isOrderPlaced = true;
    }, 2000);
  }

  goBack() {
    this.navCtrl.back();
  }

  openMap() {
    console.log('Open Map');
  }

  trackOrder() {
    console.log('Track Order');
  }

  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }
}