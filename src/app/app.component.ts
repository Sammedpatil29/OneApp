import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonButton, IonHeader, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NavController } from '@ionic/angular';
import { PushNotifications, Token, PushNotification } from '@capacitor/push-notifications';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonContent, IonTitle, IonHeader, IonButton, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  isOnline: boolean = true
  constructor(private platform: Platform, private navCtrl: NavController) {
    //  this.platform.ready().then(() => {
    //   this.initPush();
    // });
     this.initializeApp();
  }

  ngOnInit() {
    this.lockOrientation();
    this.listenToNotificationClicks();
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




}
