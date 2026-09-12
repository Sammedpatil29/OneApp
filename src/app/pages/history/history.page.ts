import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownOutline,
  receiptOutline,
  timeOutline,
  chevronForward,
  flashOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  bicycleOutline,
  alertCircleOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { HistoryService } from 'src/app/components/history/history.service';
import { of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonIcon
  ]
})
export class HistoryPage implements OnInit {
  history: any[] = [];
  filteredHistory: any[] = [];
  selectedCategory: 'all' | 'grocery' | 'ride' = 'all';
  isLoading: boolean = false;
  token: string = '';

  goBack() {
    this.navCtrl.back();
  }

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private historyService: HistoryService
  ) {
    addIcons({
      arrowDownOutline,
      receiptOutline,
      timeOutline,
      chevronForward,
      flashOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      bicycleOutline,
      alertCircleOutline,
      arrowBackOutline
    });
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';
    this.getHistory();
  }

  getHistory() {
    this.isLoading = true;
    const params = { type: 'all' };

    this.historyService.getHistory(params, this.token).pipe(
      timeout(8000),
      catchError(err => {
        console.warn('History fetch error or timeout:', err);
        return of({ data: [] });
      })
    ).subscribe({
      next: (res: any) => {
        this.history = res?.data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.history = [];
        this.isLoading = false;
      }
    });
  }

  handleRefresh(event: any) {
    const params = { type: 'all' };
    this.historyService.getHistory(params, this.token).subscribe({
      next: (res: any) => {
        this.history = res?.data || [];
        this.applyFilter();
        event.target.complete();
      },
      error: () => event.target.complete()
    });
  }

  setCategory(cat: 'all' | 'grocery' | 'ride') {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedCategory === 'all') {
      this.filteredHistory = this.history;
    } else if (this.selectedCategory === 'grocery') {
      this.filteredHistory = this.history.filter(item => !this.isRideType(item.type));
    } else if (this.selectedCategory === 'ride') {
      this.filteredHistory = this.history.filter(item => this.isRideType(item.type));
    }
  }

  isRideType(type: string): boolean {
    if (!type) return false;
    const t = type.toLowerCase();
    return t.includes('ride') || t.includes('cab') || t.includes('bike') || t.includes('auto') || t.includes('commute');
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-muted';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'done' || s === 'resolved') {
      return 'status-success';
    }
    if (s === 'pending' || s === 'paid' || s === 'active' || s === 'processing' || s === 'on_the_way') {
      return 'status-pending';
    }
    if (s === 'cancelled' || s === 'failed' || s === 'rejected') {
      return 'status-danger';
    }
    return 'status-muted';
  }

  getStatusIcon(status: string): string {
    if (!status) return 'time-outline';
    const s = status.toLowerCase();
    if (s === 'completed' || s === 'delivered' || s === 'done' || s === 'resolved') {
      return 'checkmark-circle-outline';
    }
    if (s === 'cancelled' || s === 'failed' || s === 'rejected') {
      return 'close-circle-outline';
    }
    return 'time-outline';
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    const s = status.toLowerCase();
    if (s === 'paid') return 'Upcoming';
    if (s === 'on_the_way') return 'On the way';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  openDetails(item: any) {
    if (!item) return;
    if (item.type === 'grocery') {
      this.router.navigate([`/layout/grocery-layout/grocery-order-details/${item.id || item.orderId}`], {
        state: { from: 'history' }
      });
    } else if (item.type === 'dineout') {
      this.router.navigate([`/layout/dineout-layout/dineout-track/${item.id}`], {
        state: { from: 'history' }
      });
    } else {
      this.router.navigate(['/layout/rides/tracking'], {
        state: { orderId: item.id || item.orderId }
      });
    }
  }

  goToHome() {
    this.router.navigate(['/layout/home']);
  }
}
