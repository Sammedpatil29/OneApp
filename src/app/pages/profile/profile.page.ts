import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonSkeletonText,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmark,
  callOutline,
  receiptOutline,
  locationOutline,
  headsetOutline,
  personOutline,
  mapOutline,
  giftOutline,
  languageOutline,
  bulbOutline,
  informationCircleOutline,
  shieldOutline,
  logOutOutline,
  chevronForward,
  arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AppDialogService } from 'src/app/services/app-dialog.service';
import { FooterComponent } from 'src/app/components/footer/footer.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonSkeletonText,
    IonIcon,
    FooterComponent
  ]
})
export class ProfilePage implements OnInit {
  profileData: any = null;
  isLoading: boolean = false;
  token: string = '';

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private profileService: ProfileService,
    private dialogService: AppDialogService
  ) {
    addIcons({
      checkmark,
      callOutline,
      receiptOutline,
      locationOutline,
      headsetOutline,
      personOutline,
      mapOutline,
      giftOutline,
      languageOutline,
      bulbOutline,
      informationCircleOutline,
      shieldOutline,
      logOutOutline,
      chevronForward,
      arrowBackOutline
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';
    if (this.token) {
      this.getProfileData();
    }
  }

  getProfileData() {
    this.isLoading = true;
    this.profileService.getProfileData(this.token).subscribe({
      next: (res: any) => {
        this.profileData = res?.user || res?.data || res || {};
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getDisplayName(): string {
    if (!this.profileData) return 'Pintu Customer';
    const first = this.profileData.first_name || this.profileData.name || '';
    const last = this.profileData.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || 'Pintu Customer';
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    return name.charAt(0).toUpperCase() || 'P';
  }

  async logOut() {
    const confirmed = await this.dialogService.showDangerConfirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out of your Pintu account?',
      confirmText: 'Yes, Log Out',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      this.profileData = null;
      await this.authService.logout();
    }
  }

  goToSupport() {
    this.router.navigate(['/layout/support']);
  }

  openReferral() {
    this.router.navigate(['/layout/referral']);
  }

  openDetails(option: string) {
    if (option === 'Personal Details') {
      this.router.navigate(['/layout/profile-details']);
    } else if (option === 'Saved Addresses') {
      this.router.navigate(['/layout/address-list'], {
        state: { data: 'profile' }
      });
    } else if (option === 'Orders History' || option === 'Orders') {
      this.router.navigate(['/layout/history']);
    } else {
      this.router.navigate(['/layout/about'], {
        state: { data: option }
      });
    }
  }
}
