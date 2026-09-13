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
  IonSpinner,
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
  arrowBackOutline,
  peopleOutline,
  timeOutline,
  sparklesOutline,
  refreshOutline,
  cashOutline
} from 'ionicons/icons';
import { ReferralService, ReferralStats, ReferralRecord } from 'src/app/services/referral.service';

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
    IonIcon,
    IonSpinner,
    CommonModule,
    FormsModule
  ],
})
export class ReferralPage implements OnInit {
  referralCode: string = '...';
  isCopied: boolean = false;
  isLoading: boolean = true;

  stats: ReferralStats = {
    total_invites: 0,
    completed_invites: 0,
    total_earnings: 0,
    reward_per_referral: 50
  };

  referrals: ReferralRecord[] = [];

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private referralService: ReferralService
  ) {
    addIcons({
      copyOutline,
      checkmarkCircle,
      giftOutline,
      shareSocialOutline,
      walletOutline,
      personAddOutline,
      logoWhatsapp,
      arrowBackOutline,
      peopleOutline,
      timeOutline,
      sparklesOutline,
      refreshOutline,
      cashOutline
    });
  }

  ngOnInit() {
    this.loadReferralData();
  }

  ionViewWillEnter() {
    this.loadReferralData();
  }

  goBack() {
    this.navCtrl.back();
  }

  loadReferralData() {
    this.isLoading = true;
    this.referralService.getReferralDetails().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.success) {
          this.referralCode = res.referral_code || 'PINTU50';
          if (res.stats) {
            this.stats = res.stats;
          }
          this.referrals = res.referrals || [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.warn('Failed to load live referral stats:', err?.message);
        if (this.referralCode === '...') {
          this.referralCode = 'PINTU50';
        }
      }
    });
  }

  async copyCode() {
    try {
      if (navigator?.clipboard && this.referralCode && this.referralCode !== '...') {
        await navigator.clipboard.writeText(this.referralCode);
      }
      this.isCopied = true;
      const toast = await this.toastController.create({
        message: `Referral code ${this.referralCode} copied to clipboard!`,
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
        text: `I'm inviting you to try Pintu! Sign up with my referral code ${this.referralCode} and we'll both get ₹50 in our wallet.`,
        url: 'https://pintu.in/download',
        dialogTitle: 'Share with friends',
      });
    } catch (e) {
      this.shareViaWhatsApp();
    }
  }

  shareViaWhatsApp() {
    const text = encodeURIComponent(
      `Hey! Try Pintu for 10-15 min grocery delivery & zero surge rides. Use my invite code ${this.referralCode} to get ₹50 off on your first order: https://pintu.in/download`
    );
    window.open(`https://wa.me/?text=${text}`, '_system');
  }
}
