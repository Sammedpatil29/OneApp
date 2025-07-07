import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
// import Cashfree from 'cashfree-pg-sdk-javascript';
// import * as Cashfree from 'cashfree-pg-sdk-javascript';

declare global {
  interface Window {
    CashfreePay: any;
  }
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonFooter, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CartPage implements OnInit {

  cartItems: any;
  token: any;
  isLoading: boolean = false
  deliveryCharge = 30

  constructor(private router: Router, private navCtrl: NavController, private groceryService: GroceryService, private authService: AuthService) { 
    addIcons({arrowBack}); 
  }

  ngOnInit() {
    this.authService
      .getToken()
      .then((token) => {
        this.token = token;
        console.log('Token:', this.token);
        this.getcartItems()
      })
      .catch((error) => {
        console.error('Failed to get token:', error);
      });
  }

   goBack() {
    this.navCtrl.back()
  }

   async payWithUPI() {
  // Wait for CashfreePay SDK to load
  await this.loadCashfreeSDK();
  await this.waitForCashfreeSDK();

  const res = await fetch('http://localhost:3000/generate-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: 'ORDER123_' + Date.now(),
      order_amount: 10.00,
      customer_phone: '9999999999',
      customer_email: 'test@example.com'
    })
  });

  const data = await res.json();
  if (!data.success) {
    alert('Token generation failed');
    return;
  }

  const cashfree = new window.CashfreePay.Checkout();

  cashfree.init({
    paymentSessionId: data.payment_session_id,
    mode: 'upi',
    upiIntent: true
  });

  cashfree.pay();
}

waitForCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.CashfreePay) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.CashfreePay) {
          clearInterval(interval);
          resolve();
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        reject('CashfreePay SDK failed to load');
      }, 5000);
    }
  });
}

loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.CashfreePay && window.CashfreePay.Checkout) {
      return resolve();
    }

    const scriptId = 'cashfree-pay-sdk';

    // Avoid loading twice
    if (document.getElementById(scriptId)) {
      return resolve();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://sdk.cashfree.com/js/v1/cashfree.pay.js';
    script.onload = () => {
      if (window.CashfreePay && window.CashfreePay.Checkout) {
        resolve();
      } else {
        reject('CashfreePay SDK loaded but Checkout not found');
      }
    };
    script.onerror = () => reject('Failed to load CashfreePay SDK');
    document.body.appendChild(script);
  });
}
filtereditem:any
getcartItems(){
  let params = {
      "token": this.token
  }
  this.isLoading = true
  this.groceryService.getCartItems(params).subscribe((res:any)=> {
    this.cartItems = res[0]
    // console.log(this.cartItems)
    //  this.filtereditem = res[0].items.filter((item:any)=> item.quantity != 0)
    // this.cartItems = items
    console.log(this.cartItems)
    this.isLoading = false
  }, error => {
    this.isLoading = false
  })
}

getNewItemPrice(quantity:any, price:any){
  return Number(quantity)*Number(price)
}

setDeliveryCharge(){
  return this.deliveryCharge
}

 openUpiApp() {
    const upiIntentLink = 'intent://pay' +
      '?pa=9591420068kbl@ybl' +            // Replace with your UPI ID
      '&pn=Sammed Patil' +            // Replace with your name
      '&tn=Payment%20for%20order' +
      '&am=10.00' +
      '&cu=INR' +
      '#Intent;scheme=upi;end;';

    window.location.href = upiIntentLink;
  }

// totalProductCost() {
//   const prices = this.cartItems.items.map((cartItem: any) => {
//     const unitPrice = cartItem.item_details.price.amount;
//     const quantity = cartItem.quantity;
//     this.getNewItemPrice(unitPrice, quantity);
    
//   })
//   const total = prices.reduce((sum: any, val: any) => sum + val, 0);
//   console.log('Total Cost:', Number(total));
//   return total;
// }

}
