import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  location,
  chevronDown,
  arrowForward,
  arrowForwardOutline,
  flashOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  chatbubbleEllipsesOutline,
  arrowDownOutline,
  headsetOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { ProfileService } from 'src/app/services/profile.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { environment } from 'src/environments/environment';

export interface BannerItem {
  id?: number | string;
  img?: string;
  route?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  bgGradient?: string;
  type?: string;
  term?: string;
  is_active?: boolean;
}

export interface ServiceItem {
  id?: number | string;
  title: string;
  subtitle?: string;
  img?: string;
  offers?: string;
  width?: string;
  route?: string;
  category?: string;
  status?: string;
  hasImgError?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonIcon,
    FooterComponent
  ]
})
export class HomePage implements OnInit {
  headerBg = 'rgba(248, 250, 252, 0.94)';
  displayLocationName: string = 'Select Location';
  profileAvatar: string = '';
  userInitials: string = 'P';
  orders: any[] = [];
  token: string = '';
  isLoadingServices: boolean = true;

  banners: BannerItem[] = [
    {
      id: 1,
      badge: '⚡ 10-15 MINS',
      badgeBg: 'rgba(250, 204, 21, 0.25)',
      badgeColor: '#fef08a',
      title: 'Instant Grocery Delivery',
      subtitle: 'Daily essentials delivered in 10-15 mins with flat ₹100 off.',
      bgGradient: 'linear-gradient(135deg, #2e0854 0%, #1e1b4b 50%, #4a044e 100%)',
      route: '/layout/grocery-layout'
    },
    {
      id: 2,
      badge: '🛵 ZERO SURGE',
      badgeBg: 'rgba(56, 189, 248, 0.25)',
      badgeColor: '#7dd3fc',
      title: 'Daily Commute & Cabs',
      subtitle: 'Fast bike taxis, autos & cabs at transparent daily flat rates.',
      bgGradient: 'linear-gradient(135deg, #091e3a 0%, #082f49 50%, #1e1b4b 100%)',
      route: '/layout/rides'
    },
    {
      id: 3,
      badge: '🥦 100% FARM FRESH',
      badgeBg: 'rgba(52, 211, 153, 0.25)',
      badgeColor: '#a7f3d0',
      title: 'Fresh Farm Harvest',
      subtitle: 'Handpicked daily fruits & vegetables with zero compromise.',
      bgGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #134e4a 100%)',
      route: '/layout/grocery-layout'
    }
  ];

  bottomBanners: BannerItem[] = [
    {
      id: 'bottom-1',
      badge: '🎁 REFER & EARN',
      badgeBg: 'rgba(250, 204, 21, 0.25)',
      badgeColor: '#fef08a',
      title: 'Earn ₹50 Instant Cash',
      subtitle: 'Invite friends to Pintu. Both get ₹50 on their 1st delivery!',
      bgGradient: 'linear-gradient(135deg, #2e0854 0%, #1e1b4b 60%, #4a044e 100%)',
      route: '/layout/referral'
    },
    {
      id: 'bottom-2',
      badge: '🥦 FRESH HARVEST',
      badgeBg: 'rgba(52, 211, 153, 0.25)',
      badgeColor: '#a7f3d0',
      title: 'Farm Fresh Produce Daily',
      subtitle: 'Handpicked daily fruits & vegetables with 10-15 min delivery',
      bgGradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #0f766e 100%)',
      route: '/layout/grocery-layout'
    }
  ];

  allServices: ServiceItem[] = [];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private locationService: LocationService,
    private profileService: ProfileService,
    private commonService: CommonService
  ) {
    addIcons({
      location,
      chevronDown,
      arrowForward,
      arrowForwardOutline,
      flashOutline,
      shieldCheckmarkOutline,
      sparklesOutline,
      chatbubbleEllipsesOutline,
      arrowDownOutline,
      headsetOutline
    });
  }

  goToSupport() {
    this.router.navigate(['/layout/support']);
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';

    this.locationService.address$.subscribe((addr: string) => {
      if (addr && addr.trim()) {
        this.displayLocationName = addr;
      }
    });

    this.locationService.city$.subscribe((city: string) => {
      if (city && city.trim() && this.displayLocationName === 'Select Location') {
        this.displayLocationName = city;
      }
    });

    try {
      this.locationService.getCurrentPosition();
    } catch (e) {
      console.warn('Could not auto-fetch current GPS position', e);
    }

    if (this.token) {
      this.loadUserProfile();
      this.loadHomeData();
      this.loadActiveOrders();
    } else {
      this.loadHomeData();
    }
  }

  onScroll(event: any) {
    const scrollTop = event?.detail?.scrollTop || 0;
    if (scrollTop > 20) {
      this.headerBg = 'rgba(255, 255, 255, 0.98)';
    } else {
      this.headerBg = 'rgba(248, 250, 252, 0.94)';
    }
  }

  handleRefresh(event: any) {
    if (this.token) {
      this.loadUserProfile();
      this.loadHomeData();
      this.loadActiveOrders();
    } else {
      this.loadHomeData();
    }
    setTimeout(() => {
      event.target.complete();
    }, 800);
  }

  loadUserProfile() {
    this.profileService.getProfileData(this.token).subscribe({
      next: (res: any) => {
        const user = res?.user || res?.data || res || {};
        const name = user.first_name || user.name || '';
        this.userInitials = name.charAt(0).toUpperCase() || 'P';
        this.profileAvatar = user.profile_image || '';
      },
      error: () => {}
    });
  }

  loadHomeData() {
    this.isLoadingServices = true;
    this.commonService.getHomeData(this.token).subscribe({
      next: (res: any) => {
        const data = res?.data || res || {};
        const backendBanners = data?.banners || [];
        if (Array.isArray(backendBanners) && backendBanners.length > 0) {
          const activeBanners = backendBanners.filter((b: any) => b.is_active !== false);
          if (activeBanners.length > 0) {
            this.banners = activeBanners;
            if (activeBanners.length > 2) {
              this.bottomBanners = activeBanners.slice(1, 3);
            }
          }
        }
        const services = data?.services || (Array.isArray(data) ? data : []);
        if (Array.isArray(services) && services.length > 0) {
          const active = services.filter((s: any) => s.status === 'active' || !s.status);
          if (active.length > 0) {
            this.allServices = active;
          }
        }
        this.isLoadingServices = false;
      },
      error: () => {
        // Graceful fallback to location service active services
        this.locationService.getData().subscribe({
          next: (fallbackRes: any) => {
            const fallbackData = fallbackRes?.data || fallbackRes || [];
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              const active = fallbackData.filter((s: any) => s.status === 'active' || !s.status);
              if (active.length > 0) {
                this.allServices = active;
              }
            }
            this.isLoadingServices = false;
          },
          error: () => {
            this.isLoadingServices = false;
            if (this.allServices.length === 0) {
              this.allServices = [
                {
                  id: 1,
                  title: 'Pintu Grocery',
                  subtitle: '10-15 Min Instant Delivery',
                  offers: '⚡ 10-15 MINS',
                  img: '',
                  category: 'grocery',
                  route: '/layout/grocery-layout'
                },
                {
                  id: 2,
                  title: 'Daily Commute',
                  subtitle: 'Bike, Auto & Cabs',
                  offers: 'ZERO SURGE',
                  img: '',
                  category: 'rides',
                  route: '/layout/rides'
                }
              ];
            }
          }
        });
      }
    });
  }

  loadActiveOrders() {
    this.commonService.getActiveOrders(this.token).subscribe({
      next: (res: any) => {
        this.orders = res?.data || (Array.isArray(res) ? res : []);
      },
      error: () => {
        this.orders = [];
      }
    });
  }

  /**
   * User-defined count-based Bento layout rules:
   * - 1 service  -> 100% width (wide)
   * - 2 services -> 50% width 2 in inline (normal)
   * - > 2 services -> dynamic bento mosaic
   */
  getMosaicTileType(index: number, total: number): 'mosaic-tile-tall' | 'mosaic-tile-normal' | 'mosaic-tile-wide' {
    // 1 service: 100% width
    if (total === 1) {
      return 'mosaic-tile-wide';
    }

    // 2 services: 50% width, 2 in inline
    if (total === 2) {
      return 'mosaic-tile-normal';
    }

    // More than 2 services: apply Bento to real data
    if (total === 3) {
      return index === 0 ? 'mosaic-tile-tall' : 'mosaic-tile-normal';
    }

    if (total === 4) {
      if (index === 0) return 'mosaic-tile-tall';
      if (index === 1 || index === 2) return 'mosaic-tile-normal';
      return 'mosaic-tile-wide';
    }

    if (total === 5) {
      return index === 0 ? 'mosaic-tile-tall' : 'mosaic-tile-normal';
    }

    if (total === 6) {
      if (index === 0) return 'mosaic-tile-tall';
      if (index === 5) return 'mosaic-tile-wide';
      return 'mosaic-tile-normal';
    }

    // 7 or more: alternating interlocking bento rhythm
    const mod = index % 7;
    if (mod === 0) return 'mosaic-tile-tall';
    if (mod === 3 || mod === 6) return 'mosaic-tile-wide';
    return 'mosaic-tile-normal';
  }

  isImageValid(service: ServiceItem): boolean {
    if (!service?.img) return false;
    const img = String(service.img).trim();
    if (!img || img.includes('example.com') || img === 'img.jpg' || img === 'null' || img === 'undefined') {
      return false;
    }
    return true;
  }

  getServiceImgUrl(service: ServiceItem): string {
    if (!service?.img) return '';
    const img = String(service.img).trim();
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('assets/')) {
      return img;
    }
    if (img.startsWith('/')) {
      return `${environment.apiUrl}${img}`;
    }
    return `${environment.apiUrl}/${img}`;
  }

  hasOffer(service: ServiceItem): boolean {
    if (!service?.offers) return false;
    const o = String(service.offers).trim().toLowerCase();
    return o !== '' && o !== 'nothing' && o !== 'null' && o !== 'undefined';
  }

  getServiceIcon(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    const cat = (service?.category || '').toLowerCase();

    if (title.includes('grocery') || title.includes('vegitables') || title.includes('vegetable') || title.includes('milk') || cat.includes('daily')) {
      return '🥦';
    }
    if (title.includes('ride') || title.includes('cab') || title.includes('auto') || title.includes('commute')) {
      return '🛵';
    }
    if (title.includes('food') || title.includes('dineout') || title.includes('restaurant') || title.includes('dining')) {
      return '🍔';
    }
    if (title.includes('doctor') || title.includes('medicine') || title.includes('lab') || cat.includes('health')) {
      return '💊';
    }
    if (title.includes('laundry')) {
      return '🧺';
    }
    if (title.includes('history') || title.includes('order') || title.includes('track')) {
      return '📦';
    }
    return '⚡';
  }

  getServiceBg(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    if (title.includes('grocery') || title.includes('vegitables')) return 'rgba(16, 185, 129, 0.12)';
    if (title.includes('ride') || title.includes('cab') || title.includes('auto')) return 'rgba(59, 130, 246, 0.12)';
    if (title.includes('food') || title.includes('dineout') || title.includes('dining')) return 'rgba(249, 115, 22, 0.12)';
    if (title.includes('doctor') || title.includes('medicine')) return 'rgba(168, 85, 247, 0.12)';
    if (title.includes('history') || title.includes('track')) return 'rgba(160, 0, 226, 0.12)';
    return 'rgba(160, 0, 226, 0.1)';
  }

  getServiceCardGradient(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    if (title.includes('grocery') || title.includes('vegitables')) {
      return 'linear-gradient(155deg, #ffffff 0%, #f0fdf4 100%)';
    }
    if (title.includes('ride') || title.includes('cab') || title.includes('auto')) {
      return 'linear-gradient(155deg, #ffffff 0%, #eff6ff 100%)';
    }
    if (title.includes('food') || title.includes('dineout') || title.includes('dining')) {
      return 'linear-gradient(155deg, #ffffff 0%, #fff7ed 100%)';
    }
    if (title.includes('doctor') || title.includes('medicine')) {
      return 'linear-gradient(155deg, #ffffff 0%, #fdf4ff 100%)';
    }
    if (title.includes('history') || title.includes('track')) {
      return 'linear-gradient(155deg, #ffffff 0%, #faf5ff 100%)';
    }
    return '#ffffff';
  }

  navigateToService(service: ServiceItem) {
    if (!service) return;
    const route = (service.route || '').trim();

    if (route.startsWith('http://') || route.startsWith('https://')) {
      window.open(route, '_system');
      return;
    }

    if (route === 'grocery' || route === '/layout/grocery' || route === '/layout/grocery-layout' || route === '/grocery') {
      this.router.navigate(['/layout/grocery-layout']);
      return;
    }

    if (route === 'rides' || route === 'ride' || route === 'cab' || route === '/layout/rides' || route === '/layout/ride') {
      this.router.navigate(['/layout/rides']);
      return;
    }

    if (route === 'food' || route === 'dineout' || route === '/layout/dineout-layout') {
      this.router.navigate(['/layout/dineout-layout']);
      return;
    }

    if (route === 'history' || route === '/layout/history') {
      this.router.navigate(['/layout/history']);
      return;
    }

    if (route.startsWith('/')) {
      this.router.navigate([route]);
    } else if (route) {
      this.router.navigate([`/layout/${route}`]);
    } else {
      const title = (service.title || '').toLowerCase();
      if (title.includes('grocery') || title.includes('vegitables') || title.includes('milk')) {
        this.router.navigate(['/layout/grocery-layout']);
      } else if (title.includes('ride') || title.includes('cab') || title.includes('auto') || title.includes('commute')) {
        this.router.navigate(['/layout/rides']);
      } else if (title.includes('dineout') || title.includes('food') || title.includes('dining')) {
        this.router.navigate(['/layout/dineout-layout']);
      } else if (title.includes('history') || title.includes('order') || title.includes('track')) {
        this.router.navigate(['/layout/history']);
      }
    }
  }

  navigateToBanner(banner: BannerItem) {
    if (!banner) return;
    const route = (banner.route || '').trim();
    if (!route) return;

    if (route.startsWith('http://') || route.startsWith('https://')) {
      window.open(route, '_system');
      return;
    }

    if (route === 'grocery' || route === '/layout/grocery' || route === '/layout/grocery-layout' || route === '/grocery') {
      this.router.navigate(['/layout/grocery-layout']);
      return;
    }

    if (route === 'rides' || route === 'ride' || route === 'cab' || route === '/layout/rides' || route === '/layout/ride') {
      this.router.navigate(['/layout/rides']);
      return;
    }

    if (route === 'food' || route === 'dineout' || route === '/layout/dineout-layout') {
      this.router.navigate(['/layout/dineout-layout']);
      return;
    }

    if (route.startsWith('/')) {
      this.router.navigate([route]);
    } else {
      this.router.navigate([`/layout/${route}`]);
    }
  }

  getBannerImgUrl(banner: BannerItem): string {
    if (!banner?.img) return '';
    const img = String(banner.img).trim();
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('assets/')) {
      return img;
    }
    if (img.startsWith('/')) {
      return `${environment.apiUrl}${img}`;
    }
    return `${environment.apiUrl}/${img}`;
  }

  isBannerImageValid(banner: BannerItem): boolean {
    if (!banner?.img) return false;
    const img = String(banner.img).trim();
    if (!img || img.includes('example.com') || img === 'null' || img === 'undefined') {
      return false;
    }
    return true;
  }

  openLocation() {
    this.router.navigate(['/layout/address-list']);
  }

  goToProfile() {
    this.router.navigate(['/layout/profile']);
  }

  goToOrderDetails(orderId: any) {
    if (orderId) {
      this.router.navigate([`/layout/grocery-layout/grocery-order-details/${orderId}`]);
    } else {
      this.router.navigate(['/layout/history']);
    }
  }
}
