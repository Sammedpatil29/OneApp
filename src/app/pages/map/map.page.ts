import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
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
import { addIcons } from 'ionicons';

import { AddressSaveFormComponent } from 'src/app/components/address-save-form/address-save-form.component';

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
    IonToast,
    AddressSaveFormComponent
  ]
})
export class MapPage implements OnInit, AfterViewInit, OnDestroy {
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

  polygonCoords: any[] = [];
  token: any;
  servicePolygon: any;
  servicePolygons: any[] = [];
  allActiveAreas: any[] = [];
  currentServiceAreaName: string = '';
  nearestServiceAreaName: string = '';
  routeSource: any;
  serviceAreaData: any;

  // Save Address Flow check
  get isSaveAddressFlow(): boolean {
    const src = String(this.routeSource || '').toLowerCase();
    return src === 'profile' || src === 'savedaddress' || src === 'savedaddresses' || src === 'addaddress';
  }

  // Live Location Indicator (Blue Dot)
  userLiveMarker: any = null;
  userLiveAccuracyCircle: any = null;
  private userLiveWatchId: string | null = null;
  liveCoords: { lat: number; lng: number } | null = null;

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
        this.allActiveAreas = Array.isArray(res?.data?.allAreas) ? res.data.allAreas : [];
        this.polygonCoords = res?.data?.polygon || [];
        this.isPolygonLoading = false;
        if (this.map && this.allActiveAreas.length > 0) {
          this.renderAllPolygons();
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
        }
      } catch (e) {}
    }

    if (!this.latLng) {
      // Default to closest service area or first active service area
      const defaultCenter = this.allActiveAreas[0]?.center || { lat: 12.8556, lng: 77.6818 };
      this.latLng = new google.maps.LatLng(defaultCenter.lat, defaultCenter.lng);
    }

    this.setupMap();
  }

  setupMap() {
    if (!this.mapElement?.nativeElement || typeof google === 'undefined') return;

    const mapOptions = {
      center: this.latLng || new google.maps.LatLng(12.8556, 77.6818),
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

    if (this.allActiveAreas.length > 0) {
      this.renderAllPolygons();
    } else if (this.serviceAreaData) {
      this.renderPolygon(this.serviceAreaData);
    }

    // Start tracking user live location for blue dot indicator
    this.trackLiveUserLocation();

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

  renderAllPolygons() {
    if (!this.map || !this.allActiveAreas || this.allActiveAreas.length === 0 || typeof google === 'undefined') return;

    // Clear previous polygons
    if (this.servicePolygons && this.servicePolygons.length > 0) {
      for (const p of this.servicePolygons) {
        p.setMap(null);
      }
    }
    this.servicePolygons = [];

    if (this.servicePolygon) {
      this.servicePolygon.setMap(null);
      this.servicePolygon = null;
    }

    // Render each active service area boundary
    for (const area of this.allActiveAreas) {
      if (area.polygon && Array.isArray(area.polygon) && area.polygon.length >= 3) {
        const poly = new google.maps.Polygon({
          paths: area.polygon,
          strokeColor: area.strokeColor || '#a000e2',
          strokeOpacity: 0.85,
          strokeWeight: 2.5,
          fillColor: area.areaColor || '#a000e2',
          fillOpacity: 0.1,
          map: this.map
        });
        this.servicePolygons.push(poly);
      }
    }
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
    if (!this.allActiveAreas || this.allActiveAreas.length === 0 || typeof google === 'undefined') {
      this.inside = true;
      this.currentServiceAreaName = '';
      return;
    }

    const point = new google.maps.LatLng(lat, lng);
    let matchedArea: any = null;

    // Check each active polygon
    for (let i = 0; i < this.allActiveAreas.length; i++) {
      const area = this.allActiveAreas[i];
      const poly = this.servicePolygons[i];
      if (poly && google.maps.geometry.poly.containsLocation(point, poly)) {
        matchedArea = area;
        break;
      } else if (!poly && area.polygon && area.polygon.length >= 3) {
        const tempPoly = new google.maps.Polygon({ paths: area.polygon });
        if (google.maps.geometry.poly.containsLocation(point, tempPoly)) {
          matchedArea = area;
          break;
        }
      }
    }

    if (matchedArea) {
      this.inside = true;
      this.currentServiceAreaName = matchedArea.cityName || 'Service Area';
    } else {
      this.inside = false;
      this.currentServiceAreaName = '';

      // Find nearest service area
      let minDist = Infinity;
      let closest: any = null;
      for (const area of this.allActiveAreas) {
        if (area.center?.lat && area.center?.lng) {
          const d = Math.hypot(area.center.lat - lat, area.center.lng - lng);
          if (d < minDist) {
            minDist = d;
            closest = area;
          }
        }
      }
      this.nearestServiceAreaName = closest?.cityName || this.allActiveAreas[0]?.cityName || 'Service Area';
    }
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

  updateUserLiveLocationMarker(lat: number, lng: number) {
    if (!this.map || typeof google === 'undefined') return;

    this.liveCoords = { lat, lng };
    const position = new google.maps.LatLng(lat, lng);

    if (this.userLiveMarker) {
      this.userLiveMarker.setPosition(position);
    } else {
      // Sleek live location indicator dot (Google blue with white border)
      this.userLiveMarker = new google.maps.Marker({
        position,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7.5,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5
        },
        title: 'Your Live Location',
        zIndex: 9999
      });
    }

    if (this.userLiveAccuracyCircle) {
      this.userLiveAccuracyCircle.setCenter(position);
    } else {
      // Soft translucent accuracy aura around user position
      this.userLiveAccuracyCircle = new google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.35,
        strokeWeight: 1,
        fillColor: '#60a5fa',
        fillOpacity: 0.15,
        map: this.map,
        center: position,
        radius: 20
      });
    }
  }

  async trackLiveUserLocation() {
    try {
      const pos: any = await this.locationService.getDetailedPosition();
      if (pos && pos.coords) {
        this.ngZone.run(() => {
          this.updateUserLiveLocationMarker(pos.coords.latitude, pos.coords.longitude);
        });
      }
    } catch (e) {}

    try {
      this.userLiveWatchId = await this.locationService.watchPosition((pos: any) => {
        if (pos?.coords) {
          this.ngZone.run(() => {
            this.updateUserLiveLocationMarker(pos.coords.latitude, pos.coords.longitude);
          });
        }
      });
    } catch (e) {}
  }

  async getCurrentLocation(showNotice = true) {
    try {
      this.isPolygonLoading = true;
      const pos = await this.locationService.getDetailedPosition();
      if (pos?.coords) {
        const { latitude, longitude } = pos.coords;
        const coords = new google.maps.LatLng(latitude, longitude);
        this.latLng = coords;

        // Keep the live location dot updated at user's exact coordinates
        this.updateUserLiveLocationMarker(latitude, longitude);

        // Bring user directly to current live location
        if (this.map) {
          this.map.panTo(coords);
          this.map.setZoom(17);
        }
      } else {
        if (showNotice) {
          this.showToast('Please enable device location/GPS to detect your live location.');
        }
      }
    } catch (e) {
      if (showNotice) {
        this.showToast('Could not fetch GPS location. Please check location permissions.');
      }
    } finally {
      this.isPolygonLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.userLiveWatchId) {
      this.locationService.clearWatch(this.userLiveWatchId);
    }
    if (this.userLiveMarker) {
      this.userLiveMarker.setMap(null);
      this.userLiveMarker = null;
    }
    if (this.userLiveAccuracyCircle) {
      this.userLiveAccuracyCircle.setMap(null);
      this.userLiveAccuracyCircle = null;
    }
  }

  backtoServiceArea() {
    if (!this.map || !this.allActiveAreas || this.allActiveAreas.length === 0) return;

    // Center on closest area to current map center
    const center = this.map.getCenter();
    let target = this.allActiveAreas[0]?.center;

    if (center && this.allActiveAreas.length > 1) {
      let minDist = Infinity;
      const cLat = center.lat();
      const cLng = center.lng();
      for (const area of this.allActiveAreas) {
        if (area.center?.lat && area.center?.lng) {
          const d = Math.hypot(area.center.lat - cLat, area.center.lng - cLng);
          if (d < minDist) {
            minDist = d;
            target = area.center;
          }
        }
      }
    }

    if (target?.lat && target?.lng) {
      this.map.panTo(new google.maps.LatLng(target.lat, target.lng));
      this.map.setZoom(15);
    }
  }

  openSaveAddressModal() {
    if (!this.map) return;
    const center = this.map.getCenter();
    this.latLng = center;
    this.isModalOpen = true;
  }

  onAddressSaved(savedAddr: any) {
    this.isModalOpen = false;
    this.showToast('Address saved successfully!');

    if (this.isSaveAddressFlow) {
      // Come back directly to saved delivery addresses page
      this.navCtrl.back();
    } else if (this.routeSource === 'home' || !this.routeSource) {
      this.router.navigate(['/layout/home'], { replaceUrl: true });
    } else {
      this.navCtrl.back();
    }
  }

  closeAddressModal() {
    this.isModalOpen = false;
  }

  confirmLocation() {
    if (!this.map) return;
    const center = this.map.getCenter();
    const locationData: any = {
      lat: center.lat(),
      lng: center.lng(),
      address: this.currentAddress,
      area: this.mainAreaName || this.currentServiceAreaName || 'Selected Location'
    };

    // If in save address flow, open the address save form component
    if (this.isSaveAddressFlow) {
      this.openSaveAddressModal();
      return;
    }

    this.locationService.setAddress(locationData);
    localStorage.setItem('location', JSON.stringify(locationData));

    if (this.routeSource === 'grocery') {
      this.router.navigate(['/layout/grocery-layout'], { replaceUrl: true });
    } else if (this.routeSource === 'rides') {
      this.router.navigate(['/layout/rides'], { replaceUrl: true });
    } else {
      // Direct return to home page
      this.router.navigate(['/layout/home'], { replaceUrl: true });
    }
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  goBack() {
    this.navCtrl.back();
  }
}