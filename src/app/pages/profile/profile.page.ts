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
  checkmarkCircle,
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
  arrowBackOutline,
  cloudDownloadOutline,
  refreshOutline,
  arrowUpCircle,
  warningOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AppDialogService } from 'src/app/services/app-dialog.service';
import { OtaService } from 'src/app/services/ota.service';
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

  // OTA Update State
  currentAppVersion: string = '0.0.16';
  latestOtaVersion: string = '';
  isCheckingOta: boolean = false;
  isOtaUpToDate: boolean = true;
  hasOtaUpdateAvailable: boolean = false;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private profileService: ProfileService,
    private dialogService: AppDialogService,
    private otaService: OtaService
  ) {
    addIcons({
      checkmark,
      checkmarkCircle,
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
      arrowBackOutline,
      cloudDownloadOutline,
      refreshOutline,
      arrowUpCircle,
      warningOutline
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
    this.initAppVersionAndOta();
  }

  async initAppVersionAndOta() {
    this.currentAppVersion = await this.otaService.getCurrentVersion();
    // Silent initial check to determine up-to-date indicator
    const res = await this.otaService.checkUpdateDetails();
    if (res.success) {
      this.currentAppVersion = res.currentVersion;
      this.isOtaUpToDate = res.isUpToDate;
      this.hasOtaUpdateAvailable = res.updateAvailable;
      this.latestOtaVersion = res.latestVersion || '';
    }
  }

  async checkOtaUpdate(isUserClick: boolean = true) {
    if (this.isCheckingOta) return;
    this.isCheckingOta = true;

    const res = await this.otaService.checkUpdateDetails();
    this.isCheckingOta = false;
    this.currentAppVersion = res.currentVersion;

    if (res.success) {
      this.isOtaUpToDate = res.isUpToDate;
      this.hasOtaUpdateAvailable = res.updateAvailable;
      this.latestOtaVersion = res.latestVersion || '';

      if (isUserClick) {
        if (res.isUpToDate) {
          await this.dialogService.showAlert(
            'Everything is Up to Date',
            `You are running the latest version (v${this.currentAppVersion}).\nNo new updates found on the server. 🎉`,
            'info',
            'OK'
          );
        } else if (res.updateAvailable) {
          const proceed = await this.dialogService.showConfirm({
            title: 'New OTA Update Available',
            message: `Version v${res.latestVersion} is ready to download (current: v${this.currentAppVersion}).\n\nWould you like to apply the update now?`,
            confirmText: 'Update Now',
            cancelText: 'Later'
          });

          if (proceed) {
            this.dialogService.showToast('Downloading and applying update...', 'success', 3000);
            const applyRes = await this.otaService.applyUpdateNow();
            if (!applyRes.success) {
              await this.dialogService.showAlert(
                'Update Failed',
                applyRes.message || 'Could not apply update bundle.',
                'warning',
                'Close'
              );
            }
          }
        }
      }
    } else {
      // Server error or network issue
      this.isOtaUpToDate = false;
      if (isUserClick) {
        const debugDetails = [
          `Error: ${res.error || 'Server error'}`,
          res.httpStatus ? `HTTP Status: ${res.httpStatus}` : '',
          res.errorDetails ? `Server Response: ${res.errorDetails}` : '',
          `Manifest URL:\n${res.manifestUrl}`
        ].filter(Boolean).join('\n\n');

        await this.dialogService.showAlert(
          'OTA Check Failed (Debug)',
          debugDetails,
          'warning',
          'Close'
        );
      }
    }
  }

  onRefreshOtaClick(event: Event) {
    event.stopPropagation();
    this.checkOtaUpdate(true);
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
