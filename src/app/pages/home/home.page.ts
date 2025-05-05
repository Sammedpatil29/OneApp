import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar, IonSearchbar, IonAvatar, IonModal, IonButtons, IonButton, IonBackButton } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, home, cube, bag, receiptOutline, person, personCircle, personCircleOutline, constructOutline, briefcaseOutline, buildOutline, arrowBack } from 'ionicons/icons';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';
import { FooterComponent } from "../../components/footer/footer.component";
import { Router } from '@angular/router';
import { AddressComponent } from "../../components/address/address.component";


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonButton, IonButtons, IonModal, IonAvatar, IonContent, CommonModule, FormsModule, IonContent, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader, AddressComponent]
})
export class HomePage implements OnInit {
  isModalOpen = false;
  city: any = ''
  address: any = ''

  constructor(private router: Router) {
    addIcons({arrowBack,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  }

  ngOnInit() {
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  openLocation(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  handleModalClose(){
    this.isModalOpen = false
  }

  goBack() {
    this.isModalOpen = false
    console.log('Back button clicked');// or use router.navigateBack('/your-page')
  }

  receiveData(data: any) {
    this.city = data.city
    this.address = data.address
  }

}
