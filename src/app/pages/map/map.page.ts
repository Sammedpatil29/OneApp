import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter, IonButton, IonButtons, IonIcon, IonSearchbar, IonModal, IonList, IonItem, IonLabel, IonNote, IonText, IonInput, IonChip, IonSpinner } from '@ionic/angular/standalone';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Preferences } from '@capacitor/preferences';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import { NodataComponent } from "../../components/nodata/nodata.component";

declare const google: { maps: {
  places: any;
  geometry: any;
  Polygon: any; LatLng: new (arg0: number, arg1: number) => any; Map: new (arg0: any, arg1: { center: any; zoom: number; disableDefaultUI: boolean; }) => any; event: { addListener: (arg0: any, arg1: string, arg2: () => void) => void; }; Geocoder: new () => any; 
}; };;
@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonSpinner, CommonModule, IonChip, IonInput, IonText, IonNote, IonLabel, IonItem, IonList, IonModal, IonSearchbar, IonIcon, IonButtons, IonButton, IonFooter, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, NodataComponent]
})
export class MapPage implements AfterViewInit, OnInit {

  // constructor() { }
autocompleteService = new google.maps.places.AutocompleteService();
   @ViewChild('map', { static: false }) mapElement!: ElementRef;
   @ViewChild('search', { static: false }) searchElement!: ElementRef;
  map: any;
  currentAddress: string = '';
  centerCoords: any;
  latLng:any;
  houseNo:any;
  HouseName:any;
  landmark:any;
  isModalOpen:boolean = false
  isLoading:boolean = false
  user_id = ""
  selectedLabel = ''
  isDisabled: boolean = false
  token: any
  receiverName = ''
  receiverContact = ''
  isSearchModalOpen: boolean = false
  searchedAddresses: any
  suggestions: any[] = []
  zoom: any = 14
  cityCenter = new google.maps.LatLng(16.715316578418758, 75.05882421691895);
  polygonCoords: google.maps.LatLngLiteral[] = [
    { lat: 16.721820, lng: 75.041123 }, 
    { lat: 16.731534, lng: 75.044394 },
    { lat: 16.733517, lng: 75.050348},
    { lat: 16.736431, lng: 75.062371},
    { lat: 16.727415, lng: 75.075158},
    { lat: 16.716180, lng: 75.073141},
    { lat: 16.704540, lng: 75.067789},
    { lat: 16.709470, lng: 75.055160},
    { lat: 16.714950, lng: 75.044911},
  ];
  mapImgUrl: any;

  constructor(private navCtrl: NavController, private locationService: LocationService, private authService: AuthService){
    addIcons({arrowBack});
  }

async ngOnInit() {
    this.token = await this.authService.getToken()
}  

  ngAfterViewInit() {
    this.getLocationFromLocalStorage()
    this.loadMap();
  }

  handleModalClose(){
    this.isModalOpen = false
  }

  chipSelected(event:any){
    console.log(event)
    this.selectedLabel = event
  }

  createAddress(){
    let params = {
        "lat": this.centerCoords.lat(),
        "lng": this.centerCoords.lng(),
        "address": this.currentAddress,
        "landmark": this.landmark,
        "label": this.selectedLabel,
        "house_no": this.houseNo,
        "building_name": this.HouseName,
        "receiver_name": this.receiverName,
        "receiver_conatact": this.receiverContact,
        "token": this.token
    }
    this.isLoading = true
    this.locationService.saveAddress(params).subscribe(res=> {
      console.log(res)
      this.isLoading = false
      this.isModalOpen = false
      this.goBack()
    }, error => {
      this.isLoading = false
    })
  }

  backtoServiceArea(){
        this.latLng = new google.maps.LatLng(16.715316578418758, 75.05882421691895); // Default coords
        this.zoom = 14
        this.loadMap()
  }

  async getCurrentLocation(){
    await this.locationService.getCurrentPosition().then(res => {
console.log(res)
this.latLng = new google.maps.LatLng(res.coords.latitude, res.coords.longitude);
this.zoom = 19
this.loadMap()
    })
  }

  getLocationFromLocalStorage() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      // this.ad = location.address;
      this.latLng = new google.maps.LatLng(location.lat, location.lng)
    }
  }

  loadMap() { 
    // this.latLng = new google.maps.LatLng(16.715316578418758, 75.05882421691895); // Default coords

    const mapOptions = {
      center: this.latLng,
      zoom: this.zoom,
      disableDefaultUI: true
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    const serviceArea = new google.maps.Polygon({
  paths: this.polygonCoords,
  strokeColor: 'black',
  strokeOpacity: 0.8,
  strokeWeight: 1,
  fillColor: 'orange',
  fillOpacity: 0.35,
});

serviceArea.setMap(this.map);

    google.maps.event.addListener(this.map, 'idle', () => {
      this.centerCoords = this.map.getCenter();
      this.getAddressFromCoords(this.centerCoords.lat(), this.centerCoords.lng());
    });
  }

  getAddressFromCoords(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results:any, status:any) => {
      if (status === 'OK' && results[0]) {
        this.currentAddress = results[0].formatted_address;
        console.log(lat,lng)
        this.checkIfInsideServiceArea(lat, lng)
      } else {
        this.currentAddress = 'Address not found';
      }
    });
  }
locationData:any;
  confirmLocation() {
    console.log('Selected location:', {
      lat: this.centerCoords.lat(),
      lng: this.centerCoords.lng(),
      address: this.currentAddress
    });
    // Preferences.set({key: 'location', value: JSON.stringify(this.currentAddress)})
    let LocationObject = {
    lat: this.centerCoords.lat(),
    lng: this.centerCoords.lng(),
    address: this.currentAddress
}
    localStorage.setItem('location', JSON.stringify(LocationObject))
this.locationData = localStorage.getItem('location');
const location = JSON.parse(this.locationData)
console.log(location.address)
// this.goBack()
this.mapImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${this.centerCoords.lat()},${this.centerCoords.lng()}&zoom=17&size=600x200&markers=color:red%7C${this.centerCoords.lat()},${this.centerCoords.lng()}&key=AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0`
this.isModalOpen = true
    // Pass data to parent or store
  }

  checkIfInsideServiceArea(lat: number, lng: number) {
  const point = new google.maps.LatLng(lat, lng);
  const polygon = new google.maps.Polygon({ paths: this.polygonCoords });

  const inside = google.maps.geometry.poly.containsLocation(point, polygon);

  if (inside) {
    console.log('✅ Location is inside service area');
  } else {
    console.warn('❌ Location is outside service area');
  }

  return inside;
}

  goBack() {
    this.navCtrl.back();
  }

  changeSelectedAddress(){
    this.isModalOpen = false
  }

  openSearchLocationTab(){
    // this.searchLocation()
    this.isSearchModalOpen = true
  }

  onSearchChange(event: any) {
    const input = event.detail.value;

    if (!input || input.length < 3) {
      this.suggestions = [];
      return;
    }

    this.autocompleteService.getPlacePredictions(
      {
        input,
        types: ['geocode'],
        componentRestrictions: { country: 'in' },
        location: this.cityCenter,
        radius: 50000,
      },
      (predictions:any, status:any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          this.suggestions = predictions.slice(0, 5);
        } else {
          this.suggestions = [];
        }
      }
    );
  }

}
