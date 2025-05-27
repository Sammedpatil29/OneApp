import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { Platform } from '@ionic/angular';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { ProfileService } from 'src/app/services/profile.service';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  imports: [IonRefresherContent, IonRefresher, IonGrid, IonRow, IonCol, IonSpinner, IonButton, IonButtons, IonModal, IonContent, CommonModule, FormsModule, IonContent, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader, AddressComponent, RouterLink]
})
export class HomePage implements OnInit {

  isModalOpen = false;
  backButtonSubscription: any;
  city: any = ''
  address: any = ''
  showVideo: boolean = true
  isClicked: boolean = true
  video = ''
  allServices: any;
  groupedData: { [key: string]: any[] } = {};
  isLoading: boolean = false
  isFlashOfferVisible: boolean = false
  locationData: any
  label: any = ''
  currentCoords: any;
  disableProfileClick: boolean = false
  metaData:any
  isOld: any;
  appVersion: any;
  latestVersion = '';
fileName = ''
fileUrl = ''

  constructor(private router: Router, private locationService: LocationService,private profileService: ProfileService, private platform: Platform, private location: Location, private navCtrl: NavController, private commonService: CommonService) {
    addIcons({arrowBack,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  this.getServicesData()
  this.getMetaData()
  }

  slides: any[] = ['../../../assets/banners-2-oneapp.png','../../../assets/Untitled.png']

  async ngOnInit() {
    await this.getAppVersion()
    const locationData = localStorage.getItem('location')
    try{
      if(!locationData){
        this.currentCoords = await this.locationService.getCurrentPosition()
        this.locationService.address$.subscribe(address => {
      // this.address = address;
      console.log('Address received in home:', address);
    });
      }
    } catch {

    }
    
    this.locationService.city$.subscribe((city: any) => {
      this.city = city;
      console.log('City received in home:', city);
    });

    this.locationService.address$.subscribe(address => {
      // this.address = address;
      console.log('Address received in home:', address);
    });

    setTimeout(()=>{
      this.isFlashOfferVisible = false
    }, 2000)

    setInterval(()=> {
      const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.address = location.address;
      this.label = location.label
    }
    }, 500)
  }

  ionViewWillEnter(){
    this.isOld = this.compareVersions(this.appVersion, this.latestVersion)
  }

  async getAppVersion(){
const version = await this.profileService.getAppVersion()
      this.appVersion = version
      console.log(this.appVersion)
     }

  getMetaData(){
    this.isLoading = true
    this.commonService.getMetaData().subscribe((res)=> {
      this.metaData = res
      console.log(res)
      this.isLoading = false
      this.latestVersion = this.metaData[0].latest_version
      this.fileName = `OneApp-${this.latestVersion}`
      this.fileUrl = this.metaData[0].download_link
      console.log(this.latestVersion)
    })
  }

  compareVersions(versionA: string, versionB: string): number {
    const aParts = versionA.trim().split('.').map(Number);
    const bParts = versionB.trim().split('.').map(Number);

    const maxLen = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLen; i++) {
      const a = aParts[i] || 0;
      const b = bParts[i] || 0;

      if (a > b) return -1;
      if (a < b) return 1;
    }

    return 0; // Versions are equal
  }

  goToProfile() {
    console.log('Navigating to profile...');
    this.router.navigateByUrl('/layout/profile');

  }

  openLocation() {
    this.router.navigate(['/layout/map'], {
      state: {data : 'home'}
    })
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

closeFlashOffer(){
  this.isFlashOfferVisible = false;
}
}
