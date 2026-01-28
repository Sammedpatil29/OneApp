import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonCardSubtitle, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack, chevronBack, arrowForward } from 'ionicons/icons';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { register } from 'swiper/element/bundle';

declare var Razorpay: any;
declare var RazorpayCheckout: any;
// import Cashfree from 'cashfree-pg-sdk-javascript';
// import * as Cashfree from 'cashfree-pg-sdk-javascript';

declare global {
  interface Window {
    CashfreePay: any;
  }
}

register();

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonSpinner,
    IonCardSubtitle,
    IonFooter,
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class CartPage implements OnInit {

//   cartItems: any = [];
//   groceryList: any = [];
//   cartItems1: any = {};
//   token: any;
//   isLoading: boolean = false;
//   isGettingResponse: boolean = false;
//   deliveryCharge = 30;

//   ticketCount = 1;
//   order: any;
//   charges: any;
//   finalCost: any;
//   isOrderPlaced: boolean = false;
//   isNavigated: boolean = false;
//   customerName = '';
//   mobileNumber = '';
//   email = '';
//   refOrderId = '';
//   transactionId = '';
//   price = '';
//   placedOrderDetails: any = '';
//   address: any = '';
//   label: any = '';
//   selectedPayment: any = 'online'
//   keys:any;

//   private updateCart$ = new Subject<any>();
//   private destroy$ = new Subject<void>();

//   constructor(
//     private router: Router,
//     private navCtrl: NavController,
//     private groceryService: GroceryService,
//     private authService: AuthService,
//     private eventService: EventsService
//   ) {
//     addIcons({chevronBack,arrowForward,arrowBack});
//   }

  ngOnInit() {
//     const locationData = localStorage.getItem('location');
//     if (locationData) {
//       const location = JSON.parse(locationData);
//       this.address = location.address;
//       this.label = location.label;
//     }
//     this.authService
//       .getToken()
//       .then((token) => {
//         this.token = token;
//         console.log('Token:', this.token);
//         this.getcartItems();
//         this.updateCart$
//           .pipe(
//             debounceTime(500), // Optional: avoid rapid firing
//             switchMap((params) => this.groceryService.updateCartItems(params)),
//             takeUntil(this.destroy$)
//           )
//           .subscribe({
//             next: (res: any) => {
//               this.getupdatedcartItems();
//             },
//             error: (err) => {
//               console.error('❌ Error updating cart:', err);
//             },
//           });

//         let params = {
//           token:
//             this.token,
//         };
//         // this.updateCart$.next(params);
//         this.getGroceryList();
//       })
//       .catch((error) => {
//         console.error('Failed to get token:', error);
//       });
  }

//   goBack() {
//     this.navCtrl.back();
//   }

//   filtereditem: any;
//   getcartItems() {
//     let params = {
//       token:
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ"
//     };
//     this.isLoading = true;
//     this.groceryService.getCartItems(params).subscribe(
//       (res: any) => {
//         this.cartItems = res;
//         this.cartItems[0].items.forEach((item: any) => {
//           this.cartItems1[item.item_details.id] = item.quantity;
//         });
//         this.calculation()
//         console.log(this.cartItems1);
//         // console.log(this.cartItems)
//         //  this.filtereditem = res[0].items.filter((item:any)=> item.quantity != 0)
//         // this.cartItems = items
//         console.log(this.cartItems1);
//         this.isLoading = false;
//         // this.countItemsInCart();
//       },
//       (error) => {
//         this.isLoading = false;
//       }
//     );
//   }

//   getupdatedcartItems() {
//     let params = {
//       token:
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ"
//     };
//     this.isGettingResponse = true;
//     this.groceryService.getCartItems(params).subscribe(
//       (res: any) => {
//         this.cartItems = res;
//         this.cartItems[0].items.forEach((item: any) => {
//           this.cartItems1[item.item_details.id] = item.quantity;
//         });
//         this.calculation()
//         console.log(this.cartItems1);
//         // console.log(this.cartItems)
//         //  this.filtereditem = res[0].items.filter((item:any)=> item.quantity != 0)
//         // this.cartItems = items
//         console.log(this.cartItems1);
//         this.isGettingResponse = false;
//         // this.countItemsInCart();
//       },
//       (error) => {
//         this.isGettingResponse = false;
//       }
//     );
//   }

//   getNewItemPrice(quantity: any, price: any) {
//     return Number(quantity) * Number(price);
//   }

//   totalItemPrice: any;
//   totalCartItemsPrice() {
//     let temp: number[] = [];
//     this.cartItems?.items.forEach((item: any) => {
//       let price =
//         Number(item.quantity) * Number(item.item_details.price.ourPrice);
//       temp.push(price);
//     });
//     this.totalItemPrice = 0;
//     for (let i = 0; i < temp.length; i++) {
//       this.totalItemPrice = this.totalItemPrice + temp[i];
//     }
//     return this.totalItemPrice;
//   }

//   finalHandlingCharges = 0;
//   handlingCharges = 0;
//   calculateHandlingCharges() {
//     this.handlingCharges = Number(this.totalItems) * 3;
//     this.finalHandlingCharges = this.handlingCharges;
//     if (this.handlingCharges > 10) {
//       return (this.finalHandlingCharges = 10);
//     } else {
//       return this.finalHandlingCharges;
//     }
//   }

//   setDeliveryCharge() {
//     if (this.baseprice < 199) {
//       this.deliveryCharge = 30;
//       return this.deliveryCharge;
//     } else {
//       return 0;
//     }
//   }

//   totalItems = 0;
//   countItemsInCart() {}

//   finalPayableAmount() {
//     return (
//       this.totalCartItemsPrice() +
//       this.calculateHandlingCharges() +
//       this.setDeliveryCharge()
//     );
//   }

//   increment(id: any, quantity: any) {
//     quantity += 1;
//     this.changeData(id, quantity);
//     this.cartItems = [...this.cartItems];
//     let params = {
//       token:
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//       item: this.cartItems1,
//     };
//     this.isGettingResponse = true
//     this.updateCart$.next(params);
//     this.calculation()
//     // console.log(id);
//     // const index = this.cartItems.items.findIndex((item: any) => item.id === id);
//     // if (index !== -1) {
//     //   const currentItem = this.cartItems.items[index];
//     //   const availableStock = currentItem.item_details.stock;
//     //   const currentQty = currentItem.quantity;

//     //   if (currentQty < availableStock) {
//     //     currentItem.quantity += 1;

//     //     const updateItem = {
//     //       item: currentItem.item_details.id,
//     //       quantity: currentItem.quantity
//     //     };

//     //     this.countItemsInCart();
//     //     this.updateCartItems(updateItem);
//     //   } else {
//     //     console.log('⚠️ Cannot add more. Stock limit reached.');
//     //     // Optionally show toast or alert to user
//     //   }
//     // } else {
//     //   console.log('❌ Item not found');
//     // }
//   }

//   decrement(id: any, quantity: any) {
//     quantity -= 1;
//     this.changeData(id, quantity);
//     this.cartItems = [...this.cartItems];

//     let params = {
//       token:
//         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//       item: this.cartItems1,
//     };
//     this.isGettingResponse = true
//     this.updateCart$.next(params);
//     this.calculation()
//     // this.cartItems[0].items.forEach((item: any) => {
//     //   this.cartItems1[item.item_details.id] = item.quantity;
//     // });
//     // console.log(this.cartItems[0].items.length);
//     // console.log(this.cartItems1);
//     // console.log(id);
//     // if(this.totalItems == 0){
//     //     this.navCtrl.navigateBack('layout/grocery')
//     // } else {
//     //   const index = this.cartItems.items.findIndex((item: any) => item.id === id);
//     // if (index !== -1) {
//     //   const currentItem = this.cartItems.items[index];

//     //   if (currentItem.quantity > 0) {
//     //     currentItem.quantity -= 1;

//     //     const updateItem = {
//     //       item: currentItem.item_details.id,
//     //       quantity: currentItem.quantity
//     //     };

//     //     // Remove item from cart if quantity is now 0
//     //     if (currentItem.quantity === 0) {
//     //       this.cartItems.items.splice(index, 1);
//     //     }

//     //     this.countItemsInCart();
//     //     this.updateCartItems(updateItem);
//     //   } else {
//     //     console.log('⚠️ Quantity is already zero');
//     //   }
//     // } else {
//     //   console.log('❌ Item not found');
//     // }
//     // }
//   }

//   updateCartItems(updateItem: any) {
//     let result = this.cartItems.items.filter((item: any) => {
//       console.log(item);
//       return item.quantity === 0;
//     });
//     console.log(result);
//     let params = {
//       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//       items: [updateItem],
//     };
//     console.log(params);
//     this.groceryService.updateCartItems(params).subscribe((res: any) => {
//       console.log('items updated in cart');
//       // this.cartItems = res
//       // console.log(this.cartItems)
//     });
//   }

//   addItemToCart(id: any, item: any) {
//     let itemsInCart = this.cartItems.items.length;
//     console.log(itemsInCart);
//     let temp: any[] = [];
//     this.cartItems.items.forEach((item: any) => {
//       temp.push(item.id);
//     });
//     const max = Math.max(...temp);
//     let newItemforLocal = {
//       id: max + 1,
//       item: max + 1,
//       item_details: item,
//       quantity: 1,
//     };
//     console.log(newItemforLocal.id);
//     this.cartItems.items.push(newItemforLocal);
//     let newItem = {
//       item: id,
//       quantity: 1,
//     };
//     let params = {
//       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//       items: [newItem],
//     };
//     this.groceryService.updateCartItems(params).subscribe((res) => {
//       console.log('items updated in cart');
//     });
//     // this.cartItems.items.push(newItem)
//     // this.cartItemsApi = this.cartItems
//     this.countItemsInCart();
//     console.log(this.cartItems.items);
//   }

//   async payWithRazorpay() {
//     if (this.finalCost == 0) {
//       this.createOrder();
//     } else {
//       this.isLoading = true;
//       const options: any = {
//         key: 'rzp_test_RJn8z8TkeG3RU4', // Replace with your Razorpay Key ID
//         amount: this.finalCost * 100,
//         currency: 'INR',
//         name: 'Pintu Grocery',
//         description: 'Test Transaction',
//         image: 'https://your-logo.com/logo.png',
//         prefill: {
//           name: this.customerName,
//           email: this.email,
//           contact: this.mobileNumber,
//         },
//         theme: {
//           color: '#0f0f0fff',
//         },
//         handler: async (response: any) => {
//           console.log('Payment Success', response);
//           console.log('Payment Successful', JSON.stringify(response));
//           this.transactionId = response.razorpay_payment_id;
//           this.isLoading = false;
//           this.createOrder();
//           // 👉 Send response.razorpay_payment_id to backend for verification
//         },
//         modal: {
//           ondismiss: async () => {
//             this.isLoading = false;
//             console.log('Payment Cancelled', 'User closed the payment window.');
//           },
//         },
//       };

//       const rzp = new Razorpay(options);

//       rzp.on('payment.failed', async (response: any) => {
//         this.isLoading = false;
//         console.error('Payment Failed', response.error);
//         console.log('Payment Failed', JSON.stringify(response.error));
//       });

//       rzp.open();
//     }
//   }

//   paymentStatus(){
//     if(this.selectedPayment == 'online'){
//       this.updatedPaymentStatus = 'paid'
//     } else {
//       this.updatedPaymentStatus = 'pending'
//     }
//   }

//   updatedPaymentStatus: any;
//   createOrder() {
//     this.paymentStatus()
//     let custLocation = localStorage.getItem('location');
//     let order_id = `ORD${Date.now().toString()}-${
//       1000 + Math.floor(Math.random() * 9999)
//     }`;
//     this.refOrderId = order_id;
//     let details = {
//       "handlngCharges": this.charges,
//       "savings": this.totalSavingsOnthisOrder,
//       "finalCost": this.finalCost,
//       "totalPrice": this.baseprice,
//       "customerName": this.customerName,
//       "mobileNumber": this.mobileNumber,
//       "email": this.email,
//       "orderId": order_id,
//       "custLocation": custLocation,
//       "type": 'delivery',
//       "transactionId": this.transactionId,
//       "itemsCount": this.totalItems,
//       "deliveryCharges": this.delivery,
//       "lateNightFees": this.latenightCharges,
//       "surcharge": this.surcharge,
//       "promoDiscount": this.promotionalDiscount,
//       "paymentMode": this.selectedPayment,
//       "paymentStatus": this.updatedPaymentStatus,
//       "items": this.cartItems1,
//     };

//     let params = {
//       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//       type: 'grocery',
//       title: "grocery order",
//       created_at: Date(),
//       status: 'created',
//       details: JSON.stringify(details),
//     };
//     this.isLoading = true;
//     this.eventService.createGroceryOrder(params).subscribe(
//       async (res: any) => {
//         this.placedOrderDetails = res;
//         const orderDetails = JSON.parse(this.placedOrderDetails.details);
//         this.isOrderPlaced = true;
//         this.isLoading = false;
//         const uniqueId = Math.floor(Math.random() * 99);
//         // ✅ Send local notification
//         await LocalNotifications.schedule({
//           notifications: [
//             {
//               title: '🎉 Order Placed Successfully!',
//               body: `Your order for "${this.order.data.title}" is confirmed with Order Id ${orderDetails.orderId}`,
//               // largeBody: `Your order for "${this.order.data.title}" is confirmed. `,
//               id: uniqueId, // Unique ID
//               schedule: { at: new Date(Date.now() + 500) }, // 1 second delay
//               smallIcon: 'oneapp',
//               extra: {
//                 orderId: res?.id || null,
//               },
//             },
//           ],
//         });

//         // ⏱️ Navigate after 2 seconds if not already navigated
//         setTimeout(() => {
//           if (!this.isNavigated) {
//             this.navCtrl.navigateRoot('/layout/track-order', {
//               state: {
//                 orderDetails: res,
//                 from: 'order-details',
//               },
//             });
//           }
//         }, 3000);
//       },
//       (error:any) => {
//         this.isLoading = false;
//       }
//     );
//   }

//   changeData(id: any, quantity: any) {
//     this.cartItems[0].items.forEach((item: any) => {
//       if (item.item_details.id == id) {
//         if (quantity != 0) {
//           let number = Number(item.item_details.id);
//           this.cartItems1[number] = quantity;
//           // console.log(data[0].items.indexOf(item))

//           this.cartItems[0].items[
//             this.cartItems[0].items.indexOf(item)
//           ].quantity = quantity;
//           // console.log(data[0].items[data[0].items.indexOf(item)].quantity)
//         } else {
//           // let number = Number(item.item_details.id)
//           // this.cartItems1[number] = quantity

//           // this.cartItems[0].items.splice(this.cartItems[0].items[this.cartItems[0].items.indexOf(item)], 1)
//           const index = this.cartItems[0].items.indexOf(item);
//           if (index > -1) {
//             this.cartItems[0].items.splice(index, 1);
//           }
//           // this.cartItems = [...this.cartItems]
//           console.log(this.cartItems[0].items);
//           delete this.cartItems1[id];
//           // console.log(this.cartItems1)
//         }
//       } else {
//         this.cartItems1[item.item_details.id] = item.quantity;
//       }
//     });
//     // this.cartItems[0].items.forEach((item: any) => {
//     //   this.cartItems1[item.item_details.id] = item.quantity;
//     // });
//     console.log(this.cartItems[0].items.length);
//     console.log(this.cartItems1);
//     this.groceryService.updateCartItems1(this.cartItems1)
//   }

//   baseprice: number = 0;
//   discountonmrp: number = 0;
//   delivery: number = 0;
//   latenightCharges: number = 0;
//   surcharge: number = 0;
//   promotionalDiscount: number = 0;
//   mrpTotal: number = 0;
//   totalSavingsOnthisOrder: number = 0

//   calculation() {
//     this.totalItems = this.cartItems.reduce((groupTotal: any, group: any) => {
//       return (
//         groupTotal +
//         group.items.reduce((itemTotal: any, item: any) => {
//           return itemTotal + item.quantity;
//         }, 0)
//       );
//     }, 0);
//     this.baseprice = this.cartItems.reduce((groupTotal: number, group: any) => {
//       return (
//         groupTotal +
//         group.items.reduce((itemTotal: number, item: any) => {
//           const quantity = item.quantity || 0;
//           const price = item.item_details?.price?.ourPrice || 0;
//           return itemTotal + quantity * price;
//         }, 0)
//       );
//     }, 0);
//     this.mrpTotal = this.cartItems.reduce((groupTotal: number, group: any) => {
//       return (
//         groupTotal +
//         group.items.reduce((itemTotal: number, item: any) => {
//           const quantity = item.quantity || 0;
//           const price = item.item_details?.price?.mrp || 0;
//           return itemTotal + quantity * price;
//         }, 0)
//       );
//     }, 0);
//     this.handlingCharges = this.calculateHandlingCharges()
//     this.delivery = this.setDeliveryCharge()
//     this.latenightCharges = this.CalculateLateNightCharges()
//     this.totalSavingsOnthisOrder = this.savings()
//     this.finalCost = this.baseprice + this.handlingCharges + this.delivery + this.latenightCharges + this.surcharge - this.promotionalDiscount
//     if(this.finalCost > 1500){
//       this.selectedPayment = 'online'
//     }
//     if(this.finalCost < 0){
//       this.finalCost = 0
//     }
//   }

//   getTime(){
//     let now = new Date()
//     let hour = now.getHours()
//     return (hour >= 22 || hour < 6)
// }

// savings(){
//   let fixedSavings = this.mrpTotal - this.baseprice
//   let LateNightCharge = 0
//   let deliveryCharge = 0
//   if(this.getTime() && this.latenightCharges == 0){
//     LateNightCharge = this.CalculateLateNightCharges()
//   }
//   if(this.delivery == 0){
//     deliveryCharge = 30
//   }
//   let promotionalDiscount = this.promotionalDiscount
//   return fixedSavings + LateNightCharge + promotionalDiscount + deliveryCharge
// }

// CalculateLateNightCharges(){
//   if(this.getTime()){
//     let charges = this.baseprice * 0.10;
//     if(charges > 25){
//       charges = 25
//     } 
//     return charges
//   } else {
//     return 0
//   }
// }

// openMap() {
//     this.navCtrl.navigateForward('/layout/map');
//   }

//   pay(){
//     if(this.selectedPayment == 'cod'){
//       this.createOrder()
//     } else {
//       this.payWithRazorpay()
//     }
//   }

//    trackOrder(){
//     this.isNavigated = true
//       this.navCtrl.navigateRoot('/layout/track-order', {
//             state: {
//               orderDetails: this.placedOrderDetails,
//               from: 'order-details'
//             }
//           });
//   }
   
//   applyCash(){
//     if(this.promotionalDiscount == 0){
//       this.promotionalDiscount = 50
//       this.calculation()
//   } else {
//       this.promotionalDiscount = 0
//       this.calculation()
//   }
//   }

//   getGroceryList(){
//     const params = {
//       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
//     };
//     this.groceryService.getGroceryList(params).subscribe((res:any)=>{
//       this.groceryList = res
//     })
//   }
}
