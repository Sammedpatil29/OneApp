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
  IonToolbar, IonSearchbar, IonAvatar, IonModal, IonButtons, IonButton, IonBackButton, IonSpinner, IonCol, IonRow, IonGrid, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, home, cube, bag, receiptOutline, person, personCircle, personCircleOutline, constructOutline, briefcaseOutline, buildOutline, arrowBack } from 'ionicons/icons';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';
import { FooterComponent } from "../../components/footer/footer.component";
import { Router, RouterLink } from '@angular/router';
import { AddressComponent } from "../../components/address/address.component";
import { LocationService } from 'src/app/services/location.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonRefresher, IonGrid, IonRow, IonCol, IonSpinner, IonButton, IonButtons, IonModal, IonContent, CommonModule, FormsModule, IonContent, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader, AddressComponent, RouterLink]
})
export class HomePage implements OnInit {

  isModalOpen = false;
  city: any = ''
  address: any = ''
  showVideo: boolean = true
  isClicked: boolean = true
  video = ''
  allServices: any;
  groupedData: { [key: string]: any[] } = {};
  isLoading: boolean = false

  constructor(private router: Router, private locationService: LocationService) {
    addIcons({arrowBack,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  this.getServicesData()
  }

  ngOnInit() {
    this.locationService.city$.subscribe((city: any) => {
      this.city = city;
      console.log('City received in home:', city);
    });

    this.locationService.address$.subscribe(address => {
      this.address = address;
      console.log('Address received in home:', address);
    });
  }

  goToProfile() {
    // this.router.navigate(['/layout/profile']);
    console.log('Navigating to profile...');
    this.router.navigate(['/layout/profile'], {
      replaceUrl: true,         // optionally replace the URL in the browser history
  skipLocationChange: false
    }).then(success => {
      console.log('Navigation success:', success);
    });
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

  closeBubble() {
    this.showVideo = false
    }

    getServicesData(){
      this.isLoading = true
      this.locationService.getData().subscribe((res)=> {
          this.allServices = res
          this.groupedData = this.groupByCategory(this.allServices);
          console.log(this.groupedData)
          this.isLoading = false
      })
    }

    groupByCategory(data: any[]) {
  return data.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    const shuffledArray = this.shuffleArray(acc)
    return shuffledArray;
  }, {} as { [key: string]: any[] });
}

shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

navigateTo(route:any){
    console.log(`/layout/${route}`)
    this.router.navigate([`/layout/${route}`])
  }


}
