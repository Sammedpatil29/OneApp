import { Component, numberAttribute, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardSubtitle, IonInput, IonItem } from '@ionic/angular/standalone';
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

const RazorpayCheckout = registerPlugin<any>('RazorpayCheckout');
declare var Razorpay: any;
// declare var RazorpayCheckout: any;

declare module 'capacitor-razorpay' {
  export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  export interface RazorpayCheckoutPlugin {
    open(options: RazorpayOptions): Promise<any>;
  }
}


@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  standalone: true,
  imports: [IonItem, IonInput, IonCardSubtitle, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
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
              orderDetails: this.placedOrderDetails
            }
          });
  }

  placedOrderDetails: any

createOrder() {
  let details = {
    "ticketCount": this.ticketCount,
    "charges": this.charges,
    "finalCost": this.finalCost,
    "totalPrice": this.price,
    "customerName": this.customerName,
    "mobileNumber": this.mobileNumber,
    "email": this.email,
    "eventId": this.order.data.id,
    "eventDetails": this.order
  };

  let params = {
    token: this.token,
    type: 'event',
    title: this.order.data.title,
    created_at: Date(),
    status: 'pending',
    details: JSON.stringify(details),
  };

  this.eventService.createOrder(params).subscribe(async (res:any) => {
    this.placedOrderDetails = res;
    this.isOrderPlaced = true;

    // ✅ Send local notification
    await LocalNotifications.schedule({
      notifications: [
        {
          title: '🎉 Order Placed Successfully!',
          body: `Your order for "${this.order.data.title}" is confirmed.`,
          largeBody: 'This is a longer message that will show when expanded by the user in the notification shade.',
          id: 1, // Unique ID
          schedule: { at: new Date(Date.now() + 500) }, // 1 second delay
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
            orderDetails: res
          }
        });
      }
    }, 2000);
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

    // const successCallback = (payment_id: string) => {
    //   this.ngZone.run(() => {
    //     console.log('Payment Success:', payment_id);
    //     alert('Payment successful: ' + payment_id);
    //     // 👉 send to backend for verification
    //   });
    // };

    // const cancelCallback = (error: any) => {
    //   this.ngZone.run(() => {
    //     console.error('Payment Failed:', error);
    //     alert('Payment failed: ' + JSON.stringify(error));
    //   });
    // };

    // RazorpayCheckout.open(options, successCallback, cancelCallback);

//     document.addEventListener('deviceready', () => {
//   (window as any).RazorpayCheckout.open(options,
//     (success: any) => alert('Success: ' + JSON.stringify(success)),
//     (error: any) => alert('Error: ' + JSON.stringify(error))
//   );
// });

if ((window as any).RazorpayCheckout) {
    (window as any).RazorpayCheckout.open(
      options,
      (success: any) => {
        alert('Payment Success: ' + JSON.stringify(success));
      },
      (error: any) => {
        alert('Payment Failed: ' + JSON.stringify(error));
      }
    );
  } else {
    alert('RazorpayCheckout not found');
  }

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
}
