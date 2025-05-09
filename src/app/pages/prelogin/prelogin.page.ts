import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app'
import { information } from 'ionicons/icons';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButton, IonContent, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class PreloginPage implements OnInit {
info: any;
isLoading: boolean = true
coords: any;

  constructor(private router: Router, private locationService: LocationService) { }

  ngOnInit() {
    this.getLocation();
  }

  Login(){
    this.router.navigate(['/layout']);
  }

  async getLocation() {
    const coords = await this.locationService.getCurrentPosition();
    this.isLoading = false
    console.log('Coords from component:', coords.coords.latitude);
  }

}
