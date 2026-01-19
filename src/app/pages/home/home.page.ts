import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar, IonButtons, IonButton, IonSpinner, IonCol, IonRow, IonGrid, IonRefresher, IonRefresherContent, AlertController, IonSkeletonText } from '@ionic/angular/standalone';

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
import { RegisterFcmService } from 'src/app/services/register-fcm.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsService } from 'src/app/services/events.service';
import { GroceryService } from 'src/app/services/grocery.service';
import { Geolocation } from '@capacitor/geolocation';


register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  imports: [IonSkeletonText, IonRefresherContent, IonRefresher, IonGrid, IonRow, IonCol, IonSpinner, IonButton, IonButtons, IonContent, CommonModule, FormsModule, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader, AddressComponent, RouterLink]
})
export class HomePage implements OnInit {
  // UI State
  headerBg = 'rgba(255, 255, 255, 0)';
  isModalOpen = false;
  showVideo: boolean = true;
  isClicked: boolean = true;
  isLoading: boolean = false;
  isServiceLoading: boolean = false;
  isSpecialDataLoading: boolean = false;
  isBannerLoading: boolean = false;
  isLocationLoading: boolean = false;
  isFlashOfferVisible: boolean = false;
  disableProfileClick: boolean = false;

  // Data
  token: any = '';
  banners: any[] = [];
  slides: any = [];
  allServices: any;
  groupedData: { [key: string]: any[] } = {};
  availableServices: any = [];
  events: any;
  groceryList: any;
  orders: any = [];
  activeOrderDetails: any;
  profileData: any = '';
  metaData: any;

  // Location
  addresses: any[] = [];
  currentLocation: any;
  locationData: any;
  city: any = '';
  address: any = '';
  label: any = '';
  currentCoords: any;

  // App Versioning
  isOld: any;
  appVersion: any;
  latestVersion = '';
  fileName = '';
  fileUrl = '';

  // Misc
  backButtonSubscription: any;
  video = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private groceryService: GroceryService,
    private registarFcm: RegisterFcmService,
    private locationService: LocationService,
    private profileService: ProfileService,
    private platform: Platform,
    private location: Location,
    private navCtrl: NavController,
    private commonService: CommonService,
    private eventService: EventsService,
    private alertController: AlertController,
    private fcmService: RegisterFcmService
  ) {
    addIcons({ arrowBack, home, buildOutline, receiptOutline, personCircleOutline, briefcaseOutline, constructOutline, library, personCircle, person, search, bag, cube, radio, playCircle });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;

      this.token = await this.authService.getToken();

      if (!this.token) {
        return;
      }
      this.fcmService.initPush()

      await this.homeData();
      

    } catch (error) {
      console.error('❌ Error initializing home:', error);
    } finally {
      this.isLoading = false;
      this.isServiceLoading = false;
      this.isBannerLoading = false;
    }
  }

  ionViewDidEnter() {
  const storedLocation = localStorage.getItem('location');
  if (storedLocation) {
    console.log('✅ Using Location from LocalStorage');
    this.currentLocation = JSON.parse(storedLocation);
  }
}

  // --- Data Fetching ---

  async homeData() {
    this.isLoading = true;
    this.commonService.getHomeData(this.token).subscribe((res: any) => {
      this.banners = res.data.banners;
      this.allServices = res.data.services;
      this.slides = this.banners;
      this.addresses = res.data.addresses;
      this.groupedData = this.groupByCategory(this.allServices);
      setTimeout(()=>{
        this.isLoading = false;
      }, 100)
       this.resolveUserLocation();
    }, error => {
      this.isLoading = false;
    });
    this.sendFcmToken()
  }

  sendFcmToken(){
    let params = {
      "fcm_token": localStorage.getItem('FcmToken')
    }
    this.commonService.sendFcmToken(params, this.token).subscribe((res: any) => {
      console.log(res)
    });

  }

  getServicesData() {
    this.isServiceLoading = true;
    this.locationService.getData().subscribe((res) => {
      this.allServices = res;
      this.groupedData = this.groupByCategory(this.allServices);
      console.log(this.groupedData);
      this.isServiceLoading = false;
    }, error => {

    });
  }

  checkServices() {
    this.allServices.forEach((item: any) => {
      this.availableServices.push(item.title);
    });
  }

  async getAppVersion() {
    const version = await this.profileService.getAppVersion();
    this.appVersion = version;
    console.log(this.appVersion);
  }

  // --- Location Logic ---

  async resolveUserLocation() {
    const storedLocation = localStorage.getItem('location');
    if (storedLocation) {
      console.log('✅ Using Location from LocalStorage');
      this.currentLocation = JSON.parse(storedLocation);
      return;
    }

    if (this.addresses && this.addresses.length > 0) {
      console.log('✅ Using Primary Address from API');
      const primaryAddress = {
        lat: this.addresses[0].lat,
        lng: this.addresses[0].lng,
        address: this.addresses[0].address,
        id: this.addresses[0].id,
        label: this.addresses[0].label
      };

      this.setAndStoreLocation(primaryAddress);
      return;
    }

    // CHECK 3: GPS / Current Position
    console.log('📍 No saved data. Fetching GPS...');
    await this.fetchGPSLocation();
  }

  async fetchGPSLocation() {
    try {
      // Check permissions first (Optional but recommended)
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') throw new Error('PermissionDenied');
      }

      // Get Position
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000, // Wait max 10s
        maximumAge: 0   // Do not use cached position
      });

      console.log('✅ GPS Success:', coordinates);

      // Create location object
      const gpsLocation = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
        address: 'Current Location',
      };

      this.setAndStoreLocation(gpsLocation);

    } catch (error: any) {
    }
  }

  setAndStoreLocation(data: any) {
    this.currentLocation = data;
    localStorage.setItem('location', JSON.stringify(data));
    const storedLocation = localStorage.getItem('location');
    if (storedLocation) {
      console.log('✅ Using Location from LocalStorage');
      this.currentLocation = JSON.parse(storedLocation);
    }
  }

  receiveData(data: any) {
    this.city = data.city;
    this.address = data.address;
  }

  openLocation() {
    this.navCtrl.navigateForward('/layout/address-list', {
      state: { data: 'home' }
    });
  }

  // --- Navigation ---

  navigateTo(route: any) {
    console.log(`/layout/${route}`);
    this.navCtrl.navigateForward(`/layout/${route}`, {
      animated: false
    });
  }

  navigateFromSlide(route: any) {
    this.navCtrl.navigateForward(`${route}`);
  }

  goToProfile() {
    console.log('Navigating to profile...');
    this.navCtrl.navigateForward('/layout/profile', {
      animated: false
    });
  }

  goToOrderDetails(orderId: any) {
    let orderDetails;
    this.orders.forEach((item: any) => {
      let details = JSON.parse(item.details);
      if (details.orderId == orderId) {
        orderDetails = item;
      }
    });
    this.navCtrl.navigateRoot('/layout/track-order', {
      state: {
        orderDetails: orderDetails
      }
    });
  }

  gotoGrocery() {
    this.navCtrl.navigateForward('/layout/grocery');
  }

  gotoEvents() {
    this.navCtrl.navigateForward('/layout/events', {
      animationDirection: 'forward',
    });
  }

  goBack() {
    this.isModalOpen = false;
    console.log('Back button clicked');
  }

  // --- UI Interaction ---

  onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    const maxScroll = 150; // point at which it becomes fully white

    // Calculate opacity between 0 and 1
    let opacity = Math.min(scrollTop / maxScroll, 1);

    this.headerBg = `rgba(255, 255, 255, ${opacity})`;
  }

  handleModalClose() {
    this.isModalOpen = false;
  }

  closeBubble() {
    this.showVideo = false;
  }

  closeFlashOffer() {
    this.isFlashOfferVisible = false;
  }

  // --- Helpers ---

  groupByCategory(data: any[]) {
    this.isLoading = true
    return data.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      const shuffledArray = this.shuffleArray(acc);
      return shuffledArray;
    }, {} as { [key: string]: any[] });
    this.isLoading = false
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
}
