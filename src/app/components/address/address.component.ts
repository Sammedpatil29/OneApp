import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonSearchbar, IonRow, IonCol, IonGrid, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonContent } from "@ionic/angular/standalone";
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { LocationService } from 'src/app/services/location.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Http } from '@capacitor-community/http';
import { NodataComponent } from "../nodata/nodata.component";
import { AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  imports: [IonContent, IonItem, IonList, FormsModule, CommonModule, IonLabel, IonSegmentButton, IonSegment, IonTitle, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader, IonGrid, IonCol, IonRow, IonSearchbar, IonSegment, IonSegmentButton, NodataComponent]
})
export class AddressComponent  implements AfterViewInit{
   @ViewChild('map', { static: false }) mapElement!: ElementRef;
  map!: google.maps.Map;
  @Output() location = new EventEmitter<any>();
  coordinates: any = []
  city: any = ''
  address: any = ''
  searchResults: any[] = [];
  searchQuery: string = '';
  isLoading: boolean = false
  showMap: boolean = false
  polygonCoords: google.maps.LatLngLiteral[] = [
    { lat: 16.721820, lng: 75.041123 }, // Mumbai (example)
    { lat: 16.731534, lng: 75.044394 },
    { lat: 16.733517, lng: 75.050348},
    { lat: 16.736431, lng: 75.062371},
    { lat: 16.727415, lng: 75.075158},
    { lat: 16.716180, lng: 75.073141},
    { lat: 16.704540, lng: 75.067789},
    { lat: 16.709470, lng: 75.055160},
    { lat: 16.714950, lng: 75.044911},
  ];



  constructor(private http: HttpClient, private locationService: LocationService, private router: Router) { }

  

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
      alert('api failed')
      this.isLoading = false
    } finally {
      console.log('Request completed.');
    }
  }

ngAfterViewInit(){}

  initMap() {
    this.showMap = true
    const center = { lat: 16.724030, lng: 75.060455 };

  // 1. Initialize the map
  this.map = new google.maps.Map(this.mapElement.nativeElement, {
    center: center,
    zoom: 14,
    disableDefaultUI: true,
    mapId: 'YOUR_MAP_ID', // Optional, for custom styling
  });

  // 2. Draw polygon
  const serviceArea = new google.maps.Polygon({
    paths: this.polygonCoords,
    strokeColor: 'black',
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: 'orange',
    fillOpacity: 0.25,
  });

  serviceArea.setMap(this.map);
    const draggableMarker = new google.maps.marker.AdvancedMarkerElement({
    map: this.map,
    position: center,
    gmpDraggable: true,
    title: 'Drag me to select a location',
  });

  // 4. Handle drag end
  draggableMarker.addListener('dragend', (event: any) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    console.log('Dragged to:', newLat, newLng);

    // Optional: Check if the location is inside the polygon
    const point = new google.maps.LatLng(newLat, newLng);
    const isInside = google.maps.geometry.poly.containsLocation(point, serviceArea);

    if (isInside) {
      console.log('Marker is inside the serviceable area ✅');
    } else {
      console.warn('Marker is outside the serviceable area ❌');
    }
  });
  }

  navigateToMap(){
    this.router.navigate(['/layout/map'])
  }

  

}
