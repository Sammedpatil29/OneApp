import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NavController } from '@ionic/angular';
import { PushNotifications, Token, PushNotification } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { Optional, ViewChild } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OtaService } from './services/ota.service';
import { AuthService } from './services/auth.service';
import { AppDialogService } from './services/app-dialog.service';
import { PlayStoreUpdateService } from './services/play-store-update.service';
import { AdmobService } from './services/admob.service';
import { CustomSplashComponent } from './pages/custom-splash/custom-splash.component';
import { OfflinePage } from './offline/offline.page';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, CustomSplashComponent, OfflinePage],
})
export class AppComponent implements OnInit {

  environment = environment;
  isOnline: boolean = true;
  showSplash: boolean = true;

  // ✅ ADDED: your remote UI
  remoteUrl: string = 'https://pintu-teal.vercel.app/';

  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private location: Location,
    private router: Router,
    private otaService: OtaService,
    private authService: AuthService,
    private dialogService: AppDialogService,
    private playStoreUpdateService: PlayStoreUpdateService,
    private admobService: AdmobService
  ) {
    const startTime = Date.now();
    this.routeBasedOnAuth(startTime);

    // Fallback safety: ensure splash is never stuck longer than 3.5s
    setTimeout(() => {
      if (this.showSplash) {
        this.showSplash = false;
      }
    }, 3500);
  }

  onSplashDismiss() {
    this.showSplash = false;
  }

  private dismissSplash(startTime: number) {
    const elapsed = Date.now() - startTime;
    const minDisplay = 2000; // Allow ~2s so user can view promotional offer banner and loader progress smoothly
    const delay = Math.max(0, minDisplay - elapsed);
    setTimeout(() => {
      this.showSplash = false;
    }, delay);
  }

  private routeBasedOnAuth(startTime: number) {
    const targetUrl = this.authService.hasToken() ? '/layout/home' : '/login';
    this.router.navigateByUrl(targetUrl).then(() => {
      this.dismissSplash(startTime);
    }).catch(() => {
      this.dismissSplash(startTime);
    });
  }

  ngOnInit() {
    this.lockOrientation();
    this.listenToNotificationClicks();
    this.initializeBackButtonCustomHandler();
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    await SplashScreen.hide();
    try {
      await SplashScreen.hide();
    } catch (e) {}

    // 🚀 Initialize OTA Live Update Checks
    this.otaService.initialize();

    // 🚀 Initialize Play Store In-App Updates Check (Strict update requirement)
    this.playStoreUpdateService.initialize();

    await this.checkNetworkStatus();
    this.listenToNetwork();
  }

  async checkNetworkStatus() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      if (!this.isOnline) {
        console.log('📴 Offline on launch');
      }
    } catch (e) {
      console.warn('Network status check error:', e);
    }
  }

  listenToNetwork() {
    try {
      Network.addListener('networkStatusChange', (status) => {
        this.isOnline = status.connected;
        if (status.connected) {
          console.log('🌐 Internet connection restored');
        } else {
          console.log('📴 Disconnected from network');
        }
      });
    } catch (e) {
      console.warn('Network listener error:', e);
    }
  }

  onOnlineRestored() {
    this.isOnline = true;
    this.routeBasedOnAuth(Date.now());
  }

  async onRefreshClick() {
    await this.checkNetworkStatus();
  }

  async lockOrientation() {
    await ScreenOrientation.lock({ orientation: 'portrait-primary' });
  }

  async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') {
      console.log('Notification permission not granted');
    }
  }

  listenToNotificationClicks() {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      const orderId = notification.notification.extra?.orderId;
      if (orderId) {
        this.navCtrl.navigateRoot('/layout/track-order', {
          state: {
            fromNotification: true,
            orderId: orderId
          }
        });
      }
    });
  }

  initializeBackButtonCustomHandler() {
    this.platform.backButton.subscribeWithPriority(10, async (processNextHandler) => {

      const currentUrl = this.router.url;
      console.log('📍 Back Pressed. Current URL:', currentUrl);

      // 1. If an alert dialog is currently open, dismiss it on back press
      if (this.dialogService.isAlertOpen) {
        this.dialogService.handleCancel();
        return;
      }

      // 2. On home page, show confirmation dialog before exiting
      if (currentUrl.includes('/home')) {
        const confirmed = await this.dialogService.showConfirm({
          title: 'Exit Pintu?',
          message: 'Are you sure you want to exit the app?',
          confirmText: 'Exit App',
          cancelText: 'Stay'
        });
        if (confirmed) {
          App.exitApp();
        }
        return;
      }

      // 3. Other root pages (login, offline) exit directly
      const isDirectExitPage =
        currentUrl.includes('/login') ||
        currentUrl.includes('/offline');

      if (isDirectExitPage) {
        App.exitApp();
        return;
      }

      // 4. Dedicated service sub-pages: ALWAYS navigate back within service landing page FIRST!
      if (this.isServiceSubPage(currentUrl)) {
        const landingUrl = this.getServiceLandingUrl(currentUrl);
        this.navCtrl.navigateBack(landingUrl);
        return;
      }

      // 5. Dedicated service landing pages: return to home (guard will prompt confirmation)
      if (this.isServicePage(currentUrl)) {
        this.navCtrl.navigateRoot('/layout/home');
        return;
      }

      // 6. Secondary root tabs (history, support, profile, refer)
      if (
        currentUrl.includes('/layout/history') ||
        currentUrl.includes('/layout/support') ||
        currentUrl.includes('/layout/profile') ||
        currentUrl.includes('/layout/refer')
      ) {
        this.navCtrl.navigateRoot('/layout/home');
        return;
      }

      // 7. General navigation
      if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.navCtrl.back({ animated: false });
      } else {
        processNextHandler();
      }
    });
  }

  /**
   * Service landing page definitions.
   * Key = landing path, Value = array of sub-page URL patterns.
   */
  private readonly SERVICE_PAGES: { landing: string; subPagePrefixes: string[] }[] = [
    {
      landing: '/layout/pharmacy',
      subPagePrefixes: [
        '/layout/pharmacy/cart',
        '/layout/pharmacy/search',
        '/layout/pharmacy/medicine/',
        '/layout/pharmacy/test/',
        '/layout/medicine-details/',
        '/layout/lab-test-details/',
        '/layout/pharmacy-cart',
        '/layout/pharmacy-search',
      ]
    },
    {
      landing: '/layout/property',
      subPagePrefixes: [
        '/layout/property/details/',
        '/layout/property/register',
      ]
    },
    {
      landing: '/layout/dineout-layout/dineout',
      subPagePrefixes: [
        '/layout/dineout-layout/dineout-hotel-details/',
        '/layout/dineout-layout/dineout-select-time/',
        '/layout/dineout-layout/dineout-track/',
        '/layout/dineout-layout/dineout-paybill',
      ]
    },
    {
      landing: '/layout/rides/search',
      subPagePrefixes: [
        '/layout/rides/select',
        '/layout/rides/tracking',
      ]
    },
  ];

  /** Check if user is on a sub-page within a dedicated service (not the landing page) */
  private isServiceSubPage(url: string): boolean {
    return this.SERVICE_PAGES.some(s =>
      s.subPagePrefixes.some(prefix => url.includes(prefix))
    );
  }

  /** Get the landing page URL for the service the user is currently in */
  private getServiceLandingUrl(url: string): string {
    const service = this.SERVICE_PAGES.find(s =>
      s.subPagePrefixes.some(prefix => url.includes(prefix))
    );
    return service ? service.landing : '/layout/home';
  }

  /** Check if user is on any dedicated service page (landing or sub-page) */
  private isServicePage(url: string): boolean {
    return (
      url.includes('/layout/pharmacy') ||
      url.includes('/layout/property') ||
      url.includes('/layout/dineout') ||
      url.includes('/layout/events') ||
      url.includes('/layout/ride')
    );
  }
}
