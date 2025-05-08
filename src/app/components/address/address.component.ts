import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonSearchbar, IonRow, IonCol, IonGrid, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem } from "@ionic/angular/standalone";
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { LocationService } from 'src/app/services/location.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Http } from '@capacitor-community/http';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [IonItem, IonList, FormsModule, CommonModule, IonLabel, IonSegmentButton, IonSegment, IonTitle, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader, IonGrid, IonCol, IonRow, IonSearchbar, IonSegment, IonSegmentButton]
})
export class AddressComponent  implements OnInit {
  @Output() location = new EventEmitter<any>();
  coordinates: any = []
  city: any = ''
  address: any = ''
  searchResults: any[] = [];
  searchQuery: string = '';
  isLoading: boolean = false
  constructor(private http: HttpClient, private locationService: LocationService) { }

  ngOnInit() {}

  async getCurrentPosition() {
    this.locationService.getCurrentPosition()
  }

  async searchLocation(query: string) {
    this.searchResults = []
    console.log(query)
    if (!query) return;
  
    const apiKey = 'AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0';
    const googlePlacesApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;
    http://maps.googleapis.com/maps/api/js?key=my_api_key&amp;libraries=places
    try {
      this.isLoading = true
      const response = await Http.request({
        method: 'GET',
        url: googlePlacesApiUrl,
      });
      this.isLoading = false
      console.log('Search Results:', response.data.results);
      this.searchResults = response.data.results;
    } catch (error) {
      console.error('Error fetching places data:', error);
    } finally {
      console.log('Request completed.');
    }
  }

}
