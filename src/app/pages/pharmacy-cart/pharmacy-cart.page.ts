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
  IonModal,
  IonDatetime
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
  calendar,
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

export interface CalendarDayOption {
  dateStr: string;
  dayName: string;
  dayNum: string;
  month: string;
  fullDisplay: string;
}

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
    IonModal,
    IonDatetime
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
  selectedTimeSlot: string = '06:00 AM - 07:00 AM (Fasting)';
  customDate: string = '';
  weekDayOptions: CalendarDayOption[] = [];
  isCalendarModalOpen: boolean = false;

  defaultTimeSlots: string[] = [
    '06:00 AM - 07:00 AM (Fasting)',
    '07:00 AM - 08:00 AM (Fasting)',
    '08:00 AM - 09:00 AM (Fasting)',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
  ];

  dayAfterTimeSlots: string[] = [
    '06:00 AM - 07:00 AM (Fasting)',
    '07:00 AM - 08:00 AM (Fasting)',
    '08:00 AM - 09:00 AM (Fasting)',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
  ];

  availableTimeSlots: string[] = [
    '06:00 AM - 07:00 AM (Fasting)',
    '07:00 AM - 08:00 AM (Fasting)',
    '08:00 AM - 09:00 AM (Fasting)',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
    '08:00 PM - 09:00 PM'
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
      calendar,
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

    // 6. Initialize default custom date (Day after tomorrow) and generate 1-week enabled dates
    this.generateWeekDays();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  generateWeekDays(baseDate?: Date): void {
    const days: CalendarDayOption[] = [];
    const start = baseDate ? new Date(baseDate) : new Date();
    if (!baseDate) {
      start.setDate(start.getDate() + 2);
    }
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = this.formatDateToYMD(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const fullDisplay = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
      days.push({ dateStr, dayName, dayNum, month, fullDisplay });
    }
    this.weekDayOptions = days;
    if (days.length > 0 && !this.customDate) {
      this.customDate = days[0].dateStr;
    }
  }

  get minDayAfterDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return this.formatDateToYMD(d);
  }

  get maxEnabledDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 8); // 1-week enabled window (7 days from Day After Tomorrow)
    return this.formatDateToYMD(d);
  }

  get maxDayAfterDate(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1); // 1-year future calendar viewable
    return this.formatDateToYMD(d);
  }

  isDateEnabled = (dateIsoString: string): boolean => {
    const date = dateIsoString.split('T')[0];
    // Calendar viewable for 1 year, but only 1-week booking window is enabled
    return date >= this.minDayAfterDate && date <= this.maxEnabledDate;
  };

  getSlotMainTime(slot: string): string {
    return slot.replace(/\s*\(Fasting\)/gi, '').trim();
  }

  isFastingSlot(slot: string): boolean {
    return slot.toLowerCase().includes('fasting');
  }

  selectWeekDate(day: CalendarDayOption): void {
    this.customDate = day.dateStr;
    this.onCustomDateChange();
  }

  openCalendarModal(): void {
    this.isCalendarModalOpen = true;
  }

  closeCalendarModal(): void {
    this.isCalendarModalOpen = false;
  }

  onDateSelectedFromCalendar(event: any): void {
    const val = event?.detail?.value;
    if (val) {
      const selected = typeof val === 'string' ? val.split('T')[0] : this.formatDateToYMD(new Date(val));
      this.customDate = selected;
      const [y, m, d] = selected.split('-').map(Number);
      this.generateWeekDays(new Date(y, m - 1, d));
      this.onCustomDateChange();
    }
  }

  private formatDateToYMD(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFormattedCustomDate(): string {
    if (!this.customDate) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    const [y, m, d] = this.customDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  getCustomDateChipLabel(): string {
    if (!this.customDate) return 'Select Date';
    const [y, m, d] = this.customDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
    if (date === 'Day After') {
      this.availableTimeSlots = [...this.dayAfterTimeSlots];
      if (!this.dayAfterTimeSlots.includes(this.selectedTimeSlot)) {
        this.selectedTimeSlot = this.dayAfterTimeSlots[0];
      }
    } else {
      this.availableTimeSlots = [...this.defaultTimeSlots];
      if (!this.defaultTimeSlots.includes(this.selectedTimeSlot)) {
        this.selectedTimeSlot = this.defaultTimeSlots[0];
      }
    }
  }

  onCustomDateChange(): void {
    this.selectedDateOption = 'Day After';
    this.availableTimeSlots = [...this.dayAfterTimeSlots];
    if (!this.dayAfterTimeSlots.includes(this.selectedTimeSlot)) {
      this.selectedTimeSlot = this.dayAfterTimeSlots[0];
    }
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

      const dateDisplay = this.selectedDateOption === 'Day After'
        ? this.getFormattedCustomDate()
        : this.selectedDateOption;

      const alert = await this.alertCtrl.create({
        header: 'Lab Test Booked! 🧪',
        subHeader: `Booking Ref: #${bookingId}`,
        message: `Home sample pickup scheduled for ${this.patientName} on ${dateDisplay}, ${this.selectedTimeSlot}. Certified phlebotomist will visit ${this.displayLocationName}.`,
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

