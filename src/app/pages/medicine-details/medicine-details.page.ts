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
  cartOutline,
  add,
  remove,
  shieldCheckmarkOutline,
  flashOutline,
  checkmarkCircle,
  informationCircleOutline,
  warningOutline,
  chevronForward,
  arrowForward,
  medkitOutline,
  bagHandleOutline,
  sparklesOutline,
  timeOutline
} from 'ionicons/icons';
import { MedicineItem, DUMMY_MEDICINES } from '../../models/pharmacy.model';
import { PharmacyCartService, CartBillSummary } from '../../services/pharmacy-cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-medicine-details',
  templateUrl: './medicine-details.page.html',
  styleUrls: ['./medicine-details.page.scss'],
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
export class MedicineDetailsPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  public cartService = inject(PharmacyCartService);

  medicine: MedicineItem | null = null;
  medQty: number = 0;
  medSummary: CartBillSummary = {
    itemCount: 0,
    subtotal: 0,
    totalMrp: 0,
    savings: 0,
    fee: 0,
    grandTotal: 0
  };

  private cartSub!: Subscription;
  private summarySub!: Subscription;

  constructor() {
    addIcons({
      arrowBack,
      shareSocialOutline,
      cartOutline,
      add,
      remove,
      shieldCheckmarkOutline,
      flashOutline,
      checkmarkCircle,
      informationCircleOutline,
      warningOutline,
      chevronForward,
      arrowForward,
      medkitOutline,
      bagHandleOutline,
      sparklesOutline,
      timeOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medicine = DUMMY_MEDICINES.find(m => m.id === id) || null;
    }

    if (!this.medicine) {
      // Default fallback medicine
      this.medicine = DUMMY_MEDICINES[0];
    }

    this.cartSub = this.cartService.medicineCart$.subscribe(items => {
      if (this.medicine) {
        const found = items.find(i => i.item.id === this.medicine!.id);
        this.medQty = found ? found.quantity : 0;
      }
    });

    this.summarySub = this.cartService.medicineSummary$.subscribe(summary => {
      this.medSummary = summary;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.summarySub?.unsubscribe();
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goToCart(): void {
    this.router.navigate(['/layout/pharmacy/cart'], {
      queryParams: { type: 'medicine' }
    });
  }

  addToCart(): void {
    if (!this.medicine) return;
    this.cartService.addMedicine(this.medicine, 1);
  }

  increment(): void {
    if (!this.medicine) return;
    this.cartService.updateMedicineQuantity(this.medicine.id, this.medQty + 1);
  }

  decrement(): void {
    if (!this.medicine) return;
    this.cartService.updateMedicineQuantity(this.medicine.id, this.medQty - 1);
  }

  async shareProduct(): Promise<void> {
    if (!this.medicine) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.medicine.name,
          text: `Buy ${this.medicine.name} (${this.medicine.packSize}) on Pintu at ₹${this.medicine.price}!`,
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

