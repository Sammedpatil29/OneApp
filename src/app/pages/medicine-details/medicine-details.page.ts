import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonSkeletonText,
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
import { MedicineItem } from '../../models/pharmacy.model';
import { PharmacyCartService, CartBillSummary } from '../../services/pharmacy-cart.service';
import { PharmacyService } from '../../services/pharmacy.service';
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
    IonIcon,
    IonSkeletonText
  ]
})
export class MedicineDetailsPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  public cartService = inject(PharmacyCartService);
  private pharmacyService = inject(PharmacyService);

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
  private medSub!: Subscription;

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
      this.medSub = this.pharmacyService.getMedicineById(id).subscribe(med => {
        this.medicine = med || null;
        if (this.medicine) {
          this.medQty = this.cartService.getMedicineQuantity(this.medicine.id);
        }
      });
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
    this.medSub?.unsubscribe();
  }

  goBack(): void {
    this.navCtrl.navigateBack('/layout/pharmacy');
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

