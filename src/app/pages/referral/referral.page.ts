import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonFab,
  ToastController, IonFooter } from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import { arrowBackOutline, copyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.page.html',
  styleUrls: ['./referral.page.scss'],
  standalone: true,
  imports: [IonFooter, 
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonFab,
  ],
})
export class ReferralPage implements OnInit {
  referralCode = 'PINTU-A9B2C1';

  constructor(private toastController: ToastController) {
        addIcons({arrowBackOutline, copyOutline});
  }

  ngOnInit() {}

  async copyCode() {
    // await Clipboard.write({
    //   string: this.referralCode,
    // });

    // const toast = await this.toastController.create({
    //   message: 'Referral code copied!',
    //   duration: 2000,
    //   position: 'bottom',
    //   color: 'dark',
    // });
    // await toast.present();
  }

  async share() {
    await Share.share({
      title: 'Join me on Pintu!',
      text: `I'm inviting you to try Pintu! Sign up with my code ${this.referralCode} and we'll both get ₹50.`,
      url: 'https://pintu.app/join',
      dialogTitle: 'Share with friends',
    });
  }
}
