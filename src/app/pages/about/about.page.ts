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
  addresses: any
  name: any = ''
  phone: any = ''
  email: any = ''
  isLoading: boolean = false
  isToastOpen: boolean = false
  toastMessage = ''
  isNameEditable: boolean = false
  isEmailEditable: boolean = false
  isPhoneEditable: boolean = false
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
    this.getYear()
    this.token = await this.authService.getToken()
    if(this.data == 'Personal Details'){
      this.getProfileData()
    }
    // this.getAddressList()
  }
selectedAddress:any
  ionViewWillEnter() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.selectedAddress = location.address;
    }
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
    let params = {
      "token": this.token
    }
    this.profileService.deleteProfilePermanently(params).subscribe(res=> {
      console.log(res)
      this.authService.logout()
    })
  }

  getAddressList(){
    console.log(this.token)
    let params = {
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxNiwicGhvbmUiOiI5NTkxNDIwMDY4IiwiaWF0IjoxNzQ3NzQzNDI3fQ.0UHfpATSf_fxUIEwXDLQPf7S3n2dGdqgnmjkMo5zdkQ"
}
    this.locationService.getAddressesList(params).subscribe(res => {
        let address = res
        this.addresses = address
        console.log(this.addresses)
    }, error => {
      alert("error")
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
    this.router.navigate(['/layout/map'], {
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
  let params = {
    "token": this.token
  }
 this.profileService.getProfileData(params).subscribe({
  next: (res) => {
    this.profileData = res;
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
