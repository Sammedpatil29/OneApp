import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
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
import { RegisterFcmService } from 'src/app/services/register-fcm.service';
import { AuthService } from 'src/app/services/auth.service';
import { CustonModalComponent } from 'src/app/components/custon-modal/custon-modal.component';
import { BottomsheetMessageComponent } from 'src/app/components/bottomsheet-message/bottomsheet-message.component';
import { EventsService } from 'src/app/services/events.service';
import { GroceryService } from 'src/app/services/grocery.service';
import { forkJoin } from 'rxjs';

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
  headerBg = 'rgba(255, 255, 255, 0)';

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
  isServiceLoading: boolean = false
  isSpecialDataLoading: boolean = false
  isBannerLoading: boolean = false
  isLocationLoading: boolean = false
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
events: any;
token:any = ''
profileData:any = ''
activeOrderDetails: any;
groceryList:any;
availableServices: any = []

orders: any = [] 

  constructor(private router: Router,private authService: AuthService, private groceryService: GroceryService, private registarFcm: RegisterFcmService, private locationService: LocationService,private profileService: ProfileService, private platform: Platform, private location: Location, private navCtrl: NavController, private commonService: CommonService, private eventService: EventsService) {
    addIcons({arrowBack,home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  this.initialData()
  }

  slides: any = []

  async ngOnInit() {
    await this.getAppVersion()
    this.getBanners()
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

    this.platform.ready().then(() => {
      this.registarFcm.initPush();
    });

    this.token = await this.authService.getToken().then((res:any)=> {
      console.log(res)
        this.token = res
        let params = {
        "token": this.token,
        "fcm_token": localStorage.getItem('FcmToken')
      }
      this.profileService.updateAddress(params, this.profileData.id).subscribe((res)=>{
      console.log('fcm token sent successfully')
    })
    })

    this.token = await this.authService.getToken().then((res:any)=> {
      console.log(res)
        this.token = res
        let params = {
        "token": this.token
      }
      this.commonService.getActiveOrders(params).subscribe((res)=>{
    this.orders = res
    this.activeOrderDetails = []
    this.orders.forEach((item:any)=> {
        let Json = {}
        let details = JSON.parse(item.details)
        Json = {
          "orderId": details.orderId,
          "status": item.status
        }
        this.activeOrderDetails.push(Json)
    })
    console.log(this.activeOrderDetails)
    console.log(this.orders)
  })
    })

   this.loadData()

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
      this.latestVersion = this.metaData[2].latest_version
      this.fileName = `OneApp-${this.latestVersion}`
      this.fileUrl = this.metaData[2].download_link
      console.log(this.latestVersion)
      // if(this.metaData[2].video.message === 'true'){
      //   let item = {
      //     'title': this.metaData[2].video.Header,
      //     'body': this.metaData[2].video.Content
      //   }
        // this.openItemModal('item')
      // }
    })
  }

  initialData(){
    this.isLoading = true
    this.isServiceLoading = true
      forkJoin({
        allServices: this.locationService.getData(),
        metaData: this.commonService.getMetaData()
      }).subscribe((res:any)=> {
        this.allServices = res.allServices
        this.metaData = res.metaData
        this.groupedData = this.groupByCategory(this.allServices);
        this.checkServices()
          console.log(this.groupedData)
          this.isLoading = false
          this.isServiceLoading = false
      this.latestVersion = this.metaData[2].latest_version
      this.fileName = `OneApp-${this.latestVersion}`
      this.fileUrl = this.metaData[2].download_link
      }, error => {
        this.isServiceLoading = false
        this.isLoading = false
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
    this.router.navigate(['/layout/address-list'], {
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
      this.isServiceLoading = true
      this.locationService.getData().subscribe((res)=> {
          this.allServices = res
          this.groupedData = this.groupByCategory(this.allServices);
          console.log(this.groupedData)
          this.isServiceLoading = false
      }, error => {

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

getBanners(){
  this.isBannerLoading = true
  this.profileService.getBanners('hometop').subscribe((res:any)=>{
this.slides = res.filter((item: { is_active: any; }) => item.is_active);
this.isBannerLoading = false
      console.log(this.slides)
  })
}

navigateFromSlide(route:any){
  this.navCtrl.navigateForward(`${route}`)
}

closeFlashOffer(){
  this.isFlashOfferVisible = false;
}

goToOrderDetails(orderId:any){
  let orderDetails;
  this.orders.forEach((item:any)=>{
    let details = JSON.parse(item.details)
    if(details.orderId == orderId){
      orderDetails = item
    }
  })
  this.navCtrl.navigateRoot('/layout/track-order', {
            state: {
              orderDetails: orderDetails
            }
          });
}

onScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    const maxScroll = 150; // point at which it becomes fully white

    // Calculate opacity between 0 and 1
    let opacity = Math.min(scrollTop / maxScroll, 1);

    this.headerBg = `rgba(255, 255, 255, ${opacity})`;
  }
  
  getEvents(){
    let params = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJwaG9uZSI6Iis5MTk1OTE0MjAwNjgiLCJ1c2VyX25hbWUiOiJzYW1tZWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTQ2MDI4Mn0.tO4XklsZN3Qw4QLHNctoEgW59dk3pOWAeF7qO8Imv8s"
    }
      this.eventService.getEvents(params).subscribe((res)=>{
        this.events = res
        console.log(this.events)
      }, error => {
      })
  }

  getGroceryList() {
    let params = {
      token: this.token,
    };
    this.isLoading = true;
    this.groceryService.getGroceryList(params).subscribe(
      (res:any) => {
        this.groceryList = res.slice(0,7);
      },
      (error:any) => {
        this.isLoading = false;
      }
    );
  }

  loadData() {
  this.isSpecialDataLoading = true;
  let params = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJwaG9uZSI6Iis5MTk1OTE0MjAwNjgiLCJ1c2VyX25hbWUiOiJzYW1tZWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTQ2MDI4Mn0.tO4XklsZN3Qw4QLHNctoEgW59dk3pOWAeF7qO8Imv8s"
    }

  forkJoin({
    events: this.eventService.getEvents(params),
    groceryList: this.groceryService.getGroceryList(params),
  }).subscribe({
    next: (res:any) => {
      this.events = res.events;
      this.groceryList = res.groceryList.slice(0, 7); // Slice as you did before
      this.isSpecialDataLoading = false;
      console.log('Events:', this.events);
      console.log('Grocery List:', this.groceryList);
    },
    error: (err:any) => {
      console.error('Error loading data:', err);
      this.isSpecialDataLoading = false;
    }
  });
}

gotoGrocery(){
  this.navCtrl.navigateForward('/layout/grocery')
}

gotoEvents(){
  this.navCtrl.navigateForward('/layout/events')
}

checkServices(){
  this.allServices.forEach((item:any)=>{
    this.availableServices.push(item.title)
  })
}

}
