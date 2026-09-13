import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { arrowBackOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { SavedAddressesComponent } from 'src/app/components/saved-addresses/saved-addresses.component';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.page.html',
  styleUrls: ['./address-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    SavedAddressesComponent
  ]
})
export class AddressListPage implements OnInit {
  @ViewChild(SavedAddressesComponent) savedAddressesComp!: SavedAddressesComponent;
  routeSource: any = 'home';

  constructor(private navCtrl: NavController) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.routeSource = history.state?.data || 'home';
  }

  ionViewWillEnter() {
    this.routeSource = history.state?.data || this.routeSource || 'home';
    if (this.savedAddressesComp) {
      this.savedAddressesComp.loadAddresses(false);
    }
  }

  goBack() {
    this.navCtrl.back();
  }
}
