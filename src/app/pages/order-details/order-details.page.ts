import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardSubtitle, IonInput, IonItem, IonSpinner, IonSelect, IonSelectOption, IonText, IonToast, IonRange } from '@ionic/angular/standalone';
import { NavController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, checkmarkCircle, calendarOutline, timeOutline, locationOutline, alertCircleOutline, downloadOutline, shareSocialOutline, mapOutline, homeOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { Preferences } from '@capacitor/preferences';

// ⚠️ Declare Window for Native Plugin
declare var window: any;

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  standalone: true,
  imports: [IonRange, IonToast, IonText, IonSelect, IonSelectOption, IonSpinner, IonItem, IonInput, IonCardSubtitle, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OrderDetailsPage implements OnInit, OnDestroy {
  
  eventData: any; 
  ticketCount = 1;
  unitPrice = 0;
  basePrice = 0;
  charges = 0;
  finalCost = 0;
  ticketOptions: any[] = []; 
  selectedOption: any = null;
  customerName = '';
  mobileNumber = '';
  email = '';
  isLoading = true;
  token: any;
  eventId: any;
  
  // Toast Variables
  isToastOpen: boolean = false;
  toastMessage = '';
  
  // ⚡ Polling State
  pendingOrderId: any = null;
  pollingInterval: any = null;
  isPaymentDetected: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
    private eventService: EventsService,
    private zone: NgZone,
    private platform: Platform
  ) {
    addIcons({arrowBack,homeOutline,checkmarkCircle,calendarOutline,timeOutline,locationOutline,alertCircleOutline,downloadOutline,shareSocialOutline,mapOutline});
  }

  async ngOnInit() {
    this.eventId = history.state.eventId;

    if (!this.eventId) {
      const nav = this.router.getCurrentNavigation();
      if (nav?.extras?.state) {
        this.eventId = nav.extras.state['eventId'];
      }
    }

    this.authService.getToken().then(res => {
      this.token = res;
      if (this.eventId) {
        this.fetchEventDetails(this.eventId);
      } else {
        console.error("No Event ID provided!");
        this.isLoading = false;
      }
    });

    // Check if we were in the middle of a payment (e.g. app killed)
    this.checkPendingOrder();
  }

  fetchEventDetails(id: any) {
    this.isLoading = true;
    let params = { "eventId": id };
    
    this.eventService.getEventDetails(params, this.token).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.eventData = res.event;
          if(res.user) {
            this.customerName = res.user.name || '';
            this.mobileNumber = res.user.phone || '';
            this.email = res.user.email || '';
          }
          this.processTicketOptions(this.eventData.ticketOptions);
        }
        this.isLoading = false;
      },
      error: (err:any) => {
        console.error("API Error", err);
        this.isLoading = false;
      }
    });
  }

  async checkPendingOrder() {
    const { value } = await Preferences.get({ key: 'pending_order_id' });
    if (value) {
      this.pendingOrderId = value;
      // Resume polling if we have a pending ID
      this.startPolling(this.pendingOrderId);
    }
  }

  // ... [Ticket Processing and Calculation Methods remain same] ...
  processTicketOptions(options: any[]) {
    if (options && options.length > 0) {
      this.ticketOptions = options.map(opt => ({
        name: opt.class,
        price: Number(opt.price),
        stock: opt.tickets
      }));
      this.onTicketSelect(this.ticketOptions[0]);
    } else {
      this.ticketOptions = [];
      this.unitPrice = 0;
    }
  }

  onTicketSelect(option: any) {
    this.selectedOption = option;
    this.unitPrice = option.price;
    this.calculateTotal();
  }

  calculateTotal() {
    this.basePrice = this.ticketCount * this.unitPrice;
    this.charges = Math.round(this.basePrice * 0.07); 
    this.finalCost = this.basePrice + this.charges;
  }

  count(action: string) {
    if (action === '+') {
      if (this.ticketCount < this.eventData.maxSelection) this.ticketCount++;
      else this.showToast(`Max ${this.eventData.maxSelection} Quantity allowed`);
    } else if (action === '-') {
      if (this.ticketCount > 1) this.ticketCount--;
    }
    this.calculateTotal();
  }

  // ✅ 1. Check Availability First
  PayNow() {
    if (!this.customerName || !this.mobileNumber || !this.email) {
      this.showToast("Please fill all details");
      return;
    }

    this.isLoading = true;

    let params = {
      "eventId": this.eventId,
      "class": this.selectedOption.name,
      "tickets": this.ticketCount
    };

    this.eventService.checkAvailability(params).subscribe({
      next: (res: any) => {
        if (res.success === true) {
          // Success: Create Order on Backend
          this.createOrderOnBackend();
        } else {
          this.isLoading = false;
          this.showToast(res.message || "Tickets not available");
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast("Server error checking availability");
      }
    });
  }

  // ✅ 2. Acquire Order ID from Backend
  createOrderOnBackend() {
    const orderData = {
      eventId: this.eventId,
      tickets: this.ticketCount,
      class: this.selectedOption.name,
    };

    this.eventService.createRazorpayOrder(orderData, this.token).subscribe({
      next: async (res: any) => {
        if (res.success) {
          // Store internal ID
          this.pendingOrderId = res.internal_order_id;
          await Preferences.set({ key: 'pending_order_id', value: res.internal_order_id });
          
          // Open Razorpay with the acquired Order ID
          this.initiateRazorpay(res.razorpay_order_id);
        } else {
          this.isLoading = false;
          this.showToast("Failed to create order");
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast("Server error creating order");
      }
    });
  }

  // ✅ 3. Initiate Razorpay & START POLLING
  initiateRazorpay(rzpOrderId: string) {
    const options = {
      key: 'rzp_test_S5RLYqr6y2I6xs', 
      amount: (this.finalCost * 100).toString(), 
      currency: 'INR',
      name: 'Pintu Events',
      description: `${this.selectedOption.name} Ticket x${this.ticketCount}`,
      image: 'https://your-logo-url.com/logo.png',
      order_id: rzpOrderId, 
      
      prefill: {
        name: this.customerName,
        email: this.email,
        contact: this.mobileNumber
      },
      theme: { color: '#121212' }
    };

    this.platform.ready().then(() => {
      if (typeof window.RazorpayCheckout !== 'undefined') {
        // A. Open Payment Screen
        window.RazorpayCheckout.open(options);

        // B. 🚀 START POLLING IMMEDIATELY (Don't wait for success callback)
        // We assume the user is paying. We ask backend "Is it done?" repeatedly.
        this.startPolling(this.pendingOrderId);

      } else {
        this.isLoading = false;
        this.showToast("Razorpay Plugin not installed");
      }
    });
  }

  // ✅ 4. The Polling Logic
  startPolling(internalOrderId: string) {
    console.log("Started polling for:", internalOrderId);
    
    // Stop any existing polling
    this.stopPolling();

    // Check every 3 seconds
    this.pollingInterval = setInterval(() => {
      this.checkStatusFromBackend(internalOrderId);
    }, 3000);

    // Failsafe: Stop polling after 2 minutes (120 seconds)
    setTimeout(() => {
      if (!this.isPaymentDetected) {
        this.stopPolling();
        this.isLoading = false;
        // Optional: Show "Timeout" message or just let user stay on page
      }
    }, 120000);
  }

  checkStatusFromBackend(internalOrderId: string) {
    const verifyData = {orderId: internalOrderId };

    this.eventService.verifyPayment(verifyData).subscribe({
      next: async (res: any) => {
        console.log('veerified')
        // Backend should return status: 'paid' ONLY when Webhook is received
        if (res.success && res.status === 'paid') {
            this.handleSuccess(res);
        }
        // If status is 'pending', do nothing, just wait for next poll
        else if (res.status === 'failed') {
          this.stopPolling();
          this.isLoading = false;
          this.showToast("Payment Failed.");
        }
      },
      error: (err) => {
        // Network error? Just ignore and retry next poll
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

  async handleSuccess(res: any) {
  this.isPaymentDetected = true;
  console.log('Payment Success:', res);
  
  this.stopPolling();
  this.isLoading = false;
  
  // Clear the pending order from storage
  await Preferences.remove({ key: 'pending_order_id' });
  
  this.showToast("Booking Confirmed! 🚀");

  // Determine the correct Order ID to pass
  // Check res structure, fallback to pendingOrderId if API doesn't return ID directly
  const idToPass = res.booking?.id || res.orderId || res.id || this.pendingOrderId;

  // ✅ FIX: Use navigateRoot to clear history (User shouldn't go back to payment)
  // OR use navigateForward if you want to keep history.
  this.navCtrl.navigateRoot(['/layout/track-order'], {
    animated: true,
    animationDirection: 'forward',
    state: { 
      orderId: res.booking.id, 
      from: 'order-details' // Required for the 'Back' button logic in TrackOrderPage
    }
  });
}

dummycall(){
  this.navCtrl.navigateRoot(['/layout/track-order'], {
    animated: true,
    animationDirection: 'forward',
    state: { 
      orderId: '14', 
      from: 'order-details' // Required for the 'Back' button logic in TrackOrderPage
    }
  });
}

  ngOnDestroy() {
    this.stopPolling(); // Cleanup when leaving page
  }



  showToast(msg: string) {
    this.isToastOpen = true;
    this.toastMessage = msg;
    setTimeout(() => { this.isToastOpen = false; }, 2000);
  }

  goBack() {
    this.navCtrl.back();
  }
}