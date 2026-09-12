import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonModal,
  IonFooter,
  IonToast,
  NavController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  locateOutline,
  refreshOutline,
  searchOutline,
  closeCircle,
  location,
  locationOutline,
  checkmarkCircle,
  homeOutline,
  briefcaseOutline,
  bookmarkOutline,
  navigateOutline
} from 'ionicons/icons';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonSpinner,
    IonModal,
    IonFooter,
    IonToast
  ]
})
export class MapPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  map: any;
  currentAddress = '';
  mainAreaName = '';
  latLng: any;
  inside = true;
  isPolygonLoading = false;
  isDragging = false;
  isSaving = false;
  isLoading = false;
  isModalOpen = false;
  isToastOpen = false;
  toastMessage = '';

  // Google Places Autocomplete
  autocompleteService: any;
  searchQuery = '';
  predictions: any[] = [];
  isSearching = false;

  // Form Model
  houseNo = '';
  landmark = '';
  selectedLabel = 'home';
  mapImgUrl = '';
  buildingName = '';
  receiverName = '';
  receiverPhone = '';

  polygonCoords: any[] = [];
  token: any;
  servicePolygon: any;
  routeSource: any;
  serviceAreaData: any;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    addIcons({
      arrowBackOutline,
      locateOutline,
      refreshOutline,
      searchOutline,
      closeCircle,
      location,
      locationOutline,
      checkmarkCircle,
      homeOutline,
      briefcaseOutline,
      bookmarkOutline,
      navigateOutline
    });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    this.routeSource = history.state?.data;
    this.fetchServiceArea();
  }

  ngAfterViewInit() {
    this.initializeLocation();
  }

  fetchServiceArea() {
    this.locationService.getPolygonData().subscribe({
      next: (res: any) => {
        this.serviceAreaData = res?.data;
        this.polygonCoords = res?.data?.polygon || [];
        this.isPolygonLoading = false;
        if (this.map && this.serviceAreaData) {
          this.renderPolygon(this.serviceAreaData);
          const center = this.map.getCenter();
          if (center) {
            this.validateServiceArea(center.lat(), center.lng());
          }
        }
      },
      error: () => {
        this.isPolygonLoading = false;
      }
    });
  }

  initializeLocation() {
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (parsed?.lat && parsed?.lng) {
          this.latLng = new google.maps.LatLng(parsed.lat, parsed.lng);
        } else {
          this.latLng = new google.maps.LatLng(16.7153, 75.0588);
        }
      } catch (e) {
        this.latLng = new google.maps.LatLng(16.7153, 75.0588);
      }
    } else {
      this.latLng = new google.maps.LatLng(16.7153, 75.0588);
    }

    this.setupMap();
    this.getCurrentLocation(false);
  }

  setupMap() {
    if (!this.mapElement?.nativeElement || typeof google === 'undefined') return;

    const mapOptions = {
      center: this.latLng || new google.maps.LatLng(16.7153, 75.0588),
      zoom: 16,
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: 'greedy'
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    // Initialize Autocomplete Service
    if (google.maps?.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    if (this.serviceAreaData) {
      this.renderPolygon(this.serviceAreaData);
    }

    // Map drag and movement events
    google.maps.event.addListener(this.map, 'dragstart', () => {
      this.ngZone.run(() => {
        this.isDragging = true;
        this.predictions = [];
      });
    });

    google.maps.event.addListener(this.map, 'idle', () => {
      this.ngZone.run(() => {
        this.isDragging = false;
        const center = this.map.getCenter();
        if (center) {
          this.updateLocationInfo(center.lat(), center.lng());
        }
      });
    });
  }

  renderPolygon(data: any) {
    if (!this.map || !this.polygonCoords || this.polygonCoords.length === 0) return;

    if (this.servicePolygon) {
      this.servicePolygon.setMap(null);
    }

    this.servicePolygon = new google.maps.Polygon({
      paths: this.polygonCoords,
      strokeColor: data.border_color || '#a000e2',
      strokeOpacity: 0.85,
      strokeWeight: 2.5,
      fillColor: data.inside_color || '#a000e2',
      fillOpacity: 0.1,
      map: this.map
    });
  }

  updateLocationInfo(lat: number, lng: number) {
    if (typeof google === 'undefined') return;
    const geocoder = new google.maps.Geocoder();
    this.isPolygonLoading = true;

    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          this.currentAddress = results[0].formatted_address;
          this.extractMainAreaName(results[0]);
          this.validateServiceArea(lat, lng);
        } else {
          this.currentAddress = 'Unable to fetch address';
        }
        this.isPolygonLoading = false;
      });
    });
  }

  extractMainAreaName(result: any) {
    if (!result) return;
    const comps = result.address_components || [];
    const subloc = comps.find((c: any) => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))?.long_name;
    const neighbor = comps.find((c: any) => c.types.includes('neighborhood'))?.long_name;
    const locality = comps.find((c: any) => c.types.includes('locality'))?.long_name;
    const route = comps.find((c: any) => c.types.includes('route'))?.long_name;

    this.mainAreaName = subloc || neighbor || route || locality || (result.formatted_address ? result.formatted_address.split(',')[0] : 'Selected Location');
  }

  validateServiceArea(lat: number, lng: number) {
    if (!this.polygonCoords || this.polygonCoords.length === 0 || typeof google === 'undefined') {
      this.inside = true;
      return;
    }
    const point = new google.maps.LatLng(lat, lng);
    const poly = this.servicePolygon || new google.maps.Polygon({ paths: this.polygonCoords });
    this.inside = google.maps.geometry.poly.containsLocation(point, poly);
  }

  onSearchInput() {
    if (!this.searchQuery || this.searchQuery.trim().length < 2) {
      this.predictions = [];
      this.isSearching = false;
      return;
    }

    if (!this.autocompleteService && typeof google !== 'undefined' && google.maps?.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }
    if (!this.autocompleteService) return;

    this.isSearching = true;
    this.autocompleteService.getPlacePredictions(
      {
        input: this.searchQuery,
        componentRestrictions: { country: 'in' },
        locationBias: this.latLng ? { radius: 30000, center: this.latLng } : undefined
      },
      (predictions: any, status: any) => {
        this.ngZone.run(() => {
          this.isSearching = false;
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            this.predictions = predictions;
          } else {
            this.predictions = [];
          }
        });
      }
    );
  }

  selectPrediction(p: any) {
    this.searchQuery = p.structured_formatting?.main_text || p.description;
    this.predictions = [];

    if (typeof google === 'undefined') return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: p.place_id }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          this.latLng = loc;
          if (this.map) {
            this.map.panTo(loc);
            this.map.setZoom(17);
          }
          this.currentAddress = results[0].formatted_address;
          this.extractMainAreaName(results[0]);
          this.validateServiceArea(loc.lat(), loc.lng());
        }
      });
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.predictions = [];
  }

  async getCurrentLocation(showNotice = true) {
    try {
      const pos = await this.locationService.getCurrentPosition();
      if (pos?.coords) {
        const coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        this.latLng = coords;
        if (this.map) {
          this.map.panTo(coords);
          this.map.setZoom(17);
        }
      }
    } catch (e) {
      if (showNotice) {
        this.showToast('Could not fetch GPS location. Please check location permissions.');
      }
    }
  }

  backtoServiceArea() {
    const defaultAthani = new google.maps.LatLng(16.7153, 75.0588);
    if (this.map) {
      this.map.panTo(defaultAthani);
      this.map.setZoom(16);
    }
  }

  confirmLocation() {
    if (!this.map) return;
    const center = this.map.getCenter();
    const locationData: any = {
      lat: center.lat(),
      lng: center.lng(),
      address: this.currentAddress,
      area: this.mainAreaName || 'Athani'
    };

    if (this.isModalOpen) {
      locationData.houseNo = this.houseNo;
      locationData.landmark = this.landmark;
      locationData.buildingName = this.buildingName;
      locationData.receiverName = this.receiverName;
      locationData.receiverPhone = this.receiverPhone;
      locationData.label = this.selectedLabel;

      this.locationService.setAddress(locationData);
      localStorage.setItem('location', JSON.stringify(locationData));

      this.isModalOpen = false;
      this.navCtrl.back();
      return;
    }

    this.locationService.setAddress(locationData);
    localStorage.setItem('location', JSON.stringify(locationData));

    if (this.routeSource === 'addAddress' || this.routeSource === 'cart') {
      this.mapImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${locationData.lat},${locationData.lng}&zoom=17&size=600x300&markers=color:purple%7C${locationData.lat},${locationData.lng}&key=AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0`;
      this.isModalOpen = true;
    } else if (this.routeSource === 'grocery') {
      this.navCtrl.navigateBack('/layout/grocery-layout');
    } else if (this.routeSource === 'rides') {
      this.navCtrl.navigateBack('/layout/rides');
    } else {
      this.navCtrl.navigateBack('/layout/home');
    }
  }

  saveAddress() {
    if (!this.latLng && this.map) {
      this.latLng = this.map.getCenter();
    }
    const params = {
      lat: this.latLng?.lat ? this.latLng.lat() : 16.7153,
      lng: this.latLng?.lng ? this.latLng.lng() : 75.0588,
      address: this.currentAddress,
      label: this.selectedLabel,
      landmark: this.landmark,
      house_no: this.houseNo,
      building_name: this.buildingName,
      receiver_name: this.receiverName,
      receiver_contact: this.receiverPhone
    };

    this.isSaving = true;
    this.locationService.saveAddress(params, this.token).subscribe({
      next: () => {
        this.isSaving = false;
        this.isModalOpen = false;
        this.showToast('Address saved successfully');
        this.navCtrl.back();
      },
      error: () => {
        this.isSaving = false;
        this.showToast('Failed to save address. Please try again.');
      }
    });
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  goBack() {
    this.navCtrl.back();
  }
}