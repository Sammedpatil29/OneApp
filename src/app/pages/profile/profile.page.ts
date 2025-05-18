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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonAvatar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {
profileData: any;
user_id: any;
isLoading: boolean = false
showRetry: boolean = false
nameShort = ''
  constructor(private router: Router, private navCtrl: NavController, private authService:AuthService, private profileService: ProfileService) {
      addIcons({arrowBack}); 
          

  }

 async ngOnInit() {
 await this.getUserId()
this.getProfileData()

  }

  async logOut(){
    this.authService.logout();
  }

  goBack() {
    this.navCtrl.back();
  }

  openDetails(option: any) {
  this.router.navigate(['/layout/about'], {
    state: { data: option }
  });
}

async getUserId(){
  this.user_id = await Preferences.get({key: 'user_id'})
}

 getProfileData(){
  console.log(this.user_id)
  this.isLoading = true
 this.profileService.getProfileData(this.user_id).subscribe(res=>{
this.profileData = res
this.isLoading = false
console.log(this.profileData)
  }, error => {
    this.isLoading = false
    this.showRetry = true
    alert('error while fetching data')
  })
}

async retry(){
  this.showRetry = false
await this.getUserId()
this.getProfileData()
}

nameShorthand(){
  return this.nameShort = this.profileData.first_name.slice(0,2)
  
}

}
