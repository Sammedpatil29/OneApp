import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';

export interface SplashOfferHighlight {
  icon: string;
  title: string;
  subtitle: string;
}

export interface SplashOfferBanner {
  id?: string | number;
  tag: string;
  headline: string;
  subheadline: string;
  discountBadge?: string;
  promoCode?: string;
  promoTerms?: string;
  imageUrl?: string;
  highlights?: SplashOfferHighlight[];
  gradientTheme?: 'violet' | 'emerald' | 'amber' | 'crimson';
  route?: string;
}

@Component({
  selector: 'app-custom-splash',
  templateUrl: './custom-splash.component.html',
  styleUrls: ['./custom-splash.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CustomSplashComponent implements OnInit, OnDestroy {
  @Output() dismiss = new EventEmitter<void>();

  private commonService = inject(CommonService);

  /**
   * Built-in promotional offer campaigns.
   * Easily customize, edit, or extend these campaigns to feature any offers, deals, or announcements!
   */
  readonly promotionalCampaigns: SplashOfferBanner[] = [
    {
      id: 1,
      tag: '⚡ MEGA SAVINGS FEST',
      headline: 'Flat 50% OFF + Instant Delivery',
      subheadline: 'Groceries, Fresh Food, Medicines & Daily Rides',
      discountBadge: 'UP TO 50% OFF',
      promoCode: 'PINTU50',
      promoTerms: 'Auto-applied on first 3 orders • Min order ₹149',
      gradientTheme: 'violet',
      highlights: [
        { icon: '⚡', title: '10-Min Delivery', subtitle: 'Doorstep Service' },
        { icon: '👛', title: '₹50 Bonus', subtitle: 'In Pintu Pocket' },
        { icon: '🛡️', title: '100% Genuine', subtitle: 'Verified Quality' }
      ]
    },
    {
      id: 2,
      tag: '🎁 WELCOME REWARDS',
      headline: 'Get ₹50 Free In Pintu Pocket',
      subheadline: 'Use instantly across Rides, Groceries & Pharmacy',
      discountBadge: 'FREE ₹50 REWARD',
      promoCode: 'WELCOME50',
      promoTerms: 'Instant wallet cashback • 100% usable on orders',
      gradientTheme: 'emerald',
      highlights: [
        { icon: '🛵', title: 'Instant Rides', subtitle: 'Lowest Auto & Cab' },
        { icon: '💊', title: 'Medicines', subtitle: 'Flat 15% OFF + Rx' },
        { icon: '🛒', title: 'Supermarket', subtitle: 'Fresh Produce' }
      ]
    },
    {
      id: 3,
      tag: '🔥 SUPER VALUE DEALS',
      headline: 'Free Delivery On All Essentials',
      subheadline: 'Exclusive discounts on top restaurants and daily groceries',
      discountBadge: 'FREE DELIVERY',
      promoCode: 'FREESHIP',
      promoTerms: 'Zero delivery fee on all orders today',
      gradientTheme: 'amber',
      highlights: [
        { icon: '🍔', title: 'Dineout', subtitle: 'Table Booking Deals' },
        { icon: '🏠', title: 'Properties', subtitle: 'Verified Local Rentals' },
        { icon: '🎟️', title: 'Local Events', subtitle: 'Shows & Tickets' }
      ]
    }
  ];

  activeBanner: SplashOfferBanner = this.promotionalCampaigns[0];
  isImageLoaded: boolean = false;
  hasImageError: boolean = false;

  // Loader state & animated progress
  loadingProgress: number = 20;
  loadingMessages: string[] = [
    'Loading today\'s best offers...',
    'Checking exclusive discounts...',
    'Preparing your super-app...',
    'Almost ready...'
  ];
  currentMessageIndex: number = 0;
  private progressInterval: any;
  private messageInterval: any;

  ngOnInit() {
    this.initCachedBanner();
    this.fetchRemoteSplashBanners();
    this.startLoaderAnimation();
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.progressInterval) clearInterval(this.progressInterval);
    if (this.messageInterval) clearInterval(this.messageInterval);
  }

  /**
   * Load cached banner from localStorage if available for immediate zero-latency rendering.
   */
  private initCachedBanner() {
    try {
      const cached = localStorage.getItem('pintu_cached_splash_banner');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.imageUrl || parsed.headline)) {
          this.activeBanner = { ...this.activeBanner, ...parsed };
          return;
        }
      }
    } catch {
      // Ignore cache read errors
    }

    // Default to rotating campaign based on current day of week
    const dayIndex = new Date().getDay() % this.promotionalCampaigns.length;
    this.activeBanner = this.promotionalCampaigns[dayIndex];
  }

  /**
   * Fetch active splash promotional banners from the backend API.
   * If a banner with placement 'splash' exists, it takes precedence.
   */
  private fetchRemoteSplashBanners() {
    this.commonService.getActiveBanners('splash').subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(items) && items.length > 0) {
          this.applyBackendBanner(items[0]);
        } else {
          // Fallback to hometop banners if no dedicated splash banner configured yet
          this.fetchHometopFallback();
        }
      },
      error: () => {
        this.fetchHometopFallback();
      }
    });
  }

  private fetchHometopFallback() {
    this.commonService.getActiveBanners('hometop').subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const itemWithImage = items.find((b: any) => b.img && String(b.img).trim());
          if (itemWithImage) {
            this.applyBackendBanner(itemWithImage);
          }
        }
      },
      error: () => {
        // Keep active promotional campaign
      }
    });
  }

  private applyBackendBanner(item: any) {
    if (!item) return;

    const img = item.img ? String(item.img).trim() : '';
    const updated: SplashOfferBanner = {
      ...this.activeBanner,
      id: item.id || this.activeBanner.id,
      headline: item.title && item.title.trim() ? item.title : this.activeBanner.headline,
      imageUrl: img || this.activeBanner.imageUrl,
      route: item.route || this.activeBanner.route
    };

    this.activeBanner = updated;
    this.hasImageError = false;

    // Cache in localStorage for subsequent instant loads
    try {
      localStorage.setItem('pintu_cached_splash_banner', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }

  private startLoaderAnimation() {
    // Top progress bar fill animation
    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 95) {
        this.loadingProgress += Math.floor(Math.random() * 8) + 4;
        if (this.loadingProgress > 95) this.loadingProgress = 95;
      }
    }, 110);

    // Dynamic loader status text cycle
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
    }, 650);
  }

  onImageLoaded() {
    this.isImageLoaded = true;
  }

  onImageError() {
    this.hasImageError = true;
  }

  onSkipClick(event?: Event) {
    if (event) event.stopPropagation();
    this.dismiss.emit();
  }
}
