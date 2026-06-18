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
import { library, playCircle, radio, search, home, cube, bag, receiptOutline, person, personCircle, personCircleOutline, constructOutline, briefcaseOutline, buildOutline, arrowBack, cloudOfflineOutline, locationOutline, mapOutline } from 'ionicons/icons';
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
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';


declare var google: any;
register();

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
  imports: [IonSkeletonText, IonRefresherContent, IonRefresher, IonGrid, IonRow, IonCol, IonButton, IonButtons, IonContent, CommonModule, FormsModule, IonIcon, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader, AddressComponent]
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
  insideServiceArea: boolean = true;
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
    addIcons({arrowBack,locationOutline,mapOutline,cloudOfflineOutline,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      this.locationService.location$.subscribe((res:any)=>{
        if (res) {
          this.currentLocation = res;
          this.checkServiceAvailability();
        }
      });

      this.token = await this.authService.getToken();

      if (!this.token) {
        return;
      }
      this.fcmService.initPush();

      // Using forkJoin to run API calls in parallel
      forkJoin({
        home: this.homeData(),
        orders: this.getActiveOrders()
      }).pipe(
        finalize(() => {
          // Delay slightly to allow DOM to paint properly
          setTimeout(() => this.isLoading = false, 300);
        })
      ).subscribe();
      

    } catch (error) {
      console.error('❌ Error initializing home:', error);
      this.isLoading = false;
    }
  }

  checkServiceAvailability() {
    if (!this.currentLocation || !this.currentLocation.lat || !this.currentLocation.lng) {
      this.insideServiceArea = false;
      return;
    }

    this.locationService.getPolygonData().subscribe((res:any)=>{
      if (res && res.data && res.data.polygon) {
        const polygonCoords = res.data.polygon.map((point:any) => ({ lat: point.lat, lng: point.lng }));
        const userLocation = { lat: this.currentLocation.lat, lng: this.currentLocation.lng };
        this.insideServiceArea = this.isPointInPolygon(userLocation, polygonCoords);
      } else {
        this.insideServiceArea = false;
      }
    }, error => {
      console.error('Error fetching polygon data:', error);
      this.insideServiceArea = false;
    });
  }

  isPointInPolygon(point: any, polygon: any[]): boolean {
    let isInside = false;
    const x = point.lat, y = point.lng;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].lng > y) !== (polygon[j].lng > y)) &&
          (x < (polygon[j].lat - polygon[i].lat) * (y - polygon[i].lng) / (polygon[j].lng - polygon[i].lng) + polygon[i].lat)) {
        isInside = !isInside;
      }
    }
    return isInside;
  }

  ionViewDidEnter() {
    const localStr = localStorage.getItem('location');
    if (localStr) {
      try {
        const storedLocation = JSON.parse(localStr);
        console.log('✅ Using Location from LocalStorage');
        this.locationService.setAddress(storedLocation);
      } catch (e) {}
    }
  }

  // --- Data Fetching ---

  homeData(): Observable<any> {
    this.sendFcmToken();
    return this.commonService.getHomeData(this.token).pipe(
      tap((res: any) => {
        this.banners = res.data.banners;
        this.allServices = res.data.services;
        this.slides = this.banners;
        this.addresses = res.data.addresses;
        this.groupedData = this.groupByCategory(this.allServices);
        
        this.resolveUserLocation();
      }),
      catchError(error => {
        console.error('Error fetching home data:', error);
        return of(null); // Let forkJoin complete
      })
    );
  }

  handleRefresh(event: any) {
    // Refresh both home data and active orders on pull-to-refresh
    forkJoin({
      home: this.homeData(),
      orders: this.getActiveOrders()
    }).subscribe({
      next: () => event.target.complete(),
      error: () => {
        event.target.complete();
      }
    });
  }

  sendFcmToken(){
    let params = {
      "fcm_token": localStorage.getItem('FcmToken')
    }
    this.commonService.sendFcmToken(params, this.token).subscribe((res: any) => {
      console.log(res)
    });

  }

  getActiveOrders(): Observable<any> {
    return this.commonService.getActiveOrders(this.token).pipe(
      tap((res: any) => {
        this.orders = res.data;
        this.activeOrderDetails = res.data;
      }),
      catchError(error => {
        console.error('Error fetching active orders:', error);
        return of(null); // Let forkJoin complete
      })
    );
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
    let storedLocation:any;
    const sub = this.locationService.location$.subscribe((res:any)=>{
      storedLocation = res;
    });
    sub.unsubscribe();

    if (!storedLocation) {
      const localStr = localStorage.getItem('location');
      if (localStr) {
        try {
          storedLocation = JSON.parse(localStr);
        } catch(e) {}
      }
    }

    if (storedLocation) {
      console.log('✅ Using Location from LocalStorage');
      this.setAndStoreLocation(storedLocation);
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

      let address = 'Current Location';
      try {
        const result = await this.reverseGeocode(coordinates.coords.latitude, coordinates.coords.longitude);
        if (result) {
          address = result;
        }
      } catch (e) {
        console.error('Reverse geocoding error:', e);
      }

      // Create location object
      const gpsLocation = {
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude,
        address: address,
      };

      this.setAndStoreLocation(gpsLocation);

    } catch (error: any) {
      console.error('GPS Error:', error);
      this.insideServiceArea = false;
    }
  }

  reverseGeocode(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.maps) {
        reject('Google Maps API not loaded');
        return;
      }
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat, lng };
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }

  setAndStoreLocation(data: any) {
    this.locationService.setAddress(data);
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
    this.navCtrl.navigateForward('/layout/example/history')
    // let orderDetails;
    // this.orders.forEach((item: any) => {
    //   let details = JSON.parse(item.details);
    //   if (details.orderId == orderId) {
    //     orderDetails = item;
    //   }
    // });
    // this.navCtrl.navigateRoot('/layout/track-order', {
    //   state: {
    //     orderDetails: orderDetails
    //   }
    // });
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
    // Correct logic: Just return the reduced object
    return data.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      
      // If you want to shuffle the items WITHIN the category:
      // this.shuffleArray(acc[category]); 
      
      return acc;
    }, {} as { [key: string]: any[] });
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