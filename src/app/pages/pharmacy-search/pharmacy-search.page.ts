import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  searchOutline,
  closeOutline,
  medkitOutline,
  flaskOutline,
  add,
  remove,
  checkmarkCircle,
  timeOutline,
  waterOutline,
  receiptOutline,
  sparklesOutline,
  bagHandleOutline,
  arrowForward,
  trendingUpOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import {
  MedicineItem,
  LabTestPackage,
  DUMMY_MEDICINES,
  DUMMY_LAB_TESTS
} from 'src/app/models/pharmacy.model';
import {
  PharmacyCartService,
  CartBillSummary
} from 'src/app/services/pharmacy-cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacy-search',
  templateUrl: './pharmacy-search.page.html',
  styleUrls: ['./pharmacy-search.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonIcon
  ]
})
export class PharmacySearchPage implements OnInit, OnDestroy {
  searchType: 'medicine' | 'lab' = 'medicine';
  searchQuery: string = '';

  allMedicines: MedicineItem[] = DUMMY_MEDICINES;
  allLabTests: LabTestPackage[] = DUMMY_LAB_TESTS;

  filteredMedicines: MedicineItem[] = [];
  filteredLabTests: LabTestPackage[] = [];

  medTrendingTags: string[] = [
    'Dolo 650',
    'Paracetamol',
    'Cough Syrup',
    'Vitamin C',
    'Volini Spray',
    'Digene',
    'Betadine',
    'Electral ORS'
  ];

  labTrendingTags: string[] = [
    'Full Body Checkup',
    'CBC with ESR',
    'Thyroid Profile',
    'HbA1c Diabetes',
    'Lipid Profile',
    'Vitamin D & B12',
    'Liver Function Test',
    'Kidney Function'
  ];

  medSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };
  labSummary: CartBillSummary = { itemCount: 0, subtotal: 0, totalMrp: 0, savings: 0, fee: 0, grandTotal: 0 };

  private subs: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    public cartService: PharmacyCartService
  ) {
    addIcons({
      arrowBack,
      searchOutline,
      closeOutline,
      medkitOutline,
      flaskOutline,
      add,
      remove,
      checkmarkCircle,
      timeOutline,
      waterOutline,
      receiptOutline,
      sparklesOutline,
      bagHandleOutline,
      arrowForward,
      trendingUpOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit(): void {
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        if (params['type'] === 'lab' || params['type'] === 'lab_tests') {
          this.searchType = 'lab';
        } else {
          this.searchType = 'medicine';
        }
        if (params['q']) {
          this.searchQuery = params['q'];
          this.onSearchInput();
        }
      })
    );

    this.subs.add(
      this.cartService.medicineSummary$.subscribe((sum) => {
        this.medSummary = sum;
      })
    );

    this.subs.add(
      this.cartService.labSummary$.subscribe((sum) => {
        this.labSummary = sum;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  goBack(): void {
    this.navCtrl.back();
  }

  setSearchType(type: 'medicine' | 'lab'): void {
    this.searchType = type;
    this.onSearchInput();
  }

  onSearchInput(): void {
    const q = this.searchQuery.trim().toLowerCase();

    if (!q) {
      this.filteredMedicines = [];
      this.filteredLabTests = [];
      return;
    }

    if (this.searchType === 'medicine') {
      this.filteredMedicines = this.allMedicines.filter((m) => {
        const nameMatch = m.name.toLowerCase().includes(q);
        const brandMatch = m.brand.toLowerCase().includes(q);
        const categoryMatch = m.category.toLowerCase().includes(q);
        const descMatch = m.description.toLowerCase().includes(q);
        const usesMatch = m.uses ? m.uses.some((u) => u.toLowerCase().includes(q)) : false;
        return nameMatch || brandMatch || categoryMatch || descMatch || usesMatch;
      });
    } else {
      this.filteredLabTests = this.allLabTests.filter((t) => {
        const nameMatch = t.name.toLowerCase().includes(q);
        const categoryMatch = t.category.toLowerCase().includes(q);
        const descMatch = t.description.toLowerCase().includes(q);
        const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));
        const paramMatch = t.parameters.some((p) => p.toLowerCase().includes(q));
        return nameMatch || categoryMatch || descMatch || tagMatch || paramMatch;
      });
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredMedicines = [];
    this.filteredLabTests = [];
  }

  applyTrendingTag(tag: string): void {
    this.searchQuery = tag;
    this.onSearchInput();
  }

  // Medicine Actions
  getMedicineQty(itemId: string): number {
    return this.cartService.getMedicineQuantity(itemId);
  }

  addMedicine(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    this.cartService.addMedicine(item, 1);
  }

  incrementMedicine(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    const qty = this.getMedicineQty(item.id);
    this.cartService.updateMedicineQuantity(item.id, qty + 1);
  }

  decrementMedicine(item: MedicineItem, event?: Event): void {
    if (event) event.stopPropagation();
    const qty = this.getMedicineQty(item.id);
    this.cartService.updateMedicineQuantity(item.id, qty - 1);
  }

  // Lab Actions
  isLabBooked(testId: string): boolean {
    return this.cartService.isLabTestInCart(testId);
  }

  toggleLabTest(test: LabTestPackage, event?: Event): void {
    if (event) event.stopPropagation();
    this.cartService.toggleLabTest(test);
  }

  openMedicineDetails(id: string): void {
    this.navCtrl.navigateForward(`/layout/pharmacy/medicine/${id}`);
  }

  openLabTestDetails(id: string): void {
    this.navCtrl.navigateForward(`/layout/pharmacy/test/${id}`);
  }

  goToCart(): void {
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type: this.searchType }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type: this.searchType, action: 'pay' }
    });
  }
}

