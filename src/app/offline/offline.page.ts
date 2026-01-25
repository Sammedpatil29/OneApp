import { Component } from '@angular/core';
import { Network } from '@capacitor/network';
import { IonContent, IonButton, IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-offline',
  templateUrl: './offline.page.html',
  styleUrls: ['./offline.page.scss'],
  imports: [IonIcon, IonButton, IonContent],
})
export class OfflinePage {

  remoteUrl = 'https://pintu-teal.vercel.app/';

  async retry() {
    const status = await Network.getStatus();
    if (status.connected) {
      
      // window.location.replace(this.remoteUrl);
    }
  }
}
