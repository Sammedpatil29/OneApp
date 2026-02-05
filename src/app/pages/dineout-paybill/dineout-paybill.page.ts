import { Component, OnInit, OnDestroy, NgZone } from '@angular/core'; // Import NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, NavController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cashOutline, pricetagOutline, arrowForwardCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { DineoutService } from 'src/app/services/dineout.service';
import { AuthService } from 'src/app/services/auth.service';

declare var RazorpayCheckout: any;

@Component({
  selector: 'app-dineout-paybill',
  templateUrl: './dineout-paybill.page.html',
  styleUrls: ['./dineout-paybill.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class dineoutPaybillPage implements OnInit, OnDestroy {
  enteredAmount: number | null = null;
  billData: any | null = null;
  isLoading = false;
  bookingId: any;
  restaurantId: any;
  token: any;

  // ⚡ Polling State
  pollingInterval: any = null;
  isPaymentDetected: boolean = false;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private dineOutService: DineoutService,
    private authService: AuthService,
    private platform: Platform,
    private zone: NgZone // Inject NgZone
  ) {
    addIcons({ arrowBackOutline, cashOutline, pricetagOutline, arrowForwardCircleOutline, shieldCheckmarkOutline });
  }

  async ngOnInit() {
    this.bookingId = history.state.bookingId;
    this.restaurantId = history.state.restaurantId;
    this.token = await this.authService.getToken();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  goBack() {
    this.navCtrl.back();
  }

  async calculateBill() {
    if (!this.enteredAmount || this.enteredAmount <= 0) {
      this.showToast('Please enter a valid bill amount', 'warning');
      return;
    }

    this.isLoading = true;
    this.billData = null; 

    let params: any = { "billAmount": this.enteredAmount };
    
    if(this.restaurantId) params["restaurantId"] = this.restaurantId;
    if(this.bookingId) params["bookingId"] = this.bookingId;

    this.dineOutService.calculateBill(this.token, params).subscribe({
      next: (res: any) => {
        if(res.success) {
           this.billData = res.data;
        } else {
           this.showToast(res.message || 'Could not calculate offers', 'warning');
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to calculate bill:', err);
        this.showToast('Failed to calculate bill. Try again.', 'danger');
        this.isLoading = false;
      }
    });
  }

  async processPayment() {
    if (!this.enteredAmount) {
      this.showToast('Please enter a valid bill amount', 'warning');
      return;
    }

    // Use finalAmount from API if available (after discount), else use entered amount
    const amountToPay = this.billData?.finalAmount || this.enteredAmount;

    const loading = await this.loadingCtrl.create({
      message: 'Initiating Payment...',
      spinner: 'crescent',
    });
    await loading.present();

    const params = {
      billAmount: amountToPay,
      discount: this.enteredAmount - amountToPay,
      restaurantId: this.restaurantId,
      bookingId: this.bookingId
    };

    this.dineOutService.initiatePayment(this.token, params).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        if (res.success) {
          this.openRazorpay(res);
        } else {
          this.showToast(res.message || 'Failed to initiate payment', 'danger');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.showToast('Error initiating payment', 'danger');
      }
    });
  }

  openRazorpay(paymentData: any) {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const options = {
      key: 'rzp_test_S5RLYqr6y2I6xs', 
      amount: paymentData.amount * 100, // Amount in paise
      currency: paymentData.currency,
      name: 'Pintu Dineout',
      description: 'Bill Payment',
      order_id: paymentData.razorpay_order_id,
      prefill: {
        email: userDetails.email || '',
        contact: userDetails.phone || '',
        name: userDetails.name || ''
      },
      theme: { color: '#0e4d2a' }
    };

    // 1. Open Razorpay
    RazorpayCheckout.open(options, 
      // Success Callback (Might not always fire if app killed)
      (success: any) => {
         console.log("Razorpay Success Callback Triggered");
         // Run inside Angular Zone
         this.zone.run(() => {
             this.showToast('Processing Payment...', 'secondary');
         });
      }, 
      // Error Callback
      (error: any) => {
         this.zone.run(() => {
             this.showToast('Payment Cancelled/Failed: ' + error.description, 'medium');
             this.stopPolling();
         });
      }
    );

    // 2. 🚀 START POLLING IMMEDIATELY
    // We assume user is paying. We keep asking backend "Is it paid?"
    this.startPolling(paymentData.internal_order_id);
  }

  // --- POLLING LOGIC ---

  startPolling(internalOrderId: string) {
    console.log("Started polling for:", internalOrderId);
    this.stopPolling(); // Clear existing

    // Poll every 3 seconds
    this.pollingInterval = setInterval(() => {
      this.checkStatusFromBackend(internalOrderId);
    }, 3000);

    // Failsafe: Stop polling after 2 minutes
    setTimeout(() => {
      if (!this.isPaymentDetected && this.pollingInterval) {
        this.stopPolling();
        this.showToast('Payment verification timed out. Please check booking status.', 'warning');
      }
    }, 120000);
  }

  checkStatusFromBackend(internalOrderId: string) {
    this.dineOutService.verifyPayment(this.token, { orderId: internalOrderId }).subscribe({
      next: (res: any) => {
        // Backend returns 'paid' status usually when Webhook is received or Payment captured
        if (res.success && (res.status === 'paid' || res.status === 'SUCCESS')) {
           this.handleSuccess(res, internalOrderId);
        } else if (res.status === 'failed') {
           this.stopPolling();
           this.showToast("Payment Failed.", 'danger');
        }
      },
      error: (err) => {
        // Ignore network errors during polling, retry next cycle
        console.log("Poll error", err);
      }
    });
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  handleSuccess(res: any, internalOrderId: string) {
    if (this.isPaymentDetected) return; // Prevent double execution
    this.isPaymentDetected = true;
    this.stopPolling();
    
    // Use NgZone to ensure navigation happens within Angular's detection cycle
    this.zone.run(() => {
        this.showToast('Payment Successful! 🎉', 'success');

        const targetId = this.bookingId ? this.bookingId : internalOrderId;
        console.log('booking Id:', this.bookingId)
        console.log('restaurantId', internalOrderId)

        // Option 1: Replace current view (History is cleared, good for receipt pages)
        if(this.bookingId){
          this.navCtrl.navigateRoot([`/layout/dineout-layout/dineout-track/${this.bookingId}`], {
            animated: true,
            animationDirection: 'forward'
        });
        } else {
          this.navCtrl.navigateRoot(`/layout/dineout-layout/dineout-track/${internalOrderId}`, {
            animated: true,
            animationDirection: 'forward'
        });
        }

        // Option 2 (Alternative): If you want to keep history
        // this.navCtrl.navigateForward([`/layout/dineout-layout/dineout-track/${targetId}`]);
    });
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}