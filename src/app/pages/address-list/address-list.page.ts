import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonSpinner, IonText, IonNote, IonItem, IonLabel, IonIcon, IonButtons, IonList } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NodataComponent } from "src/app/components/nodata/nodata.component";
import { NavController } from '@ionic/angular';
import { arrowBack, chevronForward } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth.service';
import { LocationService } from 'src/app/services/location.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.page.html',
  styleUrls: ['./address-list.page.scss'],
  standalone: true,
  imports: [IonList, IonButtons, IonIcon, IonLabel, IonItem, IonNote, IonText, IonSpinner, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, NodataComponent]
})
export class AddressListPage implements OnInit {
isSpinnerLoading: boolean = false
Addressid:any
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
  token:any = ''
  isToastOpen: boolean = false
  toastMessage = ''

  constructor(private router: Router, private navCtrl: NavController , private authService: AuthService, private locationService: LocationService, private profileService: ProfileService) {
    addIcons({arrowBack,chevronForward});
   }

  async ngOnInit() {
    this.Addressid = []
    this.Addressid = JSON.parse(localStorage.getItem('location') || '{}');
      console.log(this.Addressid)
    this.token = await this.authService.getToken()
  }

  selectedAddress:any
  ionViewWillEnter() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.selectedAddress = location.address;
    }

      this.getAddressList()
  }

  openLocation() {
    this.router.navigate(['/layout/map'], {
      state: {data : 'home'}
    })
  }

  goBack() {
    this.navCtrl.back();
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

  deleteAddress(id:any){
    let params = {
      "token": this.token
    }
    this.isSpinnerLoading = true
    this.locationService.deleteAddress(params, id).subscribe(res => {
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

  getAddressList(){
    console.log(this.token)
    let params = {
  "token": this.token
}
this.isSpinnerLoading = true
    this.locationService.getAddressesList(params).subscribe(res => {
        let address = res
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

}
