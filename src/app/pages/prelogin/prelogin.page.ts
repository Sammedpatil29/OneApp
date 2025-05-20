import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner, IonModal, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app'
import { information, arrowBack } from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButtons, IonModal, IonSpinner, IonButton, IonContent, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class PreloginPage implements OnInit {
info: any;
isLoading: boolean = true
coords: any;
apiData: any;
isModalOpen: boolean = false
tokenDecoded: any;
loadingMessage = ''

  constructor(private navCtrl: NavController,private router: Router, private locationService: LocationService, private authService: AuthService) {
    // this.locationService.getData().subscribe((res) => {
    //   this.apiData = res
    //   console.log(this.apiData)
    // })
    addIcons({arrowBack});
   }

  ngOnInit() {
    this.getLocation();
    this.verifyToken()
  }

  Login(){
    this.router.navigate(['/layout']);
  }

  openLogin() {
    this.router.navigate(['/login'])
  }

  goBack() {
    this.navCtrl.back();
  }

  async getLocation() {
    // this.isLoading = true
    this.loadingMessage = 'fetching Location...'
    const coords = await this.locationService.getCurrentPosition();
    // this.isLoading = false
    console.log('Coords from component:', coords.coords.latitude);
  }

token:any;
  async verifyToken(){
    this.loadingMessage = 'verifying user...'
    this.token = await this.authService.getToken()
    // console.log(this.authService.getToken().__zone_symbol__value)
    console.log(this.token)
    let params = {
      "token": this.token
    }
    this.authService.verifyToken(params).subscribe(res => {
      this.tokenDecoded = res
      console.log(res)
      if(this.tokenDecoded.valid == true){
        this.router.navigate(['/layout/example/home'])
        setTimeout(()=> {
            this.router.navigate(['/layout/example/home'])
        }, 3000)

      } else {
this.isLoading = false
      }
    }, error => {
      this.isLoading = false
    })
  }

}
