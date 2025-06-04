import { Component, numberAttribute, OnInit } from '@angular/core';
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
  customerName = ''
  mobileNumber = ''
  email = ''
  token: any

  constructor(private navCtrl: NavController, private authService: AuthService, private router: Router, private eventService: EventsService) {
    addIcons({arrowBack});
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

 

  goBack(){
this.navCtrl.back()
  }
}
