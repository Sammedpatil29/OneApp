import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonToast, IonSpinner, IonFooter, IonFab, IonFabButton, IonGrid, IonRow, IonCol, IonText, ActionSheetController } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import { arrowBack, shareSocialOutline, downloadOutline, mapOutline, timeOutline, calendarOutline, locationOutline, checkmarkCircle, alertCircleOutline, closeCircle } from 'ionicons/icons';
import { AdmobService } from 'src/app/services/admob.service';
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';

// Declare global variable for AdMob safety
declare var window: any;

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
  standalone: true,
  imports: [IonText, IonCol, IonRow, IonGrid, IonFabButton, IonFab, IonFooter, IonSpinner, IonToast, IonCard, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TrackOrderPage implements OnInit {
  
  // State Variables
  orderId: string | null = null;
  isLoading: boolean = true; // Start true to block HTML rendering
  orderDetails: any = null;
  qrUrl: string = '';
  
  // UI Flags
  isSharing: boolean = false;
  isToastOpen: boolean = false;
  toastMessage = '';
  routeSource = '';
  token: any;


  constructor(
    private navCtrl: NavController, 
    private router: Router, 
    private admobService: AdmobService,
    private eventService: EventsService,
    private actionSheetCtrl: ActionSheetController,
    private authService: AuthService
  ) { 
    addIcons({arrowBack,closeCircle,checkmarkCircle,calendarOutline,timeOutline,locationOutline,alertCircleOutline,downloadOutline,shareSocialOutline,mapOutline});
  }

  async ngOnInit() {
    // 1. Capture State safely
    // history.state is more reliable than router.getCurrentNavigation in ngOnInit
    this.orderId = history.state.orderId;
    this.routeSource = history.state.from;

    await this.authService.getToken().then(token => {
      // Store token for later use
      this.token = token;
    });


    // Fallback if history.state is empty
    if (!this.orderId) {
      const nav = this.router.getCurrentNavigation();
      if (nav?.extras?.state) {
        this.orderId = nav.extras.state['orderId'];
        this.routeSource = nav.extras.state['from'];
      }
    }

    // 2. Load Data
    if (this.orderId) {
      this.fetchOrderDetails(this.orderId);
    } else {
      console.error("No Order ID Found");
      this.isLoading = false; // Stop loading so we show "Not Found" UI
    }

    // 3. Init Ads Safely (Delayed)
    this.initAdMobSafe();
  }

  initAdMobSafe() {
    setTimeout(() => {
      try {
        // Ensure the array exists before service tries to push
        window.adsbygoogle = window.adsbygoogle || [];
        this.admobService.displayBannerAd('ca-app-pub-3940256099942544/6300978111');
      } catch (e) {
        console.warn("AdMob initialization skipped:", e);
      }
    }, 2000); // Wait 2 seconds for DOM to settle
  }

  fetchOrderDetails(id: string) {
    this.isLoading = true;
    let params = { "orderId": id };

    this.eventService.fetchOrderDetails(params).subscribe({
      next: (res: any) => {
        if (res) {
          this.orderDetails = res;
          // Generate QR only after we have data
          this.qrUrl = `https://quickchart.io/qr?text=${id}&size=200&dark=000000&light=ffffff`;
        }
        this.isLoading = false; // ✅ Data is ready, now HTML can render
      },
      error: (error) => {
        console.error("Fetch Error", error);
        this.isLoading = false;
        this.showToast("Could not load ticket details");
      }
    });
  }

  // --- ACTIONS ---

  async confirmCancel() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Cancel Booking',
      subHeader: 'Are you sure you want to cancel this ticket? The refund will be processed to your original payment method.',
      buttons: [
        {
          text: 'Yes, Cancel Ticket',
          role: 'destructive',
          handler: () => {
            this.cancelOrder();
          }
        },
        {
          text: 'Keep Ticket',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  cancelOrder() {
    if (!this.orderId) return;
    this.isLoading = true;
    this.eventService.cancelOrder(this.orderId, this.token).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.orderDetails.status = 'cancelled';
          this.orderDetails.refundAmount = res.refundAmount;
          this.orderDetails.refundId = res.refundId;
          this.showToast('Booking cancelled successfully');
        } else {
          this.showToast(res.message || 'Failed to cancel booking');
        }
      },
      error: (error:any) => {
        console.error("Cancel Error", error);
        this.isLoading = false;
        this.showToast("Failed to cancel booking");
      }
    });
  }

  openInGoogleMaps() {
    if(!this.orderDetails || !this.orderDetails.event) return;
    const { lat, lng } = this.orderDetails.event;
    // Fallback if lat/lng missing
    const query = lat && lng ? `${lat},${lng}` : this.orderDetails.event.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  }

  async captureTicket(): Promise<string | null> {
    this.isSharing = true;
    // Wait for DOM update to hide buttons
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const element = document.getElementById('ticket-container');
    if (!element) {
      this.isSharing = false;
      return null;
    }

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2, 
        backgroundColor: null
      });
      return canvas.toDataURL('image/png').split(',')[1];
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      this.isSharing = false;
    }
  }

  async downloadTicket() {
    const base64 = await this.captureTicket();
    if (!base64) return;

    const fileName = `Ticket-${this.orderId}.png`;
    
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: `data:image/png;base64,${base64}`,
        directory: Directory.Documents
      });
      this.showToast('Ticket saved to Documents!');
    } catch (e) {
      this.showToast('Failed to save ticket.');
    }
  }

  async shareTicket() {
    const base64 = await this.captureTicket();
    if (!base64) return;

    const fileName = `Ticket-${this.orderId}.png`;
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache
    });

    await Share.share({
      title: `Ticket`,
      url: result.uri,
    });
  }

  goBack() {
    if(this.routeSource === 'order-details') {
      this.navCtrl.navigateRoot('/layout/example/home');
    } else {
      this.navCtrl.back();
    }
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}