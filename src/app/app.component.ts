import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonButton, IonHeader, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NavController } from '@ionic/angular';
import { PushNotifications, Token, PushNotification } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';
import { Optional, ViewChild } from '@angular/core';
import { IonToast } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonContent, IonTitle, IonHeader, IonApp, IonRouterOutlet, IonToast, IonButton, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  isOnline: boolean = true;

  // ✅ ADDED: your remote UI
  remoteUrl: string = 'https://pintu-teal.vercel.app/';

  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private location: Location,
    private router: Router
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.lockOrientation();
    this.listenToNotificationClicks();
    this.initializeBackButtonCustomHandler();
  }

  async initializeApp() {
    await this.platform.ready();
    await SplashScreen.hide();

    // ✅ MODIFIED
    await this.checkNetworkStatus();
    this.listenToNetwork();
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // ✅ ADDED LOGIC
    if (this.isOnline) {
      console.log('🌐 Online → loading remote UI');
      window.location.replace(this.remoteUrl);
    } else {
      console.log('📴 Offline → loading local offline page');
      this.router.navigateByUrl('/offline'); // make sure offline route exists
    }
  }

  listenToNetwork() {
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;

      // ✅ ADDED LOGIC
      if (status.connected) {
        console.log('🌐 Internet back → loading remote UI');
        window.location.replace(this.remoteUrl);
      }
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
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {

      const currentUrl = this.router.url;
      console.log('📍 Back Pressed. Current URL:', currentUrl);

      const isRootPage =
        currentUrl.includes('/home') ||
        currentUrl.includes('/login') ||
        currentUrl.includes('/offline'); // ✅ added offline

      if (isRootPage) {
        App.exitApp();
      }
      else if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        this.navCtrl.back({ animated: false });
      } else if (currentUrl == '/layout/example/history' || currentUrl == '/layout/example/support') {
        this.navCtrl.navigateBack('/layout/example/home');
      }
      else {
        processNextHandler();
      }
    });
  }
}
