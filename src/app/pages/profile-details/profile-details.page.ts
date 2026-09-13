import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonSpinner, 
  IonSkeletonText 
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, 
  pencilOutline, 
  checkmarkCircle, 
  closeOutline, 
  lockClosedOutline, 
  personOutline, 
  mailOutline, 
  callOutline, 
  shieldCheckmarkOutline, 
  trashOutline,
  saveOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AppDialogService } from 'src/app/services/app-dialog.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.page.html',
  styleUrls: ['./profile-details.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonSpinner, 
    IonSkeletonText,
    CommonModule, 
    FormsModule
  ]
})
export class ProfileDetailsPage implements OnInit {
  token: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  isEditing: boolean = false;

  profileData: any = null;

  // Form Fields
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  email: string = '';
  memberSince: string = '';

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private profileService: ProfileService,
    private dialogService: AppDialogService
  ) {
    addIcons({ 
      arrowBackOutline, 
      pencilOutline, 
      checkmarkCircle, 
      closeOutline, 
      lockClosedOutline, 
      personOutline, 
      mailOutline, 
      callOutline, 
      shieldCheckmarkOutline, 
      trashOutline,
      saveOutline
    });
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';
    if (this.token) {
      this.loadProfile();
    } else {
      this.isLoading = false;
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  loadProfile() {
    this.isLoading = true;
    this.profileService.getProfileData(this.token).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.profileData = res?.user || res?.data || res || {};
        this.initFormValues();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Failed to load profile details:', err);
        this.dialogService.showToast('Unable to load profile data', 'danger');
      }
    });
  }

  initFormValues() {
    if (!this.profileData) return;
    this.firstName = (this.profileData.first_name || '').trim();
    this.lastName = (this.profileData.last_name || '').trim();
    this.phone = this.profileData.phone || '';
    this.email = this.profileData.email || '';
    this.memberSince = this.profileData.createdAt || this.profileData.date_joined || '';
  }

  toggleEdit() {
    if (this.isEditing) {
      // Cancel edit mode and reset to server values
      this.initFormValues();
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }
  }

  getDisplayName(): string {
    const full = `${this.firstName} ${this.lastName}`.trim();
    return full || this.profileData?.username || 'Pintu Customer';
  }

  getUserInitials(): string {
    const name = this.getDisplayName();
    return name.charAt(0).toUpperCase() || 'P';
  }

  saveProfile() {
    if (!this.firstName.trim()) {
      this.dialogService.showToast('First name cannot be empty', 'warning');
      return;
    }

    this.isSaving = true;
    // NOTE: Only first_name and last_name are permitted to be updated.
    // Email and phone are strictly not sent or editable.
    const payload = {
      first_name: this.firstName.trim(),
      last_name: this.lastName.trim()
    };

    this.profileService.updateUser(payload, this.token).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.isEditing = false;
        if (res?.user) {
          this.profileData = { ...this.profileData, ...res.user };
        }
        this.dialogService.showToast('Personal details updated successfully!', 'success');
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Update profile error:', err);
        this.dialogService.showToast(err?.error?.message || 'Failed to update profile', 'danger');
      }
    });
  }

  async deleteAccount() {
    const confirmed = await this.dialogService.showDangerConfirm({
      title: 'Delete Account Permanently?',
      message: 'This will permanently remove your account, past orders, saved addresses, and active sessions.\n\nThis action cannot be undone.',
      confirmText: 'Delete Permanently',
      cancelText: 'Keep Account'
    });

    if (!confirmed) return;

    const id = this.profileData?.id;
    this.profileService.deleteProfilePermanently({ token: this.token }, id).subscribe({
      next: async () => {
        await this.dialogService.showAlert(
          'Account Deleted',
          'Your Pintu account and personal data have been permanently removed.',
          'info',
          'OK'
        );
        await this.authService.logout();
      },
      error: (err: any) => {
        console.error('Delete account error:', err);
        this.dialogService.showToast('Failed to delete account. Please contact support.', 'danger');
      }
    });
  }
}
