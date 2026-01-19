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
  imports: [IonContent, IonTitle, IonHeader,IonApp, IonRouterOutlet, IonToast, IonButton, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  isOnline: boolean = true
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet!: IonRouterOutlet;
  constructor(private platform: Platform, private navCtrl: NavController, private location: Location,
    private router: Router) {
    //  this.platform.ready().then(() => {
    //   this.initPush();
    // });
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
    this.checkNetworkStatus();
    this.listenToNetwork();
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;
  }

  listenToNetwork() {
    Network.addListener('networkStatusChange', (status) => {
      this.isOnline = status.connected;
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
      // Navigate to your order tracking or details page
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
    // Priority 10 ensures this runs before standard page transitions
    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      
      const currentUrl = this.router.url;
      console.log('📍 Back Pressed. Current URL:', currentUrl); // Check your console for this!

      // 1. Aggressive Check: If URL contains 'home' or is 'login', EXIT.
      // We use .includes() because sometimes URLs have params like /home?id=1
      const isRootPage = 
        currentUrl.includes('/home') || 
        currentUrl.includes('/login');

      if (isRootPage) {
        console.log('📲 Exiting App...');
        App.exitApp();
      } 
      else if (this.routerOutlet && this.routerOutlet.canGoBack()) {
        console.log('⬅️ Going Back');
        this.navCtrl.back({animated: false});
      } else if (currentUrl == '/layout/example/history' || currentUrl == '/layout/example/support') {
        console.log('🏠 Navigating to Home');
        this.navCtrl.navigateBack('/layout/example/home');
      }
      else {
        // If we can't go back and we aren't on home, fallback to exit
        // or let the next handler take over (like closing a modal)
        console.log('🤷 No history, executing next handler');
        processNextHandler();
      }
    });
  }
}
