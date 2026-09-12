import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSkeletonText,
  IonToast,
  NavController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  briefcaseOutline,
  locationOutline,
  checkmarkCircle,
  ellipseOutline,
  trashOutline,
  mapOutline,
  addOutline,
  navigateOutline,
  shieldCheckmarkOutline,
  createOutline,
  star,
  starOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { AddressSaveFormComponent } from '../address-save-form/address-save-form.component';

@Component({
  selector: 'app-saved-addresses',
  templateUrl: './saved-addresses.component.html',
  styleUrls: ['./saved-addresses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonIcon,
    IonSkeletonText,
    IonToast,
    AddressSaveFormComponent
  ]
})
export class SavedAddressesComponent implements OnInit {
  @Input() routeSource: string = 'home';
  @Input() autoNavigateBackOnSelect: boolean = true;
  @Output() addressSelected = new EventEmitter<any>();
  @Output() selectOnMap = new EventEmitter<void>();

  addresses: any[] = [];
  activeAddressId: any = null;
  isLoading: boolean = true;
  token: string = '';
  isToastOpen: boolean = false;
  toastMessage: string = '';

  // Edit Modal State
  isEditModalOpen: boolean = false;
  editingAddress: any = null;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private locationService: LocationService
  ) {
    addIcons({
      homeOutline,
      briefcaseOutline,
      locationOutline,
      checkmarkCircle,
      ellipseOutline,
      trashOutline,
      mapOutline,
      addOutline,
      navigateOutline,
      shieldCheckmarkOutline,
      createOutline,
      star,
      starOutline
    });
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';

    // Listen to active address from LocationService
    this.locationService.location$.subscribe((loc: any) => {
      if (loc?.id) {
        this.activeAddressId = loc.id;
      }
    });

    // Check localStorage fallback
    const saved = localStorage.getItem('location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          this.activeAddressId = parsed.id;
        }
      } catch (e) {}
    }

    this.loadAddresses();
  }

  loadAddresses(showLoader: boolean = true) {
    if (showLoader) {
      this.isLoading = true;
    }

    if (!this.token) {
      this.addresses = [];
      this.isLoading = false;
      return;
    }

    this.locationService.getAddressesList(this.token).subscribe({
      next: (res: any) => {
        this.addresses = Array.isArray(res?.data) ? res.data : [];
        this.isLoading = false;

        // If no active address is selected yet, check if one has is_primary
        if (!this.activeAddressId && this.addresses.length > 0) {
          const primary = this.addresses.find((a: any) => a.is_primary);
          if (primary) {
            this.activeAddressId = primary.id;
          }
        }
      },
      error: () => {
        this.addresses = [];
        this.isLoading = false;
      }
    });
  }

  selectAddress(item: any) {
    const data = {
      lat: item.lat,
      lng: item.lng,
      id: item.id,
      label: item.label,
      address: item.address,
      area: item.address?.split(',')[0] || 'Athani'
    };

    this.activeAddressId = item.id;
    this.locationService.setAddress(data);
    localStorage.setItem('location', JSON.stringify(data));

    this.addressSelected.emit(item);

    if (this.autoNavigateBackOnSelect && this.routeSource && this.routeSource !== 'profile') {
      this.navCtrl.back();
    }
  }

  setAsPrimary(item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!item?.id || !this.token) return;

    this.locationService.setPrimaryAddress(item.id, this.token).subscribe({
      next: () => {
        this.showToast('Default delivery address updated');
        // Update local list state
        this.addresses = this.addresses.map((a: any) => ({
          ...a,
          is_primary: a.id === item.id
        }));

        // Set as active address locally as well
        this.selectAddress(item);
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Failed to set default address');
      }
    });
  }

  openEditAddress(item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.editingAddress = { ...item };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingAddress = null;
  }

  onAddressUpdated(updatedAddr: any) {
    this.closeEditModal();
    this.showToast('Address updated successfully');
    this.loadAddresses(false);

    // If edited address was currently active, update local storage & location stream
    if (this.activeAddressId === updatedAddr?.id) {
      const locData = {
        lat: updatedAddr.lat,
        lng: updatedAddr.lng,
        id: updatedAddr.id,
        label: updatedAddr.label,
        address: updatedAddr.address,
        area: (updatedAddr.address || '').split(',')[0] || 'Athani'
      };
      this.locationService.setAddress(locData);
    }
  }

  async confirmDeleteAddress(item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (!item?.id) return;

    const displayAddr = item.house_no ? `${item.house_no}, ${item.address}` : item.address;

    const alert = await this.alertCtrl.create({
      header: 'Delete Address?',
      message: `Are you sure you want to delete this address:\n"${displayAddr}"?\nThis action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteAddress(item.id);
          }
        }
      ]
    });

    await alert.present();
  }

  deleteAddress(id: any) {
    if (!id || !this.token) return;

    this.locationService.deleteAddress(this.token, id).subscribe({
      next: () => {
        this.showToast('Address deleted successfully');
        this.addresses = this.addresses.filter((a: any) => a.id !== id);
        if (this.activeAddressId === id) {
          this.activeAddressId = null;
        }
      },
      error: () => {
        this.showToast('Failed to delete address');
      }
    });
  }

  openMap() {
    this.selectOnMap.emit();
    this.navCtrl.navigateForward('/layout/map', {
      state: { data: this.routeSource || 'home' }
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }

  getLabelIcon(label: string): string {
    const l = (label || '').toLowerCase();
    if (l === 'home') return 'home-outline';
    if (l === 'work') return 'briefcase-outline';
    return 'location-outline';
  }
}
