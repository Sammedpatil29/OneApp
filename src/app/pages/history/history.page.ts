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
  IonIcon,
  IonModal
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
  arrowBackOutline,
  optionsOutline,
  closeOutline,
  refreshOutline,
  checkmark,
  closeCircle
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
    IonIcon,
    IonModal
  ]
})
export class HistoryPage implements OnInit {
  history: any[] = [];
  filteredHistory: any[] = [];
  isLoading: boolean = false;
  token: string = '';

  // Top Tabs: 'active' | 'completed'
  activeTab: 'active' | 'completed' = 'active';

  // Filter Modal & Filter Options
  isFilterModalOpen: boolean = false;
  filterCategory: string = 'all';     // 'all' | 'grocery' | 'ride' | 'dineout' | 'event'
  filterStatus: string = 'all';       // 'all' | 'in_progress' | 'on_the_way' | 'delivered' | 'cancelled'
  filterTimeframe: string = 'all';    // 'all' | 'today' | '7days' | '30days'
  filterSort: string = 'newest';      // 'newest' | 'oldest' | 'price_high' | 'price_low'
  filterPriceRange: string = 'all';   // 'all' | 'under_200' | '200_500' | '500_1000' | 'above_1000'

  // Backwards compatibility getter
  get selectedCategory(): string {
    return this.filterCategory;
  }

  get activeOrdersCount(): number {
    return this.history.filter(item => this.isActiveOrder(item)).length;
  }

  get completedOrdersCount(): number {
    return this.history.filter(item => this.isCompletedOrder(item)).length;
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filterCategory !== 'all') count++;
    if (this.filterStatus !== 'all') count++;
    if (this.filterTimeframe !== 'all') count++;
    if (this.filterSort !== 'newest') count++;
    if (this.filterPriceRange !== 'all') count++;
    return count;
  }

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
      arrowBackOutline,
      optionsOutline,
      closeOutline,
      refreshOutline,
      checkmark,
      closeCircle
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
        // Intelligently default to active tab if user has active orders; else default to completed
        if (this.activeOrdersCount > 0) {
          this.activeTab = 'active';
        } else {
          this.activeTab = 'completed';
        }
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

  setActiveTab(tab: 'active' | 'completed') {
    this.activeTab = tab;
    // Reset specific status filter if it doesn't match the new tab
    if (this.filterStatus !== 'all') {
      this.filterStatus = 'all';
    }
    this.applyFilter();
  }

  setCategory(cat: string) {
    this.filterCategory = cat;
    this.applyFilter();
  }

  // Filter Modal Controls
  openFilterModal() {
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  applyFilters() {
    this.applyFilter();
    this.closeFilterModal();
  }

  clearAllFilters() {
    this.filterCategory = 'all';
    this.filterStatus = 'all';
    this.filterTimeframe = 'all';
    this.filterSort = 'newest';
    this.filterPriceRange = 'all';
    this.applyFilter();
  }

  isActiveOrder(item: any): boolean {
    if (!item || !item.status) return false;
    const s = (item.status || '').toLowerCase().trim();
    const terminatedStatuses = [
      'completed',
      'delivered',
      'done',
      'resolved',
      'cancelled',
      'failed',
      'rejected'
    ];
    return !terminatedStatuses.includes(s);
  }

  isCompletedOrder(item: any): boolean {
    return !this.isActiveOrder(item);
  }

  applyFilter() {
    let list = [...this.history];

    // 1. Tab filter: Active vs Completed
    if (this.activeTab === 'active') {
      list = list.filter(item => this.isActiveOrder(item));
    } else if (this.activeTab === 'completed') {
      list = list.filter(item => this.isCompletedOrder(item));
    }

    // 2. Category / Service Type
    if (this.filterCategory !== 'all') {
      if (this.filterCategory === 'ride') {
        list = list.filter(item => this.isRideType(item.type));
      } else if (this.filterCategory === 'grocery') {
        list = list.filter(item => (item.type || '').toLowerCase() === 'grocery');
      } else if (this.filterCategory === 'dineout') {
        list = list.filter(item => (item.type || '').toLowerCase() === 'dineout');
      } else if (this.filterCategory === 'event') {
        list = list.filter(item => (item.type || '').toLowerCase() === 'event');
      }
    }

    // 3. Status filter
    if (this.filterStatus !== 'all') {
      const s = this.filterStatus.toLowerCase();
      if (s === 'delivered') {
        list = list.filter(item =>
          ['completed', 'delivered', 'done', 'resolved'].includes((item.status || '').toLowerCase())
        );
      } else if (s === 'cancelled') {
        list = list.filter(item =>
          ['cancelled', 'failed', 'rejected'].includes((item.status || '').toLowerCase())
        );
      } else if (s === 'on_the_way') {
        list = list.filter(item =>
          (item.status || '').toLowerCase().includes('way') || (item.status || '').toLowerCase() === 'dispatched'
        );
      } else if (s === 'in_progress') {
        list = list.filter(item =>
          ['pending', 'paid', 'processing', 'preparing', 'placed', 'accepted'].includes((item.status || '').toLowerCase())
        );
      }
    }

    // 4. Timeframe filter
    if (this.filterTimeframe !== 'all') {
      const now = new Date().getTime();
      list = list.filter(item => {
        if (!item.created_at) return true;
        const itemTime = new Date(item.created_at).getTime();
        const diffHours = (now - itemTime) / (1000 * 60 * 60);

        if (this.filterTimeframe === 'today') {
          return diffHours <= 24;
        } else if (this.filterTimeframe === '7days') {
          return diffHours <= 24 * 7;
        } else if (this.filterTimeframe === '30days') {
          return diffHours <= 24 * 30;
        }
        return true;
      });
    }

    // 5. Price range filter
    if (this.filterPriceRange !== 'all') {
      list = list.filter(item => {
        const cost = Number(item.finalCost) || 0;
        if (this.filterPriceRange === 'under_200') return cost < 200;
        if (this.filterPriceRange === '200_500') return cost >= 200 && cost <= 500;
        if (this.filterPriceRange === '500_1000') return cost > 500 && cost <= 1000;
        if (this.filterPriceRange === 'above_1000') return cost > 1000;
        return true;
      });
    }

    // 6. Sort
    if (this.filterSort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (this.filterSort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (this.filterSort === 'price_high') {
      list.sort((a, b) => (Number(b.finalCost) || 0) - (Number(a.finalCost) || 0));
    } else if (this.filterSort === 'price_low') {
      list.sort((a, b) => (Number(a.finalCost) || 0) - (Number(b.finalCost) || 0));
    }

    this.filteredHistory = list;
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
