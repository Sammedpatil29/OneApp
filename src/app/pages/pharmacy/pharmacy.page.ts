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
import {
  PharmacyCartService,
  CartBillSummary
} from 'src/app/services/pharmacy-cart.service';
import { PharmacyService } from 'src/app/services/pharmacy.service';
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

  private subs: Subscription = new Subscription();

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private locationService: LocationService,
    public cartService: PharmacyCartService,
    private pharmacyService: PharmacyService,
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

  handleRefresh(event: any): void {
    this.loadPharmacyData(event);
  }
}

