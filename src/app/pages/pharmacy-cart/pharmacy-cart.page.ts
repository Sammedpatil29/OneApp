import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController, AlertController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  bagHandleOutline,
  flaskOutline,
  trashOutline,
  add,
  remove,
  locationOutline,
  chevronForward,
  documentTextOutline,
  cloudUploadOutline,
  shieldCheckmarkOutline,
  timeOutline,
  receiptOutline,
  checkmarkCircle,
  checkmarkCircleOutline,
  pricetagOutline,
  closeOutline,
  cameraOutline,
  personOutline,
  calendarOutline
} from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';
import {
  PharmacyCartService,
  CartBillSummary
} from 'src/app/services/pharmacy-cart.service';
import {
  CartMedicineItem,
  CartLabItem,
  PrescriptionUpload
} from 'src/app/models/pharmacy.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacy-cart',
  templateUrl: './pharmacy-cart.page.html',
  styleUrls: ['./pharmacy-cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon,
    IonModal
  ]
})
export class PharmacyCartPage implements OnInit, OnDestroy {
  activeCartType: 'medicine' | 'lab' = 'medicine';

  // Delivery / Collection Location
  displayLocationName: string = 'Home';
  displayFullAddress: string = '';

  // Medicine Cart State
  medicineItems: CartMedicineItem[] = [];
  medSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };
  hasPrescriptionRequiredItems: boolean = false;
  latestPrescription: PrescriptionUpload | null = null;
  appliedCoupon: string = '';
  couponDiscount: number = 0;

  // Lab Cart State
  labItems: CartLabItem[] = [];
  labSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };

  // Patient & Slot Details for Lab
  patientName: string = '';
  patientAge: string = '';
  patientGender: 'Male' | 'Female' | 'Other' = 'Male';
  selectedDateOption: 'Today' | 'Tomorrow' | 'Day After' = 'Tomorrow';
  selectedTimeSlot: string = '06:30 AM - 08:30 AM (Fasting)';

  availableTimeSlots: string[] = [
    '06:30 AM - 08:30 AM (Fasting)',
    '08:30 AM - 10:30 AM',
    '10:30 AM - 12:30 PM',
    '04:30 PM - 06:30 PM'
  ];

  // Prescription Modal State
  isPrescriptionModalOpen: boolean = false;
  prescriptionFileName: string = '';
  prescriptionNotes: string = '';
  isUploadingPrescription: boolean = false;

  // Order placing loading
  isProcessingCheckout: boolean = false;

  private subs: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private locationService: LocationService,
    public cartService: PharmacyCartService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      arrowBack,
      bagHandleOutline,
      flaskOutline,
      trashOutline,
      add,
      remove,
      locationOutline,
      chevronForward,
      documentTextOutline,
      cloudUploadOutline,
      shieldCheckmarkOutline,
      timeOutline,
      receiptOutline,
      checkmarkCircle,
      checkmarkCircleOutline,
      pricetagOutline,
      closeOutline,
      cameraOutline,
      personOutline,
      calendarOutline
    });
  }

  ngOnInit(): void {
    // 1. Read query parameters
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        if (params['type'] === 'lab' || params['type'] === 'lab_tests') {
          this.activeCartType = 'lab';
        } else {
          this.activeCartType = 'medicine';
        }
      })
    );

    // 2. Sync Location
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        this.applyLocation(parsed);
      } catch (e) {}
    }

    this.subs.add(
      this.locationService.location$.subscribe((loc) => {
        if (loc) this.applyLocation(loc);
      })
    );

    this.subs.add(
      this.locationService.address$.subscribe((addr) => {
        if (addr && addr.trim()) {
          this.displayFullAddress = addr.trim();
        }
      })
    );

    // 3. Subscribe to Medicine Cart
    this.subs.add(
      this.cartService.medicineCart$.subscribe((items) => {
        this.medicineItems = items;
        this.hasPrescriptionRequiredItems = items.some((i) => i.item.prescriptionRequired);
      })
    );

    this.subs.add(
      this.cartService.medicineSummary$.subscribe((sum) => {
        this.medSummary = sum;
      })
    );

    // 4. Subscribe to Lab Cart
    this.subs.add(
      this.cartService.labCart$.subscribe((items) => {
        this.labItems = items;
      })
    );

    this.subs.add(
      this.cartService.labSummary$.subscribe((sum) => {
        this.labSummary = sum;
      })
    );

    // 5. Prescriptions list
    this.subs.add(
      this.cartService.prescriptions$.subscribe((rxList) => {
        if (rxList && rxList.length > 0) {
          this.latestPrescription = rxList[0];
        } else {
          this.latestPrescription = null;
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
  }

  goBack(): void {
    this.navCtrl.navigateBack('/layout/pharmacy');
  }

  switchCartType(type: 'medicine' | 'lab'): void {
    this.activeCartType = type;
  }

  openLocation(): void {
    this.router.navigate(['/layout/address-list'], {
      state: { data: 'pharmacy' }
    });
  }

  // ─── MEDICINE CART ACTIONS ────────────────────────────────────────────────
  updateMedQty(itemId: string, newQty: number): void {
    this.cartService.updateMedicineQuantity(itemId, newQty);
  }

  removeMedicine(itemId: string): void {
    this.cartService.removeMedicine(itemId);
  }

  applyCouponCode(code: string): void {
    if (code === 'HEALTH15') {
      this.appliedCoupon = 'HEALTH15';
      this.couponDiscount = Math.round(this.medSummary.subtotal * 0.15);
      this.showToast('Coupon HEALTH15 applied! 15% extra discount.', 'success');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon = '';
    this.couponDiscount = 0;
  }

  get finalMedicineTotal(): number {
    return Math.max(0, this.medSummary.grandTotal - this.couponDiscount);
  }

  // ─── LAB CART ACTIONS ─────────────────────────────────────────────────────
  removeLabTest(testId: string): void {
    this.cartService.removeLabTest(testId);
  }

  selectDateOption(date: 'Today' | 'Tomorrow' | 'Day After'): void {
    this.selectedDateOption = date;
  }

  selectTimeSlot(slot: string): void {
    this.selectedTimeSlot = slot;
  }

  // ─── PRESCRIPTION MODAL ───────────────────────────────────────────────────
  openPrescriptionSheet(): void {
    this.prescriptionFileName = '';
    this.prescriptionNotes = '';
    this.isPrescriptionModalOpen = true;
  }

  closePrescriptionSheet(): void {
    this.isPrescriptionModalOpen = false;
  }

  simulateFilePick(source: 'camera' | 'gallery' | 'doc'): void {
    const timestamp = new Date().getTime().toString().slice(-4);
    if (source === 'camera') {
      this.prescriptionFileName = `Rx_Photo_${timestamp}.jpg`;
    } else if (source === 'gallery') {
      this.prescriptionFileName = `Prescription_${timestamp}.png`;
    } else {
      this.prescriptionFileName = `Doctor_Prescription_${timestamp}.pdf`;
    }
  }

  submitPrescription(): void {
    if (!this.prescriptionFileName) {
      this.prescriptionFileName = `Prescription_${Date.now().toString().slice(-4)}.jpg`;
    }

    this.isUploadingPrescription = true;
    setTimeout(() => {
      this.latestPrescription = this.cartService.uploadPrescription({
        fileName: this.prescriptionFileName,
        notes: this.prescriptionNotes,
        type: 'medicine'
      });
      this.isUploadingPrescription = false;
      this.isPrescriptionModalOpen = false;
      this.showToast('Prescription attached to your order!', 'success');
    }, 800);
  }

  // ─── CHECKOUT / ORDER PLACEMENT ───────────────────────────────────────────
  async placeMedicineOrder(): Promise<void> {
    if (this.medicineItems.length === 0) return;

    if (this.hasPrescriptionRequiredItems && !this.latestPrescription) {
      const alert = await this.alertCtrl.create({
        header: 'Prescription Required',
        message: 'One or more medicines in your cart require a valid doctor prescription. Please attach your prescription before proceeding.',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Upload Now',
            handler: () => {
              this.openPrescriptionSheet();
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    this.isProcessingCheckout = true;

    setTimeout(async () => {
      this.isProcessingCheckout = false;
      const orderId = `MED-${Math.floor(100000 + Math.random() * 900000)}`;

      // Clear cart
      this.cartService.clearMedicineCart();
      this.removeCoupon();

      const alert = await this.alertCtrl.create({
        header: 'Order Placed Successfully! 🎉',
        subHeader: `Order ID: #${orderId}`,
        message: `Your medicines order of ₹${this.finalMedicineTotal} is confirmed and scheduled for delivery to ${this.displayLocationName}.`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Back to Pharmacy',
            handler: () => {
              this.router.navigate(['/layout/pharmacy']);
            }
          }
        ]
      });
      await alert.present();
    }, 1200);
  }

  async bookLabTests(): Promise<void> {
    if (this.labItems.length === 0) return;

    if (!this.patientName.trim()) {
      this.showToast('Please enter the patient name for lab sample collection.', 'warning');
      return;
    }

    this.isProcessingCheckout = true;

    setTimeout(async () => {
      this.isProcessingCheckout = false;
      const bookingId = `LAB-${Math.floor(100000 + Math.random() * 900000)}`;

      // Clear lab cart
      this.cartService.clearLabCart();

      const alert = await this.alertCtrl.create({
        header: 'Lab Test Booked! 🧪',
        subHeader: `Booking Ref: #${bookingId}`,
        message: `Home sample pickup scheduled for ${this.patientName} on ${this.selectedDateOption}, ${this.selectedTimeSlot}. Certified phlebotomist will visit ${this.displayLocationName}.`,
        backdropDismiss: false,
        buttons: [
          {
            text: 'Done',
            handler: () => {
              this.router.navigate(['/layout/pharmacy']);
            }
          }
        ]
      });
      await alert.present();
    }, 1200);
  }

  browsePharmacy(): void {
    this.router.navigate(['/layout/pharmacy']);
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}

