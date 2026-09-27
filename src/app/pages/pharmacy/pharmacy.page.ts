import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  location,
  locationOutline,
  chevronDown,
  arrowBack,
  searchOutline,
  cartOutline,
  bagHandleOutline,
  documentTextOutline,
  cameraOutline,
  cloudUploadOutline,
  closeOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  add,
  remove,
  timeOutline,
  flaskOutline,
  medkitOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  fitnessOutline,
  thermometerOutline,
  nutritionOutline,
  bandageOutline,
  waterOutline,
  heartOutline,
  happyOutline,
  pulseOutline,
  roseOutline,
  bodyOutline,
  arrowForward,
  arrowForwardOutline,
  receiptOutline,
  flashOutline
} from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';
import {
  MedicineItem,
  LabTestPackage,
  MedicineCategory,
  LabCategory
} from 'src/app/models/pharmacy.model';
import { PharmacyCartService, CartBillSummary } from 'src/app/services/pharmacy-cart.service';
import { PharmacyService } from 'src/app/services/pharmacy.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

import { PharmacyFooterComponent } from 'src/app/components/pharmacy-footer/pharmacy-footer.component';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.page.html',
  styleUrls: ['./pharmacy.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonModal,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    PharmacyFooterComponent
  ]
})
export class PharmacyPage implements OnInit, OnDestroy {
  // Active Tab: 'medicines' (first) or 'lab_tests' (second)
  activeTab: 'medicines' | 'lab_tests' = 'medicines';

  // Delivery Location State (matching Home page)
  displayLocationName: string = 'Select Location';
  displayFullAddress: string = '';
  isSavedAddress: boolean = false;
  isOutOfServiceArea: boolean = false;

  // Medicines Data (Loaded from Database via API)
  allMedicines: MedicineItem[] = [];
  displayedMedicines: MedicineItem[] = [];
  medicineCategories: MedicineCategory[] = [];
  selectedMedCategory: string = 'all';
  isLoadingMedicines: boolean = true;

  // Lab Tests Data (Loaded from Database via API)
  allLabTests: LabTestPackage[] = [];
  displayedLabTests: LabTestPackage[] = [];
  labCategories: LabCategory[] = [];
  selectedLabCategory: string = 'all';
  isLoadingLabTests: boolean = true;

  // Carts Summaries
  medSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };
  labSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };

  // Prescription Upload Modal State
  isPrescriptionModalOpen: boolean = false;
  prescriptionUploadType: 'medicine' | 'lab' = 'medicine';
  prescriptionFileName: string = '';
  prescriptionNotes: string = '';
  isUploadingPrescription: boolean = false;

  // Dynamic Banners State (medtop for Medicines, lab top for Labs)
  medBanners: any[] = [];
  labBanners: any[] = [];
  isLoadingMedBanners: boolean = false;
  isLoadingLabBanners: boolean = false;
  currentCity: string = '';

  private subs: Subscription = new Subscription();

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private locationService: LocationService,
    public cartService: PharmacyCartService,
    private pharmacyService: PharmacyService,
    private commonService: CommonService,
    private toastCtrl: ToastController
  ) {
    addIcons({arrowBack,location,chevronDown,searchOutline,medkitOutline,flaskOutline,documentTextOutline,checkmarkCircle,shieldCheckmarkOutline,timeOutline,cloudUploadOutline,flashOutline,add,remove,heartOutline,receiptOutline,waterOutline,fitnessOutline,bagHandleOutline,arrowForward,closeOutline,cameraOutline,checkmarkCircleOutline,locationOutline,cartOutline,sparklesOutline,thermometerOutline,nutritionOutline,bandageOutline,happyOutline,pulseOutline,roseOutline,bodyOutline,arrowForwardOutline});
  }

  ngOnInit(): void {
    // 1. Sync location from storage and LocationService (same as home page)
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        this.applyLocation(parsed);
      } catch (e) {}
    }

    // Load dynamic promotional banners (medtop & lab top)
    this.loadPharmacyBanners();

    this.subs.add(
      this.locationService.location$.subscribe((loc) => {
        if (loc) {
          this.applyLocation(loc);
        }
      })
    );

    this.subs.add(
      this.locationService.address$.subscribe((addr) => {
        if (addr && addr.trim()) {
          this.displayFullAddress = addr.trim();
          if (this.displayLocationName === 'Select Location' || !this.displayLocationName) {
            this.displayLocationName = addr.split(',')[0].trim();
          }
        }
      })
    );

    // 2. Subscribe to separate cart summaries
    this.subs.add(
      this.cartService.medicineSummary$.subscribe((summary) => {
        this.medSummary = summary;
      })
    );

    this.subs.add(
      this.cartService.labSummary$.subscribe((summary) => {
        this.labSummary = summary;
      })
    );

    // 3. Load initial catalog data from backend API
    this.loadPharmacyData();
  }

  loadPharmacyData(event?: any): void {
    this.isLoadingMedicines = true;
    this.isLoadingLabTests = true;

    // Load categories
    this.subs.add(
      this.pharmacyService.getCategories().subscribe((cats) => {
        if (cats.medicineCategories && cats.medicineCategories.length > 0) {
          this.medicineCategories = cats.medicineCategories;
        }
        if (cats.labCategories && cats.labCategories.length > 0) {
          this.labCategories = cats.labCategories;
        }
      })
    );

    // Load medicines
    this.subs.add(
      this.pharmacyService.getMedicines().subscribe({
        next: (meds) => {
          this.allMedicines = meds;
          this.filterMedCategory(this.selectedMedCategory);
          this.isLoadingMedicines = false;
          if (event) event.target.complete();
        },
        error: () => {
          this.isLoadingMedicines = false;
          if (event) event.target.complete();
        }
      })
    );

    // Load lab tests
    this.subs.add(
      this.pharmacyService.getLabTests().subscribe({
        next: (tests) => {
          this.allLabTests = tests;
          this.filterLabCategory(this.selectedLabCategory);
          this.isLoadingLabTests = false;
        },
        error: () => {
          this.isLoadingLabTests = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private applyLocation(loc: any): void {
    if (!loc) return;
    this.displayLocationName = loc.area || loc.name || loc.city || 'Home';
    this.displayFullAddress = loc.formatted_address || loc.fullAddress || loc.address || '';
    this.isSavedAddress = Boolean(loc.id || loc.is_saved || loc.tag);
    const newCity = (loc.city || loc.cityName || '').trim();
    if (newCity && newCity !== this.currentCity) {
      this.currentCity = newCity;
      this.loadPharmacyBanners();
    }
  }

  goBack(): void {
    this.navCtrl.navigateRoot('/layout/home');
  }

  openLocation(): void {
    this.router.navigate(['/layout/address-list'], {
      state: { data: 'pharmacy' }
    });
  }

  // ─── TAB NAVIGATION ────────────────────────────────────────────────────────
  switchTab(tab: 'medicines' | 'lab_tests'): void {
    this.activeTab = tab;
  }

  // ─── SEARCH TRIGGER ────────────────────────────────────────────────────────
  goToSearch(): void {
    const type = this.activeTab === 'medicines' ? 'medicine' : 'lab';
    this.router.navigate(['/layout/pharmacy/search'], {
      queryParams: { type }
    });
  }

  // ─── CART NAVIGATION ───────────────────────────────────────────────────────
  goToCart(preferredType?: 'medicine' | 'lab'): void {
    const type = preferredType || (this.activeTab === 'medicines' ? 'medicine' : 'lab');
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type }
    });
  }

  proceedToCheckout(preferredType?: 'medicine' | 'lab'): void {
    const type = preferredType || (this.activeTab === 'medicines' ? 'medicine' : 'lab');
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type, action: 'pay' }
    });
  }

  openMedicineDetails(id: string): void {
    this.navCtrl.navigateForward(`/layout/pharmacy/medicine/${id}`);
  }

  openLabTestDetails(id: string): void {
    this.navCtrl.navigateForward(`/layout/pharmacy/test/${id}`);
  }

  // ─── MEDICINE FILTERING & ACTIONS ──────────────────────────────────────────
  filterMedCategory(catId: string): void {
    this.selectedMedCategory = catId;
    if (catId === 'all') {
      this.displayedMedicines = this.allMedicines;
    } else {
      this.displayedMedicines = this.allMedicines.filter((m) => m.category === catId);
    }
  }

  getMedicineQty(itemId: string): number {
    return this.cartService.getMedicineQuantity(itemId);
  }

  addMedicineToCart(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.cartService.addMedicine(item, 1);
  }

  incrementMedicine(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.getMedicineQty(item.id);
    this.cartService.updateMedicineQuantity(item.id, current + 1);
  }

  decrementMedicine(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    const current = this.getMedicineQty(item.id);
    this.cartService.updateMedicineQuantity(item.id, current - 1);
  }

  // ─── LAB TEST FILTERING & ACTIONS ──────────────────────────────────────────
  filterLabCategory(catId: string): void {
    this.selectedLabCategory = catId;
    if (catId === 'all') {
      this.displayedLabTests = this.allLabTests;
    } else {
      this.displayedLabTests = this.allLabTests.filter((t) => t.category === catId);
    }
  }

  isLabTestBooked(testId: string): boolean {
    return this.cartService.isLabTestInCart(testId);
  }

  toggleLabTestBooking(test: LabTestPackage, event?: Event): void {
    if (event) event.stopPropagation();
    this.cartService.toggleLabTest(test);
  }

  // ─── PRESCRIPTION MODAL ────────────────────────────────────────────────────
  openPrescriptionModal(type: 'medicine' | 'lab'): void {
    this.prescriptionUploadType = type;
    this.prescriptionFileName = '';
    this.prescriptionNotes = '';
    this.isPrescriptionModalOpen = true;
  }

  closePrescriptionModal(): void {
    this.isPrescriptionModalOpen = false;
  }

  simulateFilePick(source: 'camera' | 'gallery' | 'doc'): void {
    const timestamp = new Date().getTime().toString().slice(-4);
    if (source === 'camera') {
      this.prescriptionFileName = `Rx_Photo_${timestamp}.jpg`;
    } else if (source === 'gallery') {
      this.prescriptionFileName = `Prescription_Scan_${timestamp}.png`;
    } else {
      this.prescriptionFileName = `Doctor_Prescription_${timestamp}.pdf`;
    }
  }

  async submitPrescription(): Promise<void> {
    if (!this.prescriptionFileName) {
      this.prescriptionFileName = `Prescription_${Date.now().toString().slice(-4)}.jpg`;
    }

    this.isUploadingPrescription = true;

    setTimeout(async () => {
      this.cartService.uploadPrescription({
        fileName: this.prescriptionFileName,
        notes: this.prescriptionNotes,
        type: this.prescriptionUploadType
      });

      this.isUploadingPrescription = false;
      this.isPrescriptionModalOpen = false;

      const toast = await this.toastCtrl.create({
        message:
          this.prescriptionUploadType === 'medicine'
            ? 'Prescription uploaded! Our pharmacist will review and verify your medicines shortly.'
            : 'Prescription uploaded! Our lab doctor will recommend the required tests.',
        duration: 3500,
        color: 'success',
        position: 'top',
        icon: 'checkmark-circle'
      });
      await toast.present();
    }, 900);
  }

  // ─── DYNAMIC PROMOTIONAL BANNERS (medtop & lab top) ────────────────────────
  loadPharmacyBanners(): void {
    const city = this.currentCity;
    this.isLoadingMedBanners = true;
    this.isLoadingLabBanners = true;

    // 1. Fetch medtop banners (Medicines)
    this.subs.add(
      this.commonService.getActiveBanners('medtop', city).subscribe({
        next: (res: any) => {
          const items = res?.data || (Array.isArray(res) ? res : []);
          this.medBanners = Array.isArray(items) ? items : [];
          this.isLoadingMedBanners = false;
        },
        error: (err: any) => {
          console.warn('Could not load medtop banners:', err?.message || err);
          this.medBanners = [];
          this.isLoadingMedBanners = false;
        }
      })
    );

    // 2. Fetch lab top banners (Lab Tests, supporting 'lab top' and 'labtop')
    this.subs.add(
      this.commonService.getActiveBanners('lab top', city).subscribe({
        next: (res: any) => {
          const items = res?.data || (Array.isArray(res) ? res : []);
          if (Array.isArray(items) && items.length > 0) {
            this.labBanners = items;
            this.isLoadingLabBanners = false;
          } else {
            // Fallback check without space
            this.subs.add(
              this.commonService.getActiveBanners('labtop', city).subscribe({
                next: (fallbackRes: any) => {
                  const fallbackItems = fallbackRes?.data || (Array.isArray(fallbackRes) ? fallbackRes : []);
                  this.labBanners = Array.isArray(fallbackItems) ? fallbackItems : [];
                  this.isLoadingLabBanners = false;
                },
                error: () => {
                  this.labBanners = [];
                  this.isLoadingLabBanners = false;
                }
              })
            );
          }
        },
        error: () => {
          this.labBanners = [];
          this.isLoadingLabBanners = false;
        }
      })
    );
  }

  getBannerImgUrl(banner: any): string {
    if (!banner?.img) return '';
    const img = String(banner.img).trim();
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('assets/')) {
      return img;
    }
    if (img.startsWith('/')) {
      return `${environment.apiUrl}${img}`;
    }
    return `${environment.apiUrl}/${img}`;
  }

  isBannerImageValid(banner: any): boolean {
    if (!banner?.img || banner.hasImgError) return false;
    const img = String(banner.img).trim();
    if (!img || img.includes('example.com') || img === 'null' || img === 'undefined') {
      return false;
    }
    return true;
  }

  hasValidMedBanners(): boolean {
    return Array.isArray(this.medBanners) && this.medBanners.some(b => this.isBannerImageValid(b));
  }

  hasValidLabBanners(): boolean {
    return Array.isArray(this.labBanners) && this.labBanners.some(b => this.isBannerImageValid(b));
  }

  onBannerImgError(banner: any): void {
    if (banner) {
      banner.hasImgError = true;
    }
  }

  navigateToBanner(banner: any): void {
    if (!banner) return;
    const route = (banner.route || '').trim();
    if (!route) return;

    if (route.startsWith('http://') || route.startsWith('https://')) {
      window.open(route, '_system');
      return;
    }

    if (route === 'pharmacy' || route === 'medicine' || route === 'medicines' || route === 'lab' || route === '/layout/pharmacy' || route === '/pharmacy') {
      return; // Already on pharmacy page
    }

    if (route === 'grocery' || route === '/layout/grocery' || route === '/layout/grocery-layout' || route === '/grocery') {
      this.router.navigate(['/layout/grocery-layout']);
      return;
    }

    if (route === 'rides' || route === 'ride' || route === 'cab' || route === '/layout/rides' || route === '/layout/ride') {
      this.router.navigate(['/layout/rides']);
      return;
    }

    if (route === 'food' || route === 'dineout' || route === '/layout/dineout-layout') {
      this.router.navigate(['/layout/dineout-layout']);
      return;
    }

    if (route.startsWith('/')) {
      this.router.navigate([route]);
    } else {
      this.router.navigate([`/layout/${route}`]);
    }
  }

  handleRefresh(event: any): void {
    this.loadPharmacyBanners();
    this.loadPharmacyData(event);
  }
}

