import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

declare var window: any;
import { addIcons } from 'ionicons';
import { arrowBack, locationOutline, timeOutline,location, checkmarkCircle, arrowForward, pricetagOutline } from 'ionicons/icons';
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
export class CartPage implements OnInit, OnDestroy {

  isLoading = true;
  isError: boolean = false;
  checking = false;
  isOrderPlaced = false;
  
  // Polling State
  pendingOrderId: any = null;
  pollingInterval: any = null;
  isPaymentDetected = false;
  
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
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) { 
    addIcons({ arrowBack, locationOutline, timeOutline, checkmarkCircle, arrowForward, pricetagOutline, location });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    this.checkPendingOrder();
    this.groceryService.cart$.subscribe((cartItems) => {
      console.log('Cart Items Updated:', cartItems);
      this.cartItems = cartItems;
      this.fetchCartData();

      this.cdr.detectChanges();
    });
  }

  fetchCartData() {
    this.isLoading = true;
    this.isError = false;
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
      this.isError = true;
  })
}

  checkBeforePayment() {
    this.checking = true;
    this.isError = false;
    this.groceryService.getCartdata(this.token, this.couponCode).subscribe(
      (res) => {
        console.log('📦 Cart API Response:', res);

        let isChanged = false;
        let msg = 'Cart details have changed. Please review.';
        console.log(msg)

        if (this.billDetails.toPay !== res.data.billDetails.toPay) {
          isChanged = true;
          msg = 'Bill amount updated. Please review.';
          console.log(msg)
        } else if (this.items && res.data.items) {
          for (const item of this.items) {
            const newItem = res.data.items.find((i: any) => i.productId === item.productId);
            if (newItem && item.isOutOfStock === false && newItem.isOutOfStock === true) {
              isChanged = true;
              msg = 'Some items are now out of stock.';
              console.log(msg)
              break;
            }
          }
        }

        if (!isChanged) {
          console.log('opening pay')
          this.checking = false;
          this.pay();
        } else {
          console.log('presenting toast')
          this.presentToast(msg);
          this.cartData = res.data;
          this.items = res.data.items;
          this.billDetails = res.data.billDetails;
          this.suggestions = res.data.suggestions;
          this.isCouponApplied = this.billDetails.couponStatus === 'applied';
          this.checking = false;
        }
      },
      (error) => {
        console.error('Error fetching cart data:', error);
        this.checking = false;
        this.isError = true;
      }
    );
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
    if(this.selectedPayment === 'cod') {
      let params = {
        cartItems: this.cartData.items,
        billDetails: this.cartData.billDetails,
        address: this.address,
        status: 'confirmed',
        paymentDetails: {
          mode: 'cod',
        }
      }
      this.groceryService.placeGroceryOrder(this.token, params).subscribe((res:any)=>{
        this.isOrderPlaced = true;
        this.groceryService.clearCart();
        this.isLoading = false;
        this.navCtrl.navigateRoot(`/layout/grocery-layout/grocery-order-details/${res.data.id}`)
      })
    } else {
        // Online Payment Flow
        const params = {
          cartItems: this.cartData.items,
          billDetails: this.cartData.billDetails,
          address: this.address,
          status: 'pending', 
          paymentDetails: { mode: 'online' }
        };

        this.groceryService.placeGroceryOrder(this.token, params).subscribe({
          next: async (res: any) => {
            if (res.success && res.razorpay_order_id) {
               this.pendingOrderId = res.internal_order_id;
               await Preferences.set({ key: 'pending_grocery_order_id', value: res.internal_order_id });
               this.initiateRazorpay(res.razorpay_order_id);
            } else {
               // Fallback: Just clear cart if backend says success but no razorpay id (zero cost?)
               this.handleSuccess(res, this.pendingOrderId );
            }
          },
          error: (err) => {
            console.error('Order Creation Failed', err);
            this.isLoading = false;
            this.presentToast('Order creation failed');
          }
        });
    }
  }

  // --- Payment Polling & Refund Logic ---

  async checkPendingOrder() {
    const { value } = await Preferences.get({ key: 'pending_grocery_order_id' });
    if (value) {
      this.pendingOrderId = value;
      this.startPolling(this.pendingOrderId);
    }
  }

  initiateRazorpay(rzpOrderId: string) {
    const options = {
      key: 'rzp_test_S5RLYqr6y2I6xs', 
      amount: (this.billDetails.toPay * 100).toString(), 
      currency: 'INR',
      name: 'Pintu Grocery',
      description: 'Grocery Order',
      image: 'https://your-logo-url.com/logo.png',
      order_id: rzpOrderId, 
      theme: { color: '#121212' }
    };

    this.platform.ready().then(() => {
      if (typeof window.RazorpayCheckout !== 'undefined') {
        window.RazorpayCheckout.open(options);
        this.startPolling(this.pendingOrderId);
      } else {
        this.isLoading = false;
        this.presentToast("Razorpay Plugin not installed");
      }
    });
  }

  startPolling(internalOrderId: string) {
    console.log("Started polling for:", internalOrderId);
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      this.checkStatusFromBackend(internalOrderId);
    }, 3000);

    setTimeout(() => {
      if (!this.isPaymentDetected) {
        this.stopPolling();
        this.isLoading = false;
      }
    }, 120000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  checkStatusFromBackend(internalOrderId: string) {
    this.groceryService.verifyPayment({ orderId: internalOrderId }).subscribe({
      next: (res: any) => {
        if (res.success && res.status === 'paid') {
           this.handleSuccess(res, internalOrderId);
        } else if (res.status === 'failed') {
           this.stopPolling();
           this.isLoading = false;
           this.presentToast("Payment Failed.");
        }
      },
      error: (err) => console.log("Poll error", err)
    });
  }

  async handleSuccess(res: any, internalOrderId:any) {
    this.isPaymentDetected = true;
    this.stopPolling();
    await Preferences.remove({ key: 'pending_grocery_order_id' });
    this.groceryService.clearCart();
    // this.isOrderPlaced = true;
    this.navCtrl.navigateRoot(`/layout/grocery-layout/grocery-order-details/${internalOrderId}`, {
      animated: true,
      animationDirection: 'forward'
    })
    this.isLoading = false;
    this.presentToast("Order Placed Successfully! 🚀");
  }

  ngOnDestroy() {
    this.stopPolling();
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