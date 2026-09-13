import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  briefcaseOutline,
  bookmarkOutline,
  closeOutline,
  checkmarkCircle,
  locationOutline,
  callOutline,
  personOutline,
  businessOutline,
  createOutline,
  star,
  starOutline
} from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';

export interface AddressFormData {
  lat: number;
  lng: number;
  address: string;
  house_no: string;
  building_name?: string;
  landmark: string;
  label: string;
  receiver_name?: string;
  receiver_contact?: string;
  is_primary?: boolean;
}

@Component({
  selector: 'app-address-save-form',
  templateUrl: './address-save-form.component.html',
  styleUrls: ['./address-save-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonSpinner
  ]
})
export class AddressSaveFormComponent implements OnInit {
  @Input() initialCoords: { lat: number; lng: number } = { lat: 12.8556, lng: 77.6818 };
  @Input() initialAddress: string = '';
  @Input() routeSource: string = 'savedAddress';
  @Input() editAddress: any = null;

  @Output() addressSaved = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  houseNo: string = '';
  buildingName: string = '';
  landmark: string = '';
  currentAddress: string = '';
  receiverName: string = '';
  receiverPhone: string = '';
  selectedLabel: string = 'home';
  customLabel: string = '';
  isPrimary: boolean = false;

  isSaving: boolean = false;
  errorMessage: string = '';
  token: string = '';

  get isEditMode(): boolean {
    return Boolean(this.editAddress?.id);
  }

  constructor(
    private locationService: LocationService,
    private authService: AuthService
  ) {
    addIcons({
      homeOutline,
      briefcaseOutline,
      bookmarkOutline,
      closeOutline,
      checkmarkCircle,
      locationOutline,
      callOutline,
      personOutline,
      businessOutline,
      createOutline,
      star,
      starOutline
    });
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';

    if (this.editAddress) {
      // Pre-fill fields in Edit Mode
      this.houseNo = this.editAddress.house_no || '';
      this.buildingName = this.editAddress.building_name || '';
      this.landmark = this.editAddress.landmark || '';
      this.currentAddress = this.editAddress.address || this.initialAddress || '';
      this.receiverName = this.editAddress.receiver_name || '';
      this.receiverPhone = this.editAddress.receiver_contact || '';
      this.isPrimary = Boolean(this.editAddress.is_primary);

      const l = (this.editAddress.label || 'home').toLowerCase();
      if (['home', 'work'].includes(l)) {
        this.selectedLabel = l;
      } else {
        this.selectedLabel = 'other';
        this.customLabel = this.editAddress.label || '';
      }

      if (this.editAddress.lat && this.editAddress.lng) {
        this.initialCoords = {
          lat: Number(this.editAddress.lat),
          lng: Number(this.editAddress.lng)
        };
      }
    } else {
      // New Address Mode
      this.currentAddress = this.initialAddress;

      // Pre-populate receiver details from current logged-in user if available
      const user = this.authService.getCurrentUser();
      if (user) {
        this.receiverName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '';
        this.receiverPhone = user.phone || '';
      }
    }
  }

  selectLabel(label: string) {
    this.selectedLabel = label;
  }

  onCancel() {
    this.cancel.emit();
  }

  save() {
    if (!this.houseNo || !this.houseNo.trim()) {
      this.errorMessage = 'Please enter House / Flat / Floor number.';
      return;
    }

    if (!this.currentAddress || !this.currentAddress.trim()) {
      this.errorMessage = 'Please verify street address.';
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    const labelToSave = this.selectedLabel === 'other' && this.customLabel.trim()
      ? this.customLabel.trim()
      : (this.selectedLabel || 'Home');

    const params: AddressFormData = {
      lat: this.initialCoords.lat,
      lng: this.initialCoords.lng,
      address: this.currentAddress.trim(),
      house_no: this.houseNo.trim(),
      building_name: this.buildingName ? this.buildingName.trim() : undefined,
      landmark: this.landmark ? this.landmark.trim() : 'Near main road',
      label: labelToSave,
      receiver_name: this.receiverName ? this.receiverName.trim() : undefined,
      receiver_contact: this.receiverPhone ? this.receiverPhone.trim() : undefined,
      is_primary: this.isPrimary
    };

    if (this.isEditMode && this.editAddress?.id) {
      // Edit / Update existing address
      this.locationService.updateAddress(this.editAddress.id, params, this.token).subscribe({
        next: (res: any) => {
          const updatedAddr = res?.data || { ...this.editAddress, ...params };
          this.isSaving = false;

          // If marked primary, trigger setPrimaryAddress
          if (this.isPrimary) {
            this.locationService.setPrimaryAddress(this.editAddress.id, this.token).subscribe({
              next: () => console.log('✅ Updated address set as primary in DB'),
              error: (err: any) => console.warn('Set primary on update error:', err)
            });
          }

          // Update cached location if it was the active address
          const savedLoc = localStorage.getItem('location');
          if (savedLoc) {
            try {
              const parsed = JSON.parse(savedLoc);
              if (parsed?.id === this.editAddress.id) {
                const locData = {
                  ...parsed,
                  lat: updatedAddr.lat || params.lat,
                  lng: updatedAddr.lng || params.lng,
                  label: updatedAddr.label || params.label,
                  address: updatedAddr.address || params.address,
                  house_no: updatedAddr.house_no || params.house_no,
                  building_name: updatedAddr.building_name || params.building_name,
                  landmark: updatedAddr.landmark || params.landmark,
                  area: (updatedAddr.address || params.address || '').split(',')[0]
                };
                this.locationService.setAddress(locData);
              }
            } catch (e) {}
          }

          this.addressSaved.emit(updatedAddr);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.errorMessage = err?.error?.message || 'Failed to update address. Please try again.';
        }
      });
    } else {
      // Create new address
      this.locationService.saveAddress(params, this.token).subscribe({
        next: (res: any) => {
          const savedAddr = res?.data || res;
          this.isSaving = false;

          // If marked primary, trigger setPrimaryAddress
          if (this.isPrimary && savedAddr?.id) {
            this.locationService.setPrimaryAddress(savedAddr.id, this.token).subscribe({
              next: () => console.log('✅ New address set as primary in DB'),
              error: (err: any) => console.warn('Set primary on create error:', err)
            });
          }

          // Cache locally
          if (savedAddr?.id) {
            const locData = {
              lat: savedAddr.lat || params.lat,
              lng: savedAddr.lng || params.lng,
              id: savedAddr.id,
              label: savedAddr.label || params.label,
              address: savedAddr.address || params.address,
              house_no: savedAddr.house_no || params.house_no,
              building_name: savedAddr.building_name || params.building_name,
              landmark: savedAddr.landmark || params.landmark,
              area: (savedAddr.address || params.address || '').split(',')[0]
            };
            this.locationService.setAddress(locData);
          }

          this.addressSaved.emit(savedAddr);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.errorMessage = err?.error?.message || 'Failed to save address. Please try again.';
        }
      });
    }
  }
}

