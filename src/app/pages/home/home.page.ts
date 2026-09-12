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
  chevronForward,
  arrowForward,
  arrowForwardOutline,
  flashOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  chatbubbleEllipsesOutline,
  arrowDownOutline,
  headsetOutline,
  alertCircleOutline,
  moonOutline,
  navigateCircleOutline,
  mapOutline,
  refreshOutline,
  locationOutline
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
  headerBg: string = 'rgba(255, 255, 255, 0)';
  headerOpacity: number = 0;
  isPastBanner: boolean = false;
  isScrolled: boolean = false;
  private cachedBannerHeight: number = 0;
  displayLocationName: string = 'Select Location';
  profileAvatar: string = '';
  userInitials: string = 'P';
  orders: any[] = [];
  token: string = '';
  isLoadingServices: boolean = true;

  // Service Area & Geofencing State
  isLocationPermissionDenied: boolean = false;
  isOutOfServiceArea: boolean = false;
  nearestServiceArea: { id?: string; cityName: string; distanceKm: number } | null = null;
  isAreaClosed: boolean = false;
  closedAreaCity: string = '';
  areaClosureMessage: string = '';
  currentCoords: { lat: number; lng: number } | null = null;

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
    addIcons({location,chevronDown,arrowForward,alertCircleOutline,chevronForward,moonOutline,refreshOutline,locationOutline,navigateCircleOutline,mapOutline,arrowForwardOutline,flashOutline,shieldCheckmarkOutline,sparklesOutline,chatbubbleEllipsesOutline,arrowDownOutline,headsetOutline});
  }

  goToSupport() {
    this.router.navigate(['/layout/support']);
  }

  async ngOnInit() {
    this.token = (await this.authService.getToken()) || '';

    // Load saved location from storage if present
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed?.area) {
          this.displayLocationName = parsed.area;
        } else if (parsed?.address) {
          this.displayLocationName = parsed.address.split(',')[0];
        }
      } catch (e) {}
    }

    this.locationService.address$.subscribe((addr: string) => {
      if (addr && addr.trim()) {
        this.displayLocationName = addr.split(',')[0];
      }
    });

    this.locationService.city$.subscribe((city: string) => {
      if (city && city.trim() && (this.displayLocationName === 'Select Location' || !this.displayLocationName)) {
        this.displayLocationName = city;
      }
    });

    try {
      this.locationService.getCurrentPosition();
    } catch (e) {
      console.warn('Could not auto-fetch current GPS position', e);
    }
    // Check location permission and evaluate service area
    this.initLocationAndServiceArea();

    if (this.token) {
      this.loadUserProfile();
      this.loadHomeData();
      this.loadActiveOrders();
    } else {
      this.loadHomeData();
    }
  }

  async initLocationAndServiceArea() {
    try {
      const perm = await this.locationService.checkLocationPermission();
      if (perm.location === 'denied') {
        this.isLocationPermissionDenied = true;
      } else {
        this.isLocationPermissionDenied = false;
      }
    } catch (e) {
      this.isLocationPermissionDenied = false;
    }

    let lat: number | null = null;
    let lng: number | null = null;

    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed?.lat && parsed?.lng) {
          lat = parseFloat(parsed.lat);
          lng = parseFloat(parsed.lng);
        }
      } catch (e) {}
    }

    if (!lat || !lng) {
      try {
        const pos = await this.locationService.getCurrentPosition();
        if (pos?.coords?.coords) {
          lat = pos.coords.coords.latitude;
          lng = pos.coords.coords.longitude;
          this.isLocationPermissionDenied = false;
        }
      } catch (e) {
        console.warn('Could not auto-fetch current GPS position', e);
      }
    }

    if (lat && lng) {
      this.currentCoords = { lat, lng };
      this.evaluateServiceArea(lat, lng);
    }
  }

  evaluateServiceArea(lat: number, lng: number) {
    this.locationService.checkLocationInServiceArea(lat, lng).subscribe({
      next: (res: any) => {
        if (res?.success) {
          if (res.inServiceArea) {
            this.isOutOfServiceArea = false;
            this.nearestServiceArea = null;

            if (res.area?.isOffline) {
              this.isAreaClosed = true;
              this.closedAreaCity = res.area.cityName || this.displayLocationName || 'Athani';
              this.areaClosureMessage = res.area.offlineMessage || 'Operations in this city are temporarily offline. We will resume shortly.';
            } else {
              this.isAreaClosed = false;
            }
          } else {
            this.isOutOfServiceArea = true;
            this.isAreaClosed = false;
            this.nearestServiceArea = res.nearestArea || null;
          }
        }
      },
      error: (err: any) => {
        console.warn('Could not check service area:', err);
      }
    });
  }

  async requestLocationPermission() {
    const perm = await this.locationService.requestLocationPermission();
    if (perm.location === 'granted') {
      this.isLocationPermissionDenied = false;
      const pos = await this.locationService.getCurrentPosition();
      if (pos?.coords?.coords) {
        const lat = pos.coords.coords.latitude;
        const lng = pos.coords.coords.longitude;
        this.currentCoords = { lat, lng };
        this.evaluateServiceArea(lat, lng);
      }
    } else {
      this.isLocationPermissionDenied = true;
    }
  }

  async recheckLocationAndServiceArea() {
    try {
      const pos = await this.locationService.getCurrentPosition();
      if (pos?.coords?.coords) {
        this.isLocationPermissionDenied = false;
        const lat = pos.coords.coords.latitude;
        const lng = pos.coords.coords.longitude;
        this.currentCoords = { lat, lng };
        this.evaluateServiceArea(lat, lng);
      } else if (this.currentCoords) {
        this.evaluateServiceArea(this.currentCoords.lat, this.currentCoords.lng);
      }
    } catch (e) {
      if (this.currentCoords) {
        this.evaluateServiceArea(this.currentCoords.lat, this.currentCoords.lng);
      }
    }
  }

  onScroll(event: any) {
    const scrollTop = event?.detail?.scrollTop || 0;

    // Dynamically resolve hero banner height if hero slider element exists
    if (!this.cachedBannerHeight) {
      const heroEl = document.querySelector('.home-top-hero-slider') as HTMLElement | null;
      if (heroEl && heroEl.offsetHeight > 0) {
        this.cachedBannerHeight = heroEl.offsetHeight;
      }
    }

    const hasBanners = Boolean(this.banners && this.banners.length > 0);
    const bannerHeight = hasBanners ? (this.cachedBannerHeight || 240) : 0;
    const headerHeight = 64;

    // Point where the bottom of the hero banner crosses the top bar
    const endFade = bannerHeight > 0 ? Math.max(100, bannerHeight - headerHeight) : 20;
    // Fade starts smoothly at ~25% into the banner (e.g. ~40-45px), keeping the top clean
    const startFade = bannerHeight > 0 ? Math.max(20, Math.round(endFade * 0.25)) : 0;

    let newOpacity = 0;
    let pastBanner = false;

    if (scrollTop <= startFade) {
      newOpacity = 0;
      pastBanner = false;
    } else if (scrollTop >= endFade) {
      newOpacity = 1;
      pastBanner = true;
    } else {
      const raw = (scrollTop - startFade) / (endFade - startFade);
      // Smooth 5% quantization steps to minimize change detection cycles
      newOpacity = Math.round(raw * 20) / 20;
      pastBanner = false;
    }

    if (this.headerOpacity !== newOpacity || this.isPastBanner !== pastBanner) {
      this.headerOpacity = newOpacity;
      this.isPastBanner = pastBanner;
      this.isScrolled = pastBanner;
      this.headerBg = pastBanner ? '#ffffff' : `rgba(255, 255, 255, ${newOpacity})`;
    }
  }

  handleRefresh(event: any) {
    this.cachedBannerHeight = 0;
    this.initLocationAndServiceArea();
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

  isStatusActive(service: ServiceItem): boolean {
    const sub = (service?.subtitle || '').toLowerCase();
    const st = (service?.status || '').toLowerCase();
    return sub.includes('active') || (st === 'active' && !service?.subtitle);
  }

  getOfferTagClass(service: ServiceItem): string {
    const offer = (service?.offers || '').toLowerCase();
    if (offer.includes('%') || offer.includes('off') || offer.includes('save') || offer.includes('cash')) {
      return 'tag-discount';
    }
    if (offer.includes('commission') || offer.includes('zero') || offer.includes('surge') || offer.includes('free')) {
      return 'tag-highlight';
    }
    return 'tag-brand';
  }

  getServiceIcon(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    const cat = (service?.category || '').toLowerCase();

    if (title.includes('property') || title.includes('properties') || cat.includes('property') || cat.includes('real estate')) {
      return '🏡';
    }
    if (title.includes('vehicle') || cat.includes('vehicle')) {
      return '🚗';
    }
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
    if (title.includes('parcel') || title.includes('goods')) {
      return '📦';
    }
    if (title.includes('history') || title.includes('order') || title.includes('track')) {
      return '📦';
    }
    return '✨';
  }

  getServiceBg(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    if (title.includes('property') || title.includes('properties')) return 'rgba(16, 185, 129, 0.12)';
    if (title.includes('grocery') || title.includes('vegitables')) return 'rgba(16, 185, 129, 0.12)';
    if (title.includes('ride') || title.includes('cab') || title.includes('auto')) return 'rgba(59, 130, 246, 0.12)';
    if (title.includes('food') || title.includes('dineout') || title.includes('dining')) return 'rgba(249, 115, 22, 0.12)';
    if (title.includes('doctor') || title.includes('medicine')) return 'rgba(168, 85, 247, 0.12)';
    if (title.includes('history') || title.includes('track')) return 'rgba(160, 0, 226, 0.12)';
    return 'rgba(160, 0, 226, 0.1)';
  }

  getServiceCardGradient(service: ServiceItem): string {
    const title = (service?.title || '').toLowerCase();
    if (title.includes('property') || title.includes('properties')) {
      return 'linear-gradient(155deg, #ffffff 0%, #f0fdf4 100%)';
    }
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
      } else if (title.includes('property') || title.includes('properties') || title.includes('vehicle')) {
        this.router.navigate(['/layout/property']);
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
    this.router.navigate(['/layout/map']);
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
