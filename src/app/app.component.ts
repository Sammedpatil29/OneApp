import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonButton, IonHeader, IonTitle } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Network } from '@capacitor/network';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonTitle, IonHeader, IonButton, IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  isOnline: boolean = true
  constructor(private platform: Platform) {
     this.initializeApp();
  }

  ngOnInit() {
    this.lockOrientation();
  }

   async initializeApp() {
    await this.platform.ready();
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
}
