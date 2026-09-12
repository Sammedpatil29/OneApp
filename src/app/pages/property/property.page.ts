import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonChip, IonContent, IonToolbar, IonCard, IonCardContent, IonBadge, IonButton, IonButtons, IonIcon, IonTitle } from "@ionic/angular/standalone";
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
  imports: [ IonBadge, FormsModule, IonCardContent, IonCard, IonToolbar, IonContent, IonChip, IonHeader, IonButtons, IonButton, IonIcon, IonTitle, CommonModule]
})
export class PropertyPage {

  constructor(private navCtrl: NavController) {
    addIcons({ arrowBackOutline });
  }

  goBack() {
    this.navCtrl.back();
  }

  searchText = '';

  cars = [
    {
      brand: 'Tata',
      model: 'Tigor',
      year: 2022,
      variant: 'XZ PLUS CNG',
      km: '93,895',
      fuel: 'CNG',
      transmission: 'Manual',
      location: 'KA51',
      price: 4.69,
      image: 'https://imgd.aeplcdn.com/600x337/n/cw/ec/40432/tata-tigor-exterior-right-front-three-quarter-5.jpeg'
    },
    {
      brand: 'Maruti',
      model: 'WagonR',
      year: 2021,
      variant: 'VXI CNG',
      km: '45,000',
      fuel: 'CNG',
      transmission: 'Manual',
      location: 'KA03',
      price: 5.10,
      image: 'https://imgd.aeplcdn.com/600x337/n/cw/ec/40432/wagonr-exterior-right-front-three-quarter.jpeg'
    }
  ];

}