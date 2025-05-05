import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonSearchbar, IonRow, IonCol, IonGrid, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonSegment, IonSegmentButton, IonLabel } from "@ionic/angular/standalone";
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [IonLabel, IonSegmentButton, IonSegment, IonTitle, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader, IonGrid, IonCol, IonRow, IonSearchbar, IonSegment, IonSegmentButton]
})
export class AddressComponent  implements OnInit {
  @Output() location = new EventEmitter<any>();
  coordinates: any = []
  city: any = ''
  address: any = ''
  constructor(private http: HttpClient) { }

  ngOnInit() {}

  async getCurrentPosition() {
    this.coordinates = await Geolocation.getCurrentPosition();
    this.getAddress(this.coordinates.coords.latitude, this.coordinates.coords.longitude)
    console.log('Current position:', this.coordinates);
  }

  getAddress(lat: number, lng: number) {
    const apiKey = '7aa0aa489c7246e388e62965c4154f6b';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
  
    this.http.get(url).subscribe((data: any) => {
      const components = data.results[0].components;
       this.city = components.city || components.town || components.village;
       this.address = data.results[0].formatted;
       let locationDetails = {
        city: this.city,
        address: this.address
       }
       this.location.emit(locationDetails);
       
      console.log('City:', this.city);
      console.log('Full Address:', this.address);
    });
  }
  

}
