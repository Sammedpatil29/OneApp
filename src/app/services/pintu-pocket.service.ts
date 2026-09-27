import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PocketTransaction {
  id: string;
  type: 'credit' | 'debit';
  title: string;
  subtitle: string;
  amount: number;
  timestamp: string;
  referenceId: string;
  category: 'bonus' | 'cashback' | 'referral' | 'spent';
  status: 'success' | 'pending' | 'failed';
}

@Injectable({
  providedIn: 'root'
})
export class PintuPocketService {
  private readonly BALANCE_KEY = 'pintu_pocket_balance';
  private readonly TXNS_KEY = 'pintu_pocket_txns';

  // Seed with ₹120 total promotional rewards:
  // ₹50 Welcome Bonus + ₹40 Order Cashback + ₹30 Referral Reward
  private balanceSubject = new BehaviorSubject<number>(120);
  public balance$: Observable<number> = this.balanceSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<PocketTransaction[]>([]);
  public transactions$: Observable<PocketTransaction[]> = this.transactionsSubject.asObservable();

  constructor() {
    this.initPocket();
  }

  private initPocket(): void {
    try {
      const savedBalance = localStorage.getItem(this.BALANCE_KEY);
      if (savedBalance !== null) {
        this.balanceSubject.next(parseFloat(savedBalance) || 0);
      } else {
        this.setBalance(120);
      }

      const savedTxns = localStorage.getItem(this.TXNS_KEY);
      if (savedTxns) {
        const parsed = JSON.parse(savedTxns);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.transactionsSubject.next(parsed);
          return;
        }
      }

      // Default seed promotional rewards & cashbacks
      const seedTxns: PocketTransaction[] = [
        {
          id: 'TXN-PNT-9821',
          type: 'credit',
          title: 'Welcome Joining Bonus',
          subtitle: 'Signup reward credited to your Pintu Pocket',
          amount: 50,
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          referenceId: 'REF-JOIN-50',
          category: 'bonus',
          status: 'success'
        },
        {
          id: 'TXN-PNT-8412',
          type: 'credit',
          title: 'Grocery Order Cashback',
          subtitle: 'Super Saver 10% order reward',
          amount: 40,
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          referenceId: 'CB-GROC-7749',
          category: 'cashback',
          status: 'success'
        },
        {
          id: 'TXN-PNT-7119',
          type: 'credit',
          title: 'Referral Reward',
          subtitle: 'Friend completed their first order',
          amount: 30,
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          referenceId: 'REF-FRND-3841',
          category: 'referral',
          status: 'success'
        }
      ];

      this.saveTransactions(seedTxns);
    } catch (e) {
      console.warn('Failed to init Pintu Pocket storage:', e);
    }
  }

  public get currentBalance(): number {
    return this.balanceSubject.value;
  }

  /**
   * Credits earned reward, welcome bonus, or order cashback to Pintu Pocket.
   * Note: Pintu Pocket cannot be manually loaded by users; it receives rewards & bonuses.
   */
  public creditReward(
    amount: number,
    title: string,
    subtitle: string,
    category: 'bonus' | 'cashback' | 'referral' = 'bonus'
  ): boolean {
    if (amount <= 0) return false;
    const newBal = Math.round((this.currentBalance + amount) * 100) / 100;
    this.setBalance(newBal);

    const txn: PocketTransaction = {
      id: `TXN-PNT-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'credit',
      title,
      subtitle,
      amount,
      timestamp: new Date().toISOString(),
      referenceId: `RWD-${Date.now().toString().slice(-6)}`,
      category,
      status: 'success'
    };

    const currentList = this.transactionsSubject.value;
    this.saveTransactions([txn, ...currentList]);
    return true;
  }

  /**
   * Spends / redeems available rewards towards an order.
   */
  public spendMoney(amount: number, orderTitle: string, referenceId: string): boolean {
    if (amount <= 0 || this.currentBalance < amount) return false;
    const newBal = Math.round((this.currentBalance - amount) * 100) / 100;
    this.setBalance(newBal);

    const txn: PocketTransaction = {
      id: `TXN-PNT-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'debit',
      title: orderTitle || 'Order Payment',
      subtitle: 'Redeemed from Pintu Pocket',
      amount,
      timestamp: new Date().toISOString(),
      referenceId: referenceId || `ORD-${Date.now().toString().slice(-6)}`,
      category: 'spent',
      status: 'success'
    };

    const currentList = this.transactionsSubject.value;
    this.saveTransactions([txn, ...currentList]);
    return true;
  }

  private setBalance(balance: number): void {
    this.balanceSubject.next(balance);
    try {
      localStorage.setItem(this.BALANCE_KEY, balance.toString());
    } catch (e) {}
  }

  private saveTransactions(txns: PocketTransaction[]): void {
    this.transactionsSubject.next(txns);
    try {
      localStorage.setItem(this.TXNS_KEY, JSON.stringify(txns));
    } catch (e) {}
  }
}
