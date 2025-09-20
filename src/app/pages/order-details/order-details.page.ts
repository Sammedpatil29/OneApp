import { Component, numberAttribute, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardSubtitle, IonInput, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { Router } from '@angular/router';
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Checkout } from 'capacitor-razorpay';
import { Platform } from '@ionic/angular';
// import { RazorpayCheckout } from 'capacitor-razorpay';
import { registerPlugin } from '@capacitor/core';

// const RazorpayCheckout = registerPlugin<any>('RazorpayCheckout');
declare var Razorpay: any;
declare var RazorpayCheckout: any;

// declare module 'capacitor-razorpay' {
//   export interface RazorpayOptions {
//     key: string;
//     amount: number;
//     currency: string;
//     name: string;
//     description?: string;
//     prefill?: {
//       email?: string;
//       contact?: string;
//       name?: string;
//     };
//     theme?: {
//       color?: string;
//     };
//   }

//   export interface RazorpayCheckoutPlugin {
//     open(options: RazorpayOptions): Promise<any>;
//   }
// }


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonItem, IonInput, IonCardSubtitle, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OrderDetailsPage implements OnInit {
  ticketCount = 1
  order: any;
  charges: any;
  finalCost: any;
  isOrderPlaced: boolean = false
  isNavigated: boolean = false
  isLoading: boolean = false
  customerName = ''
  mobileNumber = ''
  email = ''
  token: any
  refOrderId = ''

  constructor(private navCtrl: NavController, private platform: Platform, private authService: AuthService, private router: Router, private eventService: EventsService, private ngZone: NgZone) {
    addIcons({arrowBack});
    document.addEventListener('deviceready', () => {
    console.log('Device ready - Cordova plugins available');
  });
   }
   price: number | undefined;

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state && nav.extras.state['order']) {
      this.order = nav.extras.state['order'];
      console.log('Received order:', this.order);
      this.price = this.ticketCount * Number(this.order.data.ticketPrice)
    }
    this.calculatePrice()

    this.authService.getToken().then((res)=>{
      this.token = res
    })
  }

  calculatePrice(){
    if(this.order.data.isFree){
      this.price = 0
      this.charges = 0
      this.finalCost = 0
    } else {
      this.price = this.ticketCount * Number(this.order.data.ticketPrice)
    this.charges = this.price * 0.07
    this.finalCost = this.price + this.charges
    }
  }

  count(opr:any){
    if(opr == '+'){
      this.ticketCount = this.ticketCount + 1
      this.calculatePrice()
    } else {
      if(this.ticketCount == 1){
        // alert('no')
      } else {
      this.ticketCount = this.ticketCount - 1
      this.calculatePrice()
      }
    }
  }


  trackOrder(){
    this.isNavigated = true
      this.navCtrl.navigateRoot('/layout/track-order', {
            state: {
              orderDetails: this.placedOrderDetails,
              from: 'order-details'
            }
          });
  }

  placedOrderDetails: any

createOrder() {
  let custLocation = localStorage.getItem('location')
  let order_id = `ORD${Date.now().toString()}-${1000 + Math.floor(Math.random() * 9999)}`
  this.refOrderId = order_id
  let details = {
    "ticketCount": this.ticketCount,
    "charges": this.charges,
    "finalCost": this.finalCost,
    "totalPrice": this.price,
    "customerName": this.customerName,
    "mobileNumber": this.mobileNumber,
    "email": this.email,
    "eventId": this.order.data.id,
    "eventDetails": this.order,
    "orderId": order_id,
    "custLocation": custLocation,
    "type":'nonDelivery'
  };

  let params = {
    token: this.token,
    type: 'event',
    title: this.order.data.title,
    created_at: Date(),
    status: 'active',
    details: JSON.stringify(details),
  };
this.isLoading = true
  this.eventService.createOrder(params).subscribe(async (res:any) => {
    this.placedOrderDetails = res;
    const orderDetails = JSON.parse(this.placedOrderDetails.details)
    this.isOrderPlaced = true;
    this.isLoading = false
    const uniqueId = Math.floor(Math.random()*99)
    // ✅ Send local notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🎉 Order Placed Successfully!',
          body: `Your order for "${this.order.data.title}" is confirmed with Order Id ${orderDetails.orderId}`,
          // largeBody: `Your order for "${this.order.data.title}" is confirmed. `,
          id: uniqueId, // Unique ID
          schedule: { at: new Date(Date.now() + 500) }, // 1 second delay
          smallIcon: 'oneapp',
          extra: {
            orderId: res?.id || null
          }
        }
      ]
    });

    // ⏱️ Navigate after 2 seconds if not already navigated
    setTimeout(() => {
      if (!this.isNavigated) {
        this.navCtrl.navigateRoot('/layout/track-order', {
          state: {
            orderDetails: res,
            from: 'order-details'
          }
        });
      }
    }, 3000);
  }, error => {
    this.isLoading = false
  });
}


isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

 payWithRazorpaycardova() {
    const options = {
      description: 'Test Payment',
      currency: 'INR',
      key: 'rzp_live_p6MXH1oq4BBYPk',
      amount: 100,
      name: 'OneApp Events',
      prefill: {
        email: '',
        contact: '8686868686',
        name: ''
      },
      theme: { color: '#050505ff' }
    };

    try {
      RazorpayCheckout.open(
        options,
        async (paymentData: any) => {
          console.log('Payment Success:', paymentData);
          console.log('Payment Successful!', JSON.stringify(paymentData));
          // 👉 send paymentData.razorpay_payment_id to your server for verification
        },
        async (error: any) => {
          console.error('Payment Failed:', error);
          console.log('Payment Failed', JSON.stringify(error));
        }
      );
    } catch (err) {
      console.error('Unexpected Error:', err);
    }

  //   const successCallback = (payment_id: string) => {
  //     this.ngZone.run(() => {
  //       console.log('Payment Success:', payment_id);
  //       alert('Payment successful: ' + payment_id);
  //     });
  //   };

  //   const cancelCallback = (error: any) => {
  //     this.ngZone.run(() => {
  //       console.error('Payment Failed:', error);
  //       alert('Payment failed: ' + JSON.stringify(error));
  //     });
  //   };

  //   document.addEventListener('deviceready', () => {
  //   if ((window as any).RazorpayCheckout) {
  //     console.log('Opening Razorpay...');
  //     (window as any).RazorpayCheckout.open(options, successCallback, cancelCallback);
  //   } else {
  //     alert('RazorpayCheckout plugin not found');
  //   }
  // });

//     document.addEventListener('deviceready', () => {
//   (window as any).RazorpayCheckout.open(options,
//     (success: any) => alert('Success: ' + JSON.stringify(success)),
//     (error: any) => alert('Error: ' + JSON.stringify(error))
//   );
// });

// if ((window as any).RazorpayCheckout) {
//     (window as any).RazorpayCheckout.open(
//       options,
//       (success: any) => {
//         alert('Payment Success: ' + JSON.stringify(success));
//       },
//       (error: any) => {
//         alert('Payment Failed: ' + JSON.stringify(error));
//       }
//     );
//   } else {
//     alert('RazorpayCheckout not found');
//   }

    // (window as any).RazorpayCheckout.open(
    //   options,
    //   (success: any) => {
    //     alert('Payment Success: ' + JSON.stringify(success));
    //   },
    //   (error: any) => {
    //     alert('Payment Failed: ' + JSON.stringify(error));
    //   }
    // );
}

// successCallback(payment_id: any) {
//   console.log("Payment success:", payment_id);
//   alert("Payment success: " + payment_id);
// }

// cancelCallback(error: any) {
//   console.log("Payment failed:", error);
//   alert("Payment failed: " + JSON.stringify(error));
// }

  goBack(){
this.navCtrl.back()
  }

  async razorpayCapacitor(){
    try {
      const result = await RazorpayCheckout.open({
        key: 'rzp_live_p6MXH1oq4BBYPk',
        amount: 100,
        currency: 'INR',
        name: 'OneApp Events',
        description: 'Test Payment',
        prefill: {
          contact: '9876543210'
        }
      });
      alert('✅ Payment Success: ' + JSON.stringify(result));
    } catch (err) {
      alert('❌ Payment Failed: ' + JSON.stringify(err));
    }
  }

  async payWithRazorpay() {
    if(this.finalCost == 0){
        this.createOrder()
    } else {
      this.isLoading = true
    const options: any = {
      key: 'rzp_test_mumd7Md1QvW8oy', // Replace with your Razorpay Key ID
      amount: 100, 
      currency: 'INR',
      name: 'OneApp Events',
      description: 'Test Transaction',
      image: 'https://your-logo.com/logo.png',
      prefill: {
        name: 'Sammed',
        email: 'test@example.com',
        contact: '8578477474',
      },
      theme: {
        color: '#0f0f0fff',
      },
      handler: async (response: any) => {
        console.log('Payment Success', response);
        console.log('Payment Successful', JSON.stringify(response));
        this.isLoading = false
        this.createOrder()
        // 👉 Send response.razorpay_payment_id to backend for verification
      },
      modal: {
        ondismiss: async () => {
          this.isLoading = false
          console.log('Payment Cancelled', 'User closed the payment window.');
        }
      }
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', async (response: any) => {
      this.isLoading = false
      console.error('Payment Failed', response.error);
      console.log('Payment Failed', JSON.stringify(response.error));
    });

    rzp.open();
    }
  }
}
