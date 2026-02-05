import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router'; 
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, calendarOutline, timeOutline, 
  peopleOutline, locationOutline, callOutline, homeOutline,
  ticketOutline, walletOutline, cameraOutline, receiptOutline, cloudUploadOutline, closeCircleOutline,
  trashOutline,
  close,
  cardOutline
} from 'ionicons/icons';
import { DineoutService } from 'src/app/services/dineout.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorComponent } from "src/app/components/error/error.component";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-dineout-track',
  templateUrl: './dineout-track.page.html',
  styleUrls: ['./dineout-track.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ErrorComponent]
})
export class DineoutTrackPage implements OnInit {

  booking: any = null;
  bookingId: string | null = null;
  
  isLoading = true;
  isError = false;
  isBillWindowOpen = false; 
  isUploadingBill = false; 

  routeSource = '';
  token: any;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private dineoutService: DineoutService,
    private authServcie: AuthService,
    private actionSheetCtrl: ActionSheetController, 
    private loadingCtrl: LoadingController, 
    private toastCtrl: ToastController
  ) { 
    addIcons({ 
      checkmarkCircle, calendarOutline, timeOutline, 
      peopleOutline, locationOutline, callOutline, homeOutline,
      ticketOutline, walletOutline, cameraOutline, receiptOutline, cloudUploadOutline,cardOutline, closeCircleOutline, trashOutline, close
    });
  }

  async ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    
    if (history.state) {
        this.routeSource = history.state.from;
    }

    this.token = await this.authServcie.getToken();

    if (this.bookingId) {
      this.loadBookingFromApi(this.bookingId);
    } else {
      console.error('No Order ID found');
      this.isError = true;
      this.isLoading = false;
    }
  }

  ionViewDidEnter() {
    if (this.bookingId) {
      this.loadBookingFromApi(this.bookingId);
    }
  }


  loadBookingFromApi(id: any) {
    this.isLoading = true;
    this.isError = false;

    this.dineoutService.orderById(id).subscribe({
      next: (res: any) => {
        this.booking = res?.data; 
        // this.checkBillActionWindow();
        this.isBillWindowOpen = this.booking.info.billWindow
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load booking:', err);
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  checkBillActionWindow() {
    if (!this.booking) return;

    try {
      const now = new Date();
      const dateStr = this.booking.booking_date || this.booking.date; 
      
      const timeSlotStr = this.booking.time_slot || this.booking.timeSlot || ""; 
      const timeStr = timeSlotStr.includes('-') ? timeSlotStr.split(' - ')[0] : timeSlotStr; 

      if(!dateStr || !timeStr) return;

      const bookingDateTime = this.parseDateTime(dateStr, timeStr);

      const windowStart = new Date(bookingDateTime);
      windowStart.setMinutes(windowStart.getMinutes() - 30);

      const windowEnd = new Date(bookingDateTime);
      windowEnd.setHours(windowEnd.getHours() + 24);

      this.isBillWindowOpen = now >= windowStart && now <= windowEnd;
    } catch (e) {
      console.error('Error parsing date/time', e);
      this.isBillWindowOpen = false; 
    }
  }

  parseDateTime(dateString: string, timeString: string): Date {
    const d = new Date(dateString); 
    const [time, modifier] = timeString.split(' ');
    let [hoursStr, minsStr] = time.split(':');
    let h = parseInt(hoursStr);
    let m = parseInt(minsStr);

    if (h === 12 && modifier === 'AM') h = 0;
    else if (h !== 12 && modifier === 'PM') h += 12;

    d.setHours(h, m, 0, 0);
    return d;
  }

  async confirmCancel() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure you want to cancel?',
      subHeader: 'This action cannot be undone.',
      buttons: [
        {
          text: 'Yes, Cancel Booking',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.processCancellation();
          }
        },
        {
          text: 'No, Keep it',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            console.log('Cancel aborted');
          }
        }
      ]
    });
    await actionSheet.present();
  }

  async processCancellation() {
    const loader = await this.loadingCtrl.create({
      message: 'Cancelling booking...',
      spinner: 'crescent'
    });
    await loader.present();

    this.dineoutService.cancelOrder(this.booking.id, this.token).subscribe({
      next: async (res: any) => {
        console.log('Cancellation Success:', res);
        
        // UPDATE LOCAL STATE DIRECTLY
        // Assuming API returns the updated booking object in `res.data`
        // If API returns just success message, set status manually: this.booking.status = 'CANCELLED';
        if(res?.data) {
            this.booking = res?.data; 
        } else {
            this.booking.status = 'CANCELLED'; // Fallback manual update
        }
        this.isBillWindowOpen = res.info.billWindow;
        await loader.dismiss();
        this.presentToast('Booking cancelled successfully', 'success');
      },
      error: async (error: any) => {
        console.error('Cancellation Failed:', error);
        await loader.dismiss();
        this.presentToast('Failed to cancel booking. Try again.', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  payBillNow() {
    this.navCtrl.navigateForward('/layout/dineout-layout/dineout-paybill', {
      state: { bookingId: this.booking.id }
    })
  }

  async uploadBill() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      if (image.base64String) {
        console.log('Bill captured and ready to send to BE');
        let params = {
          "bookingId": this.bookingId,
          "image": {
            "format": image.format,
            "base64String": image.base64String
          }
        }
        this.isUploadingBill = true
        this.dineoutService.uploadBill(this.token, params).subscribe({
          next: (res: any) => {
            this.booking = res.data;
            this.isUploadingBill = false
            this.isBillWindowOpen = res.info.billWindow;
            this.presentToast('Bill uploaded successfully', 'success');
          },
          error: (err: any) => {
            this.isUploadingBill = false
            this.presentToast('Failed to upload bill. Try again.', 'danger');
          }
        })
      }
    } catch (error) {
      console.error('Error capturing bill:', error);
      this.isUploadingBill = false
    }
  }
  
  getOfferText() { 
      if(this.booking?.offer_applied) return this.booking.offer_applied.title;
      if(this.booking?.offerApplied) return this.booking.offerApplied.title;
      return 'No offer applied'; 
  }
  
  goHome() { this.navCtrl.navigateRoot('/layout/example/home'); }
  
  callRestaurant() {
    // Replace with real phone number field from your API response
    if(this.booking?.contact) window.open(`tel:${this.booking.contact}`, '_self');
  }
  
  getDirections() {
     if(this.booking?.coords) {
         const { lat, lng } = this.booking.coords;
         const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
         window.open(url, '_system');
     }
  }

  goBack() {
    if(this.routeSource === 'time-slot') {
      this.navCtrl.navigateRoot('/layout/example/home');
    } else {
      this.navCtrl.back();
    }
  }
}