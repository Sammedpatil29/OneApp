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
import { CustomSplashComponent } from './pages/custom-splash/custom-splash.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonContent, CustomSplashComponent],
})
export class AppComponent implements OnInit {

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
    private dialogService: AppDialogService
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

  private dismissSplash(startTime: number) {
    const elapsed = Date.now() - startTime;
    const minDisplay = 600; // minimum 600ms so loader smoothly displays without flickering
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

    // ✅ MODIFIED
    // await this.checkNetworkStatus();
    this.listenToNetwork();
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // ✅ ADDED LOGIC
    // if (this.isOnline) {
    //   console.log('🌐 Online → loading remote UI');
    //   // window.location.replace(this.remoteUrl);
    // } else {
    //   console.log('📴 Offline → loading local offline page');
    //   this.navCtrl.navigateRoot('/offline'); // make sure offline route exists
    // }
  }

  listenToNetwork() {
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;

      // ✅ ADDED LOGIC
      // if (status.connected) {
      //   console.log('🌐 Internet back → loading remote UI');
      //   // window.location.replace(this.remoteUrl);
      //   this.navCtrl.navigateRoot('/login');
      // }
    });
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
      }
      else if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.navCtrl.back({ animated: false });
      } else if (
        currentUrl.includes('/layout/history') ||
        currentUrl.includes('/layout/support') ||
        currentUrl.includes('/layout/profile') ||
        currentUrl.includes('/layout/refer')
      ) {
        this.navCtrl.navigateRoot('/layout/home');
      }
      else {
        processNextHandler();
      }
    });
  }
}
