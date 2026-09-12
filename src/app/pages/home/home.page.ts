import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { App } from '@capacitor/app';
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
  alertCircle,
  moonOutline,
  navigateCircleOutline,
  mapOutline,
  refreshOutline,
  refresh,
  locationOutline,
  locate,
  locateOutline
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
export class HomePage implements OnInit, OnDestroy {
  headerBg: string = 'rgba(255, 255, 255, 0)';
  headerOpacity: number = 0;
  isPastBanner: boolean = false;
  isScrolled: boolean = false;
  private cachedBannerHeight: number = 0;
  locationLabel: string = 'UNSAVED';
  isSavedAddress: boolean = false;
  displayLocationName: string = 'Select Location';
  displayFullAddress: string = '';
  profileAvatar: string = '';
  userInitials: string = 'P';
  orders: any[] = [];
  token: string = '';
  isLoadingServices: boolean = true;

  // Location Verification & Continuous Monitoring State
  isCheckingLocation: boolean = true;
  locationCheckPhase: 'loading_address' | 'detecting' | 'permission_needed' | 'gps_disabled' | 'validating' | 'done' = 'detecting';
  isGpsDisabled: boolean = false;
  private locationWatchId: string | null = null;
  private locationMonitorTimer: any = null;
  private appStateListener: any = null;

  isLocationPermissionDenied: boolean = false;
  isOutOfServiceArea: boolean = false;
  nearestServiceArea: { id?: string; cityName: string; distanceKm: number } | null = null;
  isAreaClosed: boolean = false;
  closedAreaCity: string = '';
  areaClosureMessage: string = '';
  currentCoords: { lat: number; lng: number } | null = null;

  get isOfflineOrOutOfServiceArea(): boolean {
    return Boolean(this.isAreaClosed || this.isOutOfServiceArea);
  }

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
      locate,
      locateOutline,
      alertCircle,
      alertCircleOutline,
      refresh,
      refreshOutline,
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
      moonOutline,
      navigateCircleOutline,
      mapOutline,
      locationOutline
    });
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
        this.applyLocationDetails(parsed);
      } catch (e) {}
    }

    this.locationService.location$.subscribe((loc: any) => {
      if (loc) {
        this.applyLocationDetails(loc);
      }
    });

    this.locationService.address$.subscribe((addr: string) => {
      if (addr && addr.trim() && (!this.displayFullAddress || this.displayFullAddress === 'Select Location')) {
        this.displayFullAddress = addr.trim();
        if (this.displayLocationName === 'Select Location' || !this.displayLocationName) {
          this.displayLocationName = addr.split(',')[0].trim();
        }
      }
    });

    this.locationService.city$.subscribe((city: string) => {
      if (city && city.trim() && (this.displayLocationName === 'Select Location' || !this.displayLocationName)) {
        this.displayLocationName = city;
      }
    });

    // Start initial location verification flow with startup popup
    this.startLocationVerificationFlow(true);

    if (this.token) {
      this.loadUserProfile();
      this.loadHomeData();
      this.loadActiveOrders();
    } else {
      this.loadHomeData();
    }
  }

  ngOnDestroy() {
    this.stopContinuousLocationMonitoring();
  }

  /**
   * Fires every time the home page becomes active (including back navigation).
   * Re-reads localStorage to pick up address changes made on the map/address-list pages.
   */
  ionViewWillEnter() {
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        this.applyLocationDetails(parsed);
      } catch (e) {}
    }
  }

  /**
   * Primary location verification flow on startup & refresh.
   * Priority: 1) localStorage cached address → 2) DB primary address → 3) GPS fallback
   */
  async startLocationVerificationFlow(showModal: boolean = true) {
    if (showModal) {
      this.isCheckingLocation = true;
      this.locationCheckPhase = 'loading_address';
    }

    // 1. Check localStorage for a cached primary address
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed?.lat && parsed?.lng) {
          console.log('📍 Using cached primary address from localStorage');
          this.applyLocationDetails(parsed);
          this.locationCheckPhase = 'validating';
          await this.evaluateServiceArea(Number(parsed.lat), Number(parsed.lng));
          this.startContinuousLocationMonitoring();
          return;
        }
      } catch (e) {
        console.warn('Failed to parse cached location:', e);
      }
    }

    // 2. If logged in, try fetching primary address from API
    if (this.token) {
      try {
        const primaryAddr = await this.fetchPrimaryAddressFromApi();
        if (primaryAddr?.lat && primaryAddr?.lng) {
          console.log('📍 Using DB primary address:', primaryAddr.address);
          const locData = {
            lat: primaryAddr.lat,
            lng: primaryAddr.lng,
            id: primaryAddr.id,
            label: primaryAddr.label || 'Home',
            house_no: primaryAddr.house_no,
            building_name: primaryAddr.building_name,
            landmark: primaryAddr.landmark,
            address: primaryAddr.address,
            area: primaryAddr.address?.split(',')[0] || 'Athani'
          };
          this.locationService.setAddress(locData);
          this.applyLocationDetails(locData);
          this.locationCheckPhase = 'validating';
          await this.evaluateServiceArea(Number(primaryAddr.lat), Number(primaryAddr.lng));
          this.startContinuousLocationMonitoring();
          return;
        }
      } catch (e) {
        console.warn('Could not fetch primary address from API:', e);
      }
    }

    // 3. No saved address → fall back to GPS detection
    console.log('📍 No primary address found, falling back to GPS detection');
    this.locationCheckPhase = 'detecting';
    await this.runLocationCheck();
    this.startContinuousLocationMonitoring();
  }

  /**
   * Apply address details to header UI:
   * Sets locationLabel ('HOME', 'WORK', 'OTHER', or 'UNSAVED'),
   * displayLocationName (main area name),
   * and displayFullAddress (detailed street / full address).
   */
  private applyLocationDetails(addr: any) {
    if (!addr) return;

    // 1. Determine Label & Saved Status
    const rawLabel = (addr.label || '').trim();
    if (addr.id || (rawLabel && rawLabel.toLowerCase() !== 'unsaved')) {
      this.locationLabel = rawLabel ? rawLabel : 'Home';
      this.isSavedAddress = true;
    } else {
      this.locationLabel = 'Unsaved';
      this.isSavedAddress = false;
    }

    // 2. Main Area Name
    if (addr.area && addr.area.trim()) {
      this.displayLocationName = addr.area.trim();
    } else if (addr.address && addr.address.trim()) {
      this.displayLocationName = addr.address.split(',')[0].trim() || 'Athani';
    } else {
      this.displayLocationName = 'Select Location';
    }

    // 3. Current Detailed Full Address
    const detailedParts = [
      addr.house_no,
      addr.building_name,
      addr.landmark ? 'Near ' + addr.landmark : '',
      addr.address
    ].filter(Boolean);

    if (detailedParts.length > 1) {
      this.displayFullAddress = detailedParts.join(', ');
    } else if (addr.address && addr.address.trim()) {
      this.displayFullAddress = addr.address.trim();
    } else {
      this.displayFullAddress = this.displayLocationName;
    }

    // 4. Coordinates
    if (addr.lat && addr.lng) {
      this.currentCoords = { lat: Number(addr.lat), lng: Number(addr.lng) };
    }
  }

  /**
   * Fetch primary address from backend API (returns null if none)
   */
  private fetchPrimaryAddressFromApi(): Promise<any> {
    return new Promise((resolve) => {
      this.locationService.getPrimaryAddress(this.token).subscribe({
        next: (res: any) => {
          resolve(res?.success && res?.data ? res.data : null);
        },
        error: () => resolve(null)
      });
    });
  }

  /**
   * GPS-based location check (only used when no primary address exists)
   */
  async runLocationCheck(): Promise<void> {
    const locResult = await this.locationService.getDetailedPosition();

    if (locResult.status === 'permission_denied') {
      this.isLocationPermissionDenied = true;
      this.isGpsDisabled = false;
      this.locationCheckPhase = 'permission_needed';
      this.isCheckingLocation = true;
      return;
    }

    if (locResult.status === 'gps_disabled') {
      this.isLocationPermissionDenied = false;
      this.isGpsDisabled = true;
      this.locationCheckPhase = 'gps_disabled';
      this.isCheckingLocation = true;
      return;
    }

    if (locResult.status === 'ok' && locResult.coords) {
      this.isLocationPermissionDenied = false;
      this.isGpsDisabled = false;
      this.locationCheckPhase = 'validating';

      const { latitude, longitude } = locResult.coords;
      this.currentCoords = { lat: latitude, lng: longitude };

      const area = locResult.city || (locResult.address ? locResult.address.split(',')[0] : 'Athani');
      const address = locResult.address || locResult.city || 'Athani';

      this.applyLocationDetails({
        lat: latitude,
        lng: longitude,
        label: '', // Empty label signals 'Unsaved'
        area,
        address
      });

      await this.evaluateServiceArea(latitude, longitude);
    }
  }

  /**
   * Validate coordinates against backend service areas
   */
  evaluateServiceArea(lat: number, lng: number): Promise<void> {
    return new Promise((resolve) => {
      this.locationService.checkLocationInServiceArea(lat, lng).subscribe({
        next: (res: any) => {
          this.isCheckingLocation = false;
          this.locationCheckPhase = 'done';

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
          resolve();
        },
        error: (err: any) => {
          console.warn('Could not check service area:', err);
          this.isCheckingLocation = false;
          this.locationCheckPhase = 'done';
          resolve();
        }
      });
    });
  }

  /**
   * Action button in popup: request permission and immediately re-evaluate
   */
  async requestLocationPermissionAndPosition() {
    this.locationCheckPhase = 'detecting';
    try {
      const perm = await this.locationService.requestLocationPermission();
      if (perm.location === 'granted') {
        this.isLocationPermissionDenied = false;
        await this.runLocationCheck();
      } else {
        this.isLocationPermissionDenied = true;
        this.locationCheckPhase = 'permission_needed';
      }
    } catch (e) {
      await this.runLocationCheck();
    }
  }

  async recheckLocationAndServiceArea() {
    await this.startLocationVerificationFlow(true);
  }

  /**
   * Continuous background monitoring: appStateChange, active interval, & watchPosition
   */
  startContinuousLocationMonitoring() {
    // 1. App Resume Listener (detects return from Android quick settings / permissions)
    if (!this.appStateListener) {
      try {
        this.appStateListener = App.addListener('appStateChange', async (state) => {
          if (state.isActive) {
            console.log('📱 App resumed, re-evaluating location status...');
            if (this.isLocationPermissionDenied || this.isGpsDisabled || this.isCheckingLocation) {
              await this.runLocationCheck();
            }
          }
        });
      } catch (e) {
        console.warn('AppState listener unavailable:', e);
      }
    }

    // 2. Periodic poll interval if location resolution is pending (every 2.5s)
    if (!this.locationMonitorTimer) {
      this.locationMonitorTimer = setInterval(async () => {
        if (this.isLocationPermissionDenied || this.isGpsDisabled || this.isCheckingLocation) {
          const perm = await this.locationService.checkLocationPermission();
          if (perm.location === 'granted') {
            await this.runLocationCheck();
          }
        }
      }, 2500);
    }

    // 3. Continuous Geolocation Watcher
    if (!this.locationWatchId) {
      this.locationService.watchPosition((position, err) => {
        if (position?.coords) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (this.isLocationPermissionDenied || this.isGpsDisabled) {
            this.isLocationPermissionDenied = false;
            this.isGpsDisabled = false;
          }

          if (this.isOutOfServiceArea || !this.currentCoords) {
            this.currentCoords = { lat, lng };
            this.evaluateServiceArea(lat, lng);
          }
        }
      }).then(id => {
        if (id) this.locationWatchId = id;
      });
    }
  }

  stopContinuousLocationMonitoring() {
    if (this.locationMonitorTimer) {
      clearInterval(this.locationMonitorTimer);
      this.locationMonitorTimer = null;
    }
    if (this.locationWatchId) {
      this.locationService.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
    if (this.appStateListener) {
      this.appStateListener.remove?.();
      this.appStateListener = null;
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
    this.startLocationVerificationFlow(false);
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
    this.router.navigate(['/layout/address-list'], {
      state: { data: 'home' }
    });
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
