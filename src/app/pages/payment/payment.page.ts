import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonAvatar, IonLabel, IonItem, IonList } from '@ionic/angular/standalone';

import { registerPlugin } from '@capacitor/core';

import { Checkout } from 'capacitor-razorpay';
import { Browser } from '@capacitor/browser';
import { HttpClient } from '@angular/common/http';
import { RazorpayService } from 'src/app/services/razorpay.service';

const CFBridge = registerPlugin('CFBridge') as any;
declare var Razorpay: any;
declare var RazorpayCheckout: any;
@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonLabel, IonAvatar, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PaymentPage implements OnInit {
upiApps: any;
  constructor(private http: HttpClient, private razorpayService: RazorpayService) { }

  ngOnInit() {
  }

  async showUPIApps() {
    const appsResponse = await CFBridge.getUPIApps();
    // this.upiApps = appsResponse
    this.upiApps = appsResponse.apps.map((app:any) => ({
      displayName: app.displayName,
      id: app.id,
      icon: app.icon
    }));
    console.log(this.upiApps)
  }

  async payWith(appId: string) {
    try {
      const response = await CFBridge.startPaymentUPI({
        appId,
        tokenData: 'PB9JCVXpkI6ICc5RnIsICN4MzUIJiOicGbhJye.f3QfiEDMwIXZkJ3T0NXZUJiOiQWSyVGZy9mIsIiUOlkI6ISej5WZyJXdDJXZkJ3biwiIwAjLwATMiojI05Wdv1WQyVGZy9mIsIjMzUTM1UTN3EjOiAHelJCLiQWOxQDNlhDOwMTY4YjI6ICdsF2cfJye.lkDkcBLJURs2CSd-jnD5gJltdsSV2AN3v-2TJfjIXPPjtuY0HXX4jI8MpG0jNiDl2W',  // from backend
        orderId: 'TestOrder001',
        orderCurrency: 'INR',
        orderAmount: '100.00',
        customerName: 'John Doe',
        customerPhone: '9876543210',
        customerEmail: 'john@example.com',
        stage: 'TEST', // or 'PROD'
        // Optional: orderNote, notifyUrl, appName, paymentModes, etc.
      });
      console.log('Payment response:', response);
      // response includes txStatus, referenceId, signature, etc.
    } catch (err) {
      console.error('Payment failed:', err);
    }
  }

  getIcon(icon:any){
    return `data:image/png;base64,${icon}`
  }

  async payWithRazorpay(){
    const options = {
      key: 'rzp_test_mumd7Md1QvW8oy',
      amount: '100',
      description: 'Great offers',
      image: 'https://i.imgur.com/3g7nmJC.png',
      order_id: 'order_Cp10EhSaf7wLbS',//Order ID generated in Step 1
      currency: 'INR',
      name: 'Acme Corp',
      prefill: {
        email: 'gaurav.kumar@example.com',
        contact: '9191919191'
      },
      theme: {
        color: '#3399cc'
      }
    };
    try {
      let data = (await Checkout.open(options));
      console.log(data.response+"AcmeCorp");

      // this.presentAlert(data.response);
    } catch (error) {
      console.log('grgrg',error)
      // this.presentAlert(error.message); //Doesn't appear at all
    }
  }

  async startWebPayment() {
    const paymentData = {
      orderId: 'ORDER12345',
      orderAmount: 1000,  // Amount in paisa (1000 = 10 INR)
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      customerPhone: '1234567890',
      orderCurrency: 'INR',
      orderNote: 'Test web payment',
      appId: 'TEST101213018eca30f9343a22e293f110312101',
      secretKey: 'cfsk_ma_test_f55d92e2301e996007f075cb84ec0492_1ae48a5f',
    };

    try {
      const response = await CFBridge.startPaymentWEB({
        orderId: paymentData.orderId,
        orderAmount: paymentData.orderAmount,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        orderCurrency: paymentData.orderCurrency,
        orderNote: paymentData.orderNote,
        appId: paymentData.appId,
        secretKey: paymentData.secretKey,
      });

      console.log('Payment Response:', response);
      if (response.status === 'success') {
        console.log('Payment was successful!');
      } else {
        console.log('Payment failed!');
      }
    } catch (error) {
      console.error('Error during payment:', error);
    }
  }

  openPaymentGateway() {
      const options: any = {
        key: 'rzp_live_p6MXH1oq4BBYPk', // Replace with your Razorpay Key
        amount: 100, // Amount in paise (1 INR = 100 paise)
        currency: 'INR', // Currency
        name: 'demoCompany', // Your company name
        description: 'Payment for selected plan',
        // image: 'https://example.com/logo.png', // Optional: Add your logo
        handler: (response: any) => {
         console.log('payment done')
        },
        error_handler: (error: any) => {
          alert('Payment Failed: ' + error.description);
        },
        prefill: {
          name: 'sammed',
          email: 'sammed@gmail.com',
          contact: '9591420068'
        },
        notes: {
          message: 'Thank you for choosing demoCompany'
        },
        theme: {
          color: '#000000ff' // Customize the theme color
        }
      };
  
      // Initialize Razorpay checkout
      const razorpay = new Razorpay(options);
      razorpay.open();
    }

    payWithRazorpaycardova() {
  var options = {
    description: 'Test Payment',
    currency: 'INR',
    key: 'rzp_test_mumd7Md1QvW8oy',
    amount: 100, // amount in paise
    name: 'OneApp Events',
    prefill: {
      email: '',
      contact: '',
      name: ''
    },
    theme: { color: '#050505ff' }
  };

  RazorpayCheckout.open(options,
    (success:any) => {
      alert('Payment Success: ' + success.razorpay_payment_id);
    },
    (error:any) => {
      alert('Error: ' + error.description);
    }
  );
}

razorpayServiceOpen(){
  this.razorpayService.payWithRazorpayCardOVA(
      100,
      'John Doe',
      'john@example.com',
      '9876543210'
    ).subscribe({
      next: (result) => {
        console.log('Payment Success:', result.razorpay_payment_id);
        // show toast or navigate
        alert(result.razorpay_payment_id)
      },
      error: (err) => {
        console.error('Payment Failed:', err.description);
        // show error toast or alert
        alert(err.description)
      }
    });
}
}
