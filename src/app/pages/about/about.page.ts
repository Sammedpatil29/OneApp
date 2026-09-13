import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSkeletonText, IonButton, IonButtons, IonIcon, IonFooter, IonText, IonItem, IonList, IonInput, IonLabel, IonNote, IonSpinner, IonToast, IonAvatar, IonAlert } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { NavController } from '@ionic/angular';
import { 
  arrowBack, 
  arrowBackOutline, 
  chevronForward,
  checkmarkCircle,
  checkmark,
  sunnyOutline,
  moonOutline,
  phonePortraitOutline,
  bulbOutline,
  cartOutline,
  bicycleOutline,
  sparklesOutline,
  heartOutline,
  informationCircleOutline,
  settingsOutline,
  languageOutline,
  colorPaletteOutline,
  sendOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { FooterComponent } from "../../components/footer/footer.component";
import { NodataComponent } from "../../components/nodata/nodata.component";
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { ProfileService } from 'src/app/services/profile.service';
import { AppDialogService } from 'src/app/services/app-dialog.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonAlert, IonAvatar, IonButton, IonToast, IonSkeletonText, IonSpinner, IonNote, IonLabel, IonInput, IonList, IonItem, IonText, IonFooter, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent, NodataComponent]
})
export class AboutPage implements OnInit {

  data: any;
  year: any;
  subject = ''
  subjectBody = ''
  token:any

  suggestionCategory: string = 'Product';
  suggestionCategories: string[] = [
    'Product',
    'Service'
  ];

  selectedLanguage: string = 'en';
  selectedTheme: string = 'system';

  languages = [
    { code: 'en', name: 'English', nativeName: 'English', subtitle: 'Standard language' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', subtitle: 'Regional language' },
    { code: 'hi', name: 'Jawari Kannada', nativeName: 'ಜವಾರಿ', subtitle: 'National language' }
  ];

  themes = [
    { id: 'light', name: 'Light Mode', subtitle: 'Crisp and bright display', icon: 'sunny-outline' },
    { id: 'dark', name: 'Dark Mode', subtitle: 'Gentle & power efficient', icon: 'moon-outline' },
    { id: 'system', name: 'System Default', subtitle: 'Matches device appearance', icon: 'phone-portrait-outline' }
  ];

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

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    private locationService: LocationService,
    private profileService: ProfileService,
    private dialogService: AppDialogService
  ) {
    addIcons({arrowBack, arrowBackOutline, chevronForward});
    addIcons({
      arrowBack, 
      arrowBackOutline, 
      chevronForward,
      checkmarkCircle,
      checkmark,
      sunnyOutline,
      moonOutline,
      phonePortraitOutline,
      bulbOutline,
      cartOutline,
      bicycleOutline,
      sparklesOutline,
      heartOutline,
      informationCircleOutline,
      settingsOutline,
      languageOutline,
      colorPaletteOutline,
      sendOutline
    });
  }

  async ngOnInit() {
    this.data = this.router.getCurrentNavigation()?.extras.state?.['data'] || history.state?.data;
    console.log('Passed Data:', this.data);
    if (this.data === 'settings' || this.data === 'language' || this.data === 'Languages' || this.data === 'Preferences') {
      this.data = 'App Settings';
    }
    this.initSettings();

    this.Addressid = this.locationService.location$.subscribe((res:any)=>{
      this.Addressid = res
      console.log('address set as', this.Addressid)
    })
    this.getYear()
    this.token = await this.authService.getToken()
    if(this.data == 'Personal Details'){
      this.getProfileData()
    }
    if(this.data == 'About Pintu' || this.data == 'App Settings'){
      const version = await this.profileService.getAppVersion()
      this.appVersion = version
    }
    if(this.data == 'Saved Addresses'){
      this.getAddressList()
    }
  }
  
selectedAddress:any
Addressid:any
  ionViewWillEnter() {
    const locationData = this.locationService.location$.subscribe((res:any)=>{
      this.Addressid = res
    });
    if (this.Addressid) {
      const location = this.Addressid;
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
    this.locationService.setAddress(data)
    localStorage.setItem('location', JSON.stringify(data))
    // this.getAddressList()
    // this.Addressid = JSON.parse(localStorage.getItem('location') || '{}');
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

  async deleteAddress(id: any) {
    const confirmed = await this.dialogService.showDangerConfirm({
      title: 'Delete Address?',
      message: 'Are you sure you want to delete this address?\nThis action cannot be undone.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    this.isSpinnerLoading = true;
    this.locationService.deleteAddress(this.token, id).subscribe({
      next: () => {
        this.isSpinnerLoading = false;
        this.getAddressList();
        this.dialogService.showToast('Address deleted successfully', 'success');
      },
      error: () => {
        this.isSpinnerLoading = false;
        this.dialogService.showToast('Failed to delete address', 'danger');
      }
    });
  }

  getPageTitle(): string {
    if (this.data === 'suggestion') return 'Suggest a Product or Service';
    if (this.data === 'App Settings') return 'App Settings';
    if (this.data === 'terms' || this.data === 'Terms & Conditions') return 'Terms & Conditions';
    if (this.data === 'privacy' || this.data === 'Privacy Policy') return 'Privacy Policy';
    return this.data || 'About Pintu';
  }

  selectCategory(category: string) {
    this.suggestionCategory = category;
  }

  initSettings() {
    this.selectedLanguage = localStorage.getItem('pintu_language') || 'en';
    this.selectedTheme = localStorage.getItem('pintu_theme') || 'system';
  }

  setLanguage(code: string) {
    this.selectedLanguage = code;
    localStorage.setItem('pintu_language', code);
    const lang = this.languages.find(l => l.code === code);
    this.dialogService.showToast(`Language set to ${lang?.name || code}`, 'success');
  }

  setTheme(themeId: string) {
    this.selectedTheme = themeId;
    localStorage.setItem('pintu_theme', themeId);
    this.applyTheme(themeId);
    const themeObj = this.themes.find(t => t.id === themeId);
    this.dialogService.showToast(`Theme updated: ${themeObj?.name}`, 'success');
  }

  applyTheme(themeId: string) {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (themeId === 'dark' || (themeId === 'system' && prefersDark)) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  async postSuggestion() {
    if (!this.subject.trim()) {
      this.dialogService.showToast('Please enter a short subject / title', 'warning');
      return;
    }
    if (!this.subjectBody.trim()) {
      this.dialogService.showToast('Please describe your suggestion', 'warning');
      return;
    }

    this.isLoading = true;
    const params = {
      token: this.token,
      type: this.suggestionCategory,
      category: this.suggestionCategory,
      title: this.subject.trim(),
      subject: this.subject.trim(),
      details: this.subjectBody.trim(),
      suggestion: this.subjectBody.trim(),
      orderService: `Suggestion: ${this.suggestionCategory}`
    };

    this.profileService.postSuggestion(params, this.token).subscribe({
      next: async (res: any) => {
        this.isLoading = false;
        this.subject = '';
        this.subjectBody = '';
        await this.dialogService.showAlert(
          'Suggestion Submitted! 🎉',
          'Thank you for your valuable feedback! Our team reviews every idea to bring the best experience to Pintu.',
          'success',
          'Done'
        );
        this.goBack();
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Post suggestion error:', error);
        this.dialogService.showToast(error?.error?.message || 'Error while submitting suggestion', 'danger');
      }
    });
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
