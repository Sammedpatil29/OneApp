import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cashOutline, pricetagOutline, arrowForwardCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { DineoutService } from 'src/app/services/dineout.service';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-dineout-paybill',
  templateUrl: './dineout-paybill.page.html',
  styleUrls: ['./dineout-paybill.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class dineoutPaybillPage implements OnInit {
  enteredAmount: number | null = null;
  billData: any | null = null;
  isLoading = false;
  bookingId: any;
restaurantId: any;
token:any;


  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private dineOutService: DineoutService,
    private authService: AuthService
  ) {
    addIcons({ arrowBackOutline, cashOutline, pricetagOutline, arrowForwardCircleOutline, shieldCheckmarkOutline });
  }

  async ngOnInit() {
this.bookingId = history.state.bookingId;
this.restaurantId = history.state.restaurantId;
this.token = await this.authService.getToken();

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

    let params = {}
    if(this.restaurantId) {
      params = {
        "restaurantId": this.restaurantId,
        "billAmount": this.enteredAmount
      }
    }
    if(this.bookingId) {
      params = {
        "bookingId": this.bookingId,
        "billAmount": this.enteredAmount
      }
    }

    this.dineOutService.calculateBill(this.token, params).subscribe({
      next: (res: any) => {
        this.billData = res.data;
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
    const loading = await this.loadingCtrl.create({
      message: 'Processing Payment...',
      spinner: 'crescent',
      duration: 2000
    });
    await loading.present();

    await loading.onDidDismiss();
    this.showToast('Payment Successful!', 'success');
    
    // Navigate back or to success screen
    // this.navCtrl.navigateRoot('/success');
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