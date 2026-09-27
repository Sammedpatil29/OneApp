import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  NavController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  walletOutline,
  checkmarkCircle,
  shieldCheckmarkOutline,
  flashOutline,
  giftOutline,
  receiptOutline,
  refreshOutline,
  helpCircleOutline,
  arrowDownOutline,
  arrowUpOutline,
  sparklesOutline,
  cardOutline,
  checkmarkOutline,
  shareSocialOutline,
  cartOutline,
  arrowForward,
  starOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { PintuPocketService, PocketTransaction } from '../../services/pintu-pocket.service';

@Component({
  selector: 'app-pintu-pocket',
  templateUrl: './pintu-pocket.page.html',
  styleUrls: ['./pintu-pocket.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent
  ]
})
export class PintuPocketPage implements OnInit {
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  public pocketService = inject(PintuPocketService);

  readonly balance$ = this.pocketService.balance$;
  readonly transactions$ = this.pocketService.transactions$;

  // Passbook Filter State: all | earned | spent
  activeFilter: 'all' | 'earned' | 'spent' = 'all';

  constructor() {
    addIcons({
      arrowBackOutline,
      walletOutline,
      checkmarkCircle,
      shieldCheckmarkOutline,
      flashOutline,
      giftOutline,
      receiptOutline,
      refreshOutline,
      helpCircleOutline,
      arrowDownOutline,
      arrowUpOutline,
      sparklesOutline,
      cardOutline,
      checkmarkOutline,
      shareSocialOutline,
      cartOutline,
      arrowForward,
      starOutline,
      informationCircleOutline
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.navCtrl.back();
  }

  handleRefresh(event: any): void {
    setTimeout(() => {
      event.target.complete();
    }, 600);
  }

  goToReferral(): void {
    this.router.navigate(['/layout/referral']);
  }

  goToExplore(): void {
    this.router.navigate(['/layout/home']);
  }

  filterTransactions(transactions: PocketTransaction[] | null): PocketTransaction[] {
    if (!transactions) return [];
    if (this.activeFilter === 'all') return transactions;
    if (this.activeFilter === 'earned') {
      return transactions.filter(t => t.type === 'credit');
    }
    if (this.activeFilter === 'spent') {
      return transactions.filter(t => t.type === 'debit');
    }
    return transactions;
  }

  formatDate(isoStr: string): string {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(isoStr: string): string {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}
