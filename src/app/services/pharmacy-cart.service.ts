import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  MedicineItem,
  LabTestPackage,
  CartMedicineItem,
  CartLabItem,
  PrescriptionUpload
} from '../models/pharmacy.model';

export interface CartBillSummary {
  itemCount: number;
  subtotal: number;
  totalMrp: number;
  savings: number;
  fee: number;
  grandTotal: number;
}

const MED_CART_KEY = 'pintu_med_cart';
const LAB_CART_KEY = 'pintu_lab_cart';
const PRESCRIPTIONS_KEY = 'pintu_prescriptions';

@Injectable({
  providedIn: 'root'
})
export class PharmacyCartService {
  // ─── 1. Separate Medicine Cart State ───────────────────────────────────────
  private _medicineCart = new BehaviorSubject<CartMedicineItem[]>(this.loadStoredCart<CartMedicineItem>(MED_CART_KEY));
  public medicineCart$: Observable<CartMedicineItem[]> = this._medicineCart.asObservable();

  // ─── 2. Separate Lab Test Cart State ───────────────────────────────────────
  private _labCart = new BehaviorSubject<CartLabItem[]>(this.loadStoredCart<CartLabItem>(LAB_CART_KEY));
  public labCart$: Observable<CartLabItem[]> = this._labCart.asObservable();

  // ─── 3. Prescriptions State ────────────────────────────────────────────────
  private _prescriptions = new BehaviorSubject<PrescriptionUpload[]>(this.loadStoredCart<PrescriptionUpload>(PRESCRIPTIONS_KEY));
  public prescriptions$: Observable<PrescriptionUpload[]> = this._prescriptions.asObservable();

  // ─── Medicine Cart Bill Summary Observable ─────────────────────────────────
  public medicineSummary$: Observable<CartBillSummary> = this.medicineCart$.pipe(
    map((items) => {
      let subtotal = 0;
      let totalMrp = 0;
      let count = 0;

      items.forEach((ci) => {
        subtotal += ci.item.price * ci.quantity;
        totalMrp += ci.item.mrp * ci.quantity;
        count += ci.quantity;
      });

      const savings = Math.max(0, totalMrp - subtotal);
      // Free delivery above ₹199, else ₹25
      const deliveryFee = count > 0 && subtotal < 199 ? 25 : 0;
      const platformFee = count > 0 ? 5 : 0;
      const grandTotal = count > 0 ? subtotal + deliveryFee + platformFee : 0;

      return {
        itemCount: count,
        subtotal,
        totalMrp,
        savings,
        fee: deliveryFee + platformFee,
        grandTotal
      };
    })
  );

  // ─── Lab Test Cart Bill Summary Observable ─────────────────────────────────
  public labSummary$: Observable<CartBillSummary> = this.labCart$.pipe(
    map((items) => {
      let subtotal = 0;
      let totalMrp = 0;
      let count = 0;

      items.forEach((ci) => {
        subtotal += ci.test.price * ci.quantity;
        totalMrp += ci.test.mrp * ci.quantity;
        count += ci.quantity;
      });

      const savings = Math.max(0, totalMrp - subtotal);
      // Free home sample collection above ₹499, else ₹50
      const homeCollectionFee = count > 0 && subtotal < 499 ? 50 : 0;
      const grandTotal = count > 0 ? subtotal + homeCollectionFee : 0;

      return {
        itemCount: count,
        subtotal,
        totalMrp,
        savings,
        fee: homeCollectionFee,
        grandTotal
      };
    })
  );

  constructor() {}

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDICINE CART METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  addMedicine(item: MedicineItem, qty: number = 1): void {
    const current = [...this._medicineCart.value];
    const index = current.findIndex((c) => c.item.id === item.id);

    if (index > -1) {
      current[index] = {
        ...current[index],
        quantity: current[index].quantity + qty
      };
    } else {
      current.push({ item, quantity: qty });
    }

    this.updateMedicineCart(current);
  }

  updateMedicineQuantity(itemId: string, qty: number): void {
    let current = [...this._medicineCart.value];
    if (qty <= 0) {
      current = current.filter((c) => c.item.id !== itemId);
    } else {
      const index = current.findIndex((c) => c.item.id === itemId);
      if (index > -1) {
        current[index] = { ...current[index], quantity: qty };
      }
    }
    this.updateMedicineCart(current);
  }

  removeMedicine(itemId: string): void {
    const current = this._medicineCart.value.filter((c) => c.item.id !== itemId);
    this.updateMedicineCart(current);
  }

  getMedicineQuantity(itemId: string): number {
    const found = this._medicineCart.value.find((c) => c.item.id === itemId);
    return found ? found.quantity : 0;
  }

  clearMedicineCart(): void {
    this.updateMedicineCart([]);
  }

  private updateMedicineCart(items: CartMedicineItem[]): void {
    this._medicineCart.next(items);
    this.persist(MED_CART_KEY, items);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LAB TEST CART METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  addLabTest(test: LabTestPackage): void {
    const current = [...this._labCart.value];
    const index = current.findIndex((c) => c.test.id === test.id);

    if (index > -1) {
      // Toggle or increment
      current[index] = { ...current[index], quantity: current[index].quantity + 1 };
    } else {
      current.push({ test, quantity: 1 });
    }

    this.updateLabCart(current);
  }

  toggleLabTest(test: LabTestPackage): void {
    const isPresent = this.isLabTestInCart(test.id);
    if (isPresent) {
      this.removeLabTest(test.id);
    } else {
      this.addLabTest(test);
    }
  }

  removeLabTest(testId: string): void {
    const current = this._labCart.value.filter((c) => c.test.id !== testId);
    this.updateLabCart(current);
  }

  isLabTestInCart(testId: string): boolean {
    return this._labCart.value.some((c) => c.test.id === testId);
  }

  clearLabCart(): void {
    this.updateLabCart([]);
  }

  private updateLabCart(items: CartLabItem[]): void {
    this._labCart.next(items);
    this.persist(LAB_CART_KEY, items);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRESCRIPTION UPLOAD
  // ═══════════════════════════════════════════════════════════════════════════

  uploadPrescription(data: {
    fileName: string;
    fileUrl?: string;
    notes?: string;
    type: 'medicine' | 'lab';
  }): PrescriptionUpload {
    const newRx: PrescriptionUpload = {
      id: `rx-${Date.now()}`,
      fileName: data.fileName,
      fileUrl: data.fileUrl || 'assets/icons/prescription_doc.png',
      uploadedAt: new Date(),
      notes: data.notes || '',
      type: data.type
    };

    const current = [newRx, ...this._prescriptions.value];
    this._prescriptions.next(current);
    this.persist(PRESCRIPTIONS_KEY, current);
    return newRx;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL STORAGE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private loadStoredCart<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.warn(`Could not load ${key} from storage:`, e);
    }
    return [];
  }

  private persist(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Could not persist ${key}:`, e);
    }
  }
}

