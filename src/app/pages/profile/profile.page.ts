import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonLabel, IonItem, IonIcon, IonButton, IonButtons, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile.service';

interface Profile {
  profile_image : string,
  first_name: string,
  phone: string
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonAvatar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
profileData: any = {
  "profile_image" : "",
  "first_name": "",
  "phone": ""
}
token: any;
isLoading: boolean = false
showRetry: boolean = false
nameShort = ''
  constructor(private router: Router, private navCtrl: NavController, private authService:AuthService, private profileService: ProfileService) {
      addIcons({arrowBack}); 
          

  }

 async ngOnInit() {
  try {
    this.token = await this.authService.getToken();

    if (this.token) {
      this.getProfileData();
    } else {
      console.error('Token is null or invalid');
    }
  } catch (err) {
    console.error('Error getting token:', err);
  }
}

  async logOut(){
    this.profileData = {}
    this.authService.logout();
  }

  goBack() {
    this.navCtrl.back();
  }

  openDetails(option: any) {
  this.navCtrl.navigateForward(['/layout/about'], {
    state: { data: option }
  });
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
    console.log(this.profileData);
  },
  error: (error) => {
    this.isLoading = false;
    this.showRetry = true;
    alert('Error while fetching data');
    console.error(error);
  }
});
}

async retry(){
  this.showRetry = false
this.token = await this.authService.getToken()
this.getProfileData()
}

nameShorthand(){
  return this.nameShort = this.profileData.first_name.slice(0,2)
}

}
