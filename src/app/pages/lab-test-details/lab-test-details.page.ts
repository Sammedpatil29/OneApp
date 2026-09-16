import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  NavController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  shareSocialOutline,
  flaskOutline,
  timeOutline,
  receiptOutline,
  waterOutline,
  checkmarkCircle,
  shieldCheckmarkOutline,
  add,
  remove,
  chevronForward,
  arrowForward,
  homeOutline,
  sparklesOutline,
  documentTextOutline,
  medkitOutline
} from 'ionicons/icons';
import { LabTestPackage, DUMMY_LAB_TESTS } from '../../models/pharmacy.model';
import { PharmacyCartService, CartBillSummary } from '../../services/pharmacy-cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lab-test-details',
  templateUrl: './lab-test-details.page.html',
  styleUrls: ['./lab-test-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon
  ]
})
export class LabTestDetailsPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  public cartService = inject(PharmacyCartService);

  testPackage: LabTestPackage | null = null;
  isBooked: boolean = false;
  labSummary: CartBillSummary = {
    subtotal: 0,
    totalMrp: 0,
    savings: 0,
    fee: 0,
    grandTotal: 0,
    itemCount: 0
  };

  private cartSub!: Subscription;
  private summarySub!: Subscription;

  constructor() {
    addIcons({
      arrowBack,
      shareSocialOutline,
      flaskOutline,
      timeOutline,
      receiptOutline,
      waterOutline,
      checkmarkCircle,
      shieldCheckmarkOutline,
      add,
      remove,
      chevronForward,
      arrowForward,
      homeOutline,
      sparklesOutline,
      documentTextOutline,
      medkitOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.testPackage = DUMMY_LAB_TESTS.find(t => t.id === id) || null;
    }

    if (!this.testPackage) {
      // Default fallback test
      this.testPackage = DUMMY_LAB_TESTS[0];
    }

    this.cartSub = this.cartService.labCart$.subscribe(() => {
      if (this.testPackage) {
        this.isBooked = this.cartService.isLabTestInCart(this.testPackage.id);
      }
    });

    this.summarySub = this.cartService.labSummary$.subscribe(summary => {
      this.labSummary = summary;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.summarySub?.unsubscribe();
  }

  goBack(): void {
    this.navCtrl.navigateBack('/layout/pharmacy');
  }

  goToCart(): void {
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type: 'lab' }
    });
  }

  toggleBooking(): void {
    if (!this.testPackage) return;
    this.cartService.toggleLabTest(this.testPackage);
  }

  async sharePackage(): Promise<void> {
    if (!this.testPackage) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.testPackage.name,
          text: `Book ${this.testPackage.name} (${this.testPackage.testCount} tests) on Pintu at just ₹${this.testPackage.price}! Free home sample pickup.`,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      const toast = await this.toastCtrl.create({
        message: 'Link copied to clipboard!',
        duration: 1800,
        position: 'bottom',
        color: 'dark'
      });
      await toast.present();
    }
  }
}

