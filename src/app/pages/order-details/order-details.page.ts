import { Component, numberAttribute, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardSubtitle, IonInput, IonItem } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { Router } from '@angular/router';

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

  constructor(private navCtrl: NavController, private router: Router) {
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

  placeOrder(){
this.isOrderPlaced = true
setTimeout(()=>{
  if(!this.isNavigated){
    this.navCtrl.navigateRoot('/layout/track-order')
  } 
}, 2000)
  }

  trackOrder(){
    this.isNavigated = true
      this.navCtrl.navigateRoot('/layout/track-order')
  }

  goBack(){
this.navCtrl.back()
  }
}
