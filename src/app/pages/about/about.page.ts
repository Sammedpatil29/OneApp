import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonFooter, IonText, IonItem, IonSelectOption, IonSelect, IonTextarea, IonList, IonInput, IonCard, IonLabel, IonNote, IonSpinner, IonToast, IonAvatar, IonAlert } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack, chevronForward } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FooterComponent } from "../../components/footer/footer.component";
import { NodataComponent } from "../../components/nodata/nodata.component";
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonAlert, IonAvatar,IonButton, IonToast, IonSpinner, IonNote, IonLabel, IonCard,RouterLink, IonInput, IonList, IonTextarea, IonItem, IonText, IonFooter, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent, NodataComponent,IonSelectOption, IonSelect]
})
export class AboutPage implements OnInit {

  data: any;
  year: any;
  subject = ''
  subjectBody = ''
  token:any
  addresses: any = [
    {
        "lat": "",
        "lng": "",
        "address": "",
        "landmark": "",
        "label": "",
        "house_no": "",
        "building_name": "",
        "receiver_name": "",
        "receiver_contact": "",
        "user": 18
    }
  ]
  name: any = ''
  phone: any = ''
  email: any = ''
  isLoading: boolean = false
  isSpinnerLoading: boolean = false
  isToastOpen: boolean = false
  toastMessage = ''
  isNameEditable: boolean = false
  isEmailEditable: boolean = false
  isPhoneEditable: boolean = false
  appVersion: any
  alertButtons = [
    {
    text: 'CONFIRM DELETE',
    cssClass: 'confirm-button',
    handler: () => {
      console.log('OK clicked');
      this.deleteProfilePermanently();
    },
  },
  ];
  profileData: any = {
    first_name: "",
    profile_image: "",
    email: "",
    phone: ""
  }

  constructor(private router: Router, private navCtrl: NavController, private authService: AuthService, private locationService: LocationService, private profileService: ProfileService ) {
    addIcons({arrowBack,chevronForward});
  }

  async ngOnInit() {
    this.data = this.router.getCurrentNavigation()?.extras.state?.['data'];
    console.log('Passed Data:', this.data);
    this.Addressid = []
    this.Addressid = JSON.parse(localStorage.getItem('location') || '{}');
      console.log(this.Addressid)
    this.getYear()
    this.token = await this.authService.getToken()
    if(this.data == 'Personal Details'){
      this.getProfileData()
    }
    if(this.data == 'About Pintu'){
      const version = await this.profileService.getAppVersion()
      this.appVersion = version
    }
    // this.getAddressList()
  }
  
selectedAddress:any
Addressid:any
  ionViewWillEnter() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.selectedAddress = location.address;
    }

    if(this.data == 'Saved Addresses'){
      this.getAddressList()
    }
  }

  setAddressAsDefault(item:any){
    let data = {
      lat: item.lat,
      lng: item.lng,
      id: item.id,
      label: item.label,
      address: item.address
    }
    localStorage.setItem('location', JSON.stringify(data))
    // this.getAddressList()
    this.Addressid = JSON.parse(localStorage.getItem('location') || '{}');
    console.log(this.Addressid)
  }

  getYear(){
    const TodayDate =new Date()
    this.year = TodayDate.getUTCFullYear()
  }

  goBack() {
    this.navCtrl.back();
  }

  deleteProfilePermanently(){
    console.log(this.token)
    const id = this.profileData.id
    let params = {
      "token": this.token
    }
    this.profileService.deleteProfilePermanently(params, id).subscribe(res=> {
      console.log(res)
      this.authService.logout()
    })
  }
params: any
  updateAddress(type:any){
    if(type == 'name'){
      let params = {
        "first_name": this.name
      }
      this.params = params
    } else if(type == 'email'){
      let params = {
        "email": this.email
    }
    this.params = params
    }
    this.profileService.updateUser(this.params, this.token).subscribe((res)=>{
      this.getProfileData()
      if(type == 'name'){
          this.isNameEditable = false
      } else if(type == 'email'){
          this.isEmailEditable = false
      }
        
    })
  }

  getAddressList(){
    console.log(this.token)
this.isSpinnerLoading = true
    this.locationService.getAddressesList(this.token).subscribe((res:any) => {
        let address = res.data
        this.isSpinnerLoading = false
        this.addresses = address
        this.addresses = [...this.addresses]
        console.log(this.addresses)
        
    }, error => {
      this.addresses = []
      this.isSpinnerLoading = false
      // this.isToastOpen = true
      // this.toastMessage = `No Data `;
      // setTimeout(()=>{
      //   this.isToastOpen = false
      // },3000)
    })
  }

  deleteAddress(id:any){
    
    this.isSpinnerLoading = true
    this.locationService.deleteAddress(this.token, id).subscribe(res => {
      // alert("deleted successfully")
      this.isSpinnerLoading = false
      setTimeout(()=>{
        this.getAddressList()
      })
      this.isToastOpen = true
      this.toastMessage = "deleted successfully";
      setTimeout(()=>{
        this.isToastOpen = false
      },3000)
      
      this.addresses = [...this.addresses]
      console.log(this.addresses)
    })
  }

  postSuggestion(){
    let params = {
      "token": this.token,
      "subject": this.subject,
      "suggesion": this.subjectBody
    }

    if(this.subject.length > 4 && this.subjectBody.length > 5){
      this.isLoading = true
      this.profileService.postSuggestion(params).subscribe(res => {
      this.isToastOpen = true
      this.toastMessage = 'Thanks for the suggestion, we will consider it very siriously!❤️'
      setTimeout(()=> {
        this.isToastOpen = false
      }, 3000)
      this.isLoading = false
      this.subject = ''
      this.subjectBody = ''
    }, error => {
            this.isToastOpen = true
      this.toastMessage = 'error while posting suggestion'
      setTimeout(()=> {
        this.isToastOpen = false
      }, 3000)
      this.isLoading = false
    })
    } else {
      this.isToastOpen = true
      this.toastMessage = 'Atleat 4 charactrs needed in each field'
      setTimeout(()=> {
        this.isToastOpen = false
      }, 3000)
    }
  }

  openLocation(){
    this.navCtrl.navigateForward('/layout/map', {
      state: {data : 'addAddress'}
    })
  }

  nameShort: any;
  nameShorthand(){
  return this.nameShort = this.profileData.first_name.slice(0,2)
}

update(event:any){
  if(event == 'name'){
  this.isNameEditable = false
} else if (event == 'phone'){
  this.isPhoneEditable = false
} else {
  this.isEmailEditable = false
}
}

getProfileData(){
  console.log('triggered')
  this.isLoading = true
  
 this.profileService.getProfileData(this.token).subscribe({
  next: (res:any) => {
    this.profileData = res.user;
    this.isLoading = false;
    this.name = this.profileData.first_name
    this.phone = this.profileData.phone
    this.email = this.profileData.email
    console.log(this.profileData);
  },
  error: (error) => {
    this.isLoading = false;
    alert('Error while fetching data');
    console.error(error);
  }
});
}

}
