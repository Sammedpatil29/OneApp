import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import {
  copyOutline,
  checkmarkCircle,
  giftOutline,
  shareSocialOutline,
  walletOutline,
  personAddOutline,
  logoWhatsapp,
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.page.html',
  styleUrls: ['./referral.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    CommonModule,
    FormsModule,
    IonIcon
  ],
})
export class ReferralPage implements OnInit {
  referralCode = 'PINTU-A9B2C1';
  isCopied = false;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController
  ) {
    addIcons({
      copyOutline,
      checkmarkCircle,
      giftOutline,
      shareSocialOutline,
      walletOutline,
      personAddOutline,
      logoWhatsapp,
      arrowBackOutline
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  ngOnInit() {}

  async copyCode() {
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(this.referralCode);
      }
      this.isCopied = true;
      const toast = await this.toastController.create({
        message: 'Referral code copied to clipboard!',
        duration: 2200,
        position: 'bottom',
        color: 'dark',
      });
      await toast.present();
      setTimeout(() => {
        this.isCopied = false;
      }, 3000);
    } catch (e) {
      this.isCopied = true;
      setTimeout(() => (this.isCopied = false), 3000);
    }
  }

  async share() {
    try {
      await Share.share({
        title: 'Join me on Pintu!',
        text: `I'm inviting you to try Pintu! Sign up with my code ${this.referralCode} and we'll both get ₹50 in our wallet.`,
        url: 'https://pintu.in/download',
        dialogTitle: 'Share with friends',
      });
    } catch (e) {
      this.shareViaWhatsApp();
    }
  }

  shareViaWhatsApp() {
    const text = encodeURIComponent(
      `Hey! Try Pintu for 10-15 min grocery delivery & zero surge rides. Use my code ${this.referralCode} to get ₹50 off: https://pintu.in/download`
    );
    window.open(`https://wa.me/?text=${text}`, '_system');
  }
}
