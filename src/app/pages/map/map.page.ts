import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBack, locate, location, search, close, refresh, arrowBackOutline, locateOutline, refreshOutline, mapOutline, trendingUp } from 'ionicons/icons';

declare const google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MapPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  map: any;
  currentAddress = '';
  latLng: any;
  inside = true;
  isPolygonLoading = true;
  isLoading = false;
  isModalOpen = false;
  isSearchModalOpen = false;

  // Form Model
  houseNo = '';
  landmark = '';
  selectedLabel = 'home';
  mapImgUrl = '';
  
  polygonCoords: any[] = [];
  token: any;
  servicePolygon: any;
  routeSource:any
  serviceAreaData: any;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private locationService: LocationService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    addIcons({ arrowBackOutline, locate, location, search, close, refresh, locateOutline, refreshOutline, mapOutline });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    this.routeSource = history.state.data
    this.fetchServiceArea();
  }

  ngAfterViewInit() {
    this.initializeLocation();
  }

  fetchServiceArea() {
    this.locationService.getPolygonData().subscribe({
      next: (res: any) => {
        this.serviceAreaData = res.data;
        this.polygonCoords = res.data.polygon;
        this.isPolygonLoading = false;
        if (this.map) {
          this.renderPolygon(res.data);
          const center = this.map.getCenter();
          if (center) this.validateServiceArea(center.lat(), center.lng());
        }
      },
      error: () => this.isPolygonLoading = false
    });
  }

  initializeLocation() {
    const savedLoc = localStorage.getItem('location');
    if (savedLoc) {
      const parsed = JSON.parse(savedLoc);
      this.latLng = new google.maps.LatLng(parsed.lat, parsed.lng);
    } else {
      // this.latLng = new google.maps.LatLng(16.7153, 75.0588); 
    }
    this.setupMap();
  }

  setupMap() {
    const mapOptions = {
      center: this.latLng,
      zoom: 16,
      disableDefaultUI: true,
      clickableIcons: false,
      styles: [ /* Optional: Add custom silver/dark map styles here */ ]
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    if (this.serviceAreaData) {
      this.renderPolygon(this.serviceAreaData);
    }

    // Update address when map stops moving
    google.maps.event.addListener(this.map, 'idle', () => {
      const center = this.map.getCenter();
      this.updateLocationInfo(center.lat(), center.lng());
    });
  }

  renderPolygon(data: any) {
    this.servicePolygon = new google.maps.Polygon({
      paths: this.polygonCoords,
      strokeColor: data.border_color || '#2f3542',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: data.inside_color || '#747d8c',
      fillOpacity: 0.15,
      map: this.map
    });
  }

  updateLocationInfo(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    this.isPolygonLoading = true;
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      this.ngZone.run(() => {
        if (status === 'OK' && results[0]) {
          this.currentAddress = results[0].formatted_address;
          this.validateServiceArea(lat, lng);
        }
        this.isPolygonLoading = false;
      });
    });
  }

  validateServiceArea(lat: number, lng: number) {
    if (!this.polygonCoords || this.polygonCoords.length === 0) return;
    const point = new google.maps.LatLng(lat, lng);
    const poly = this.servicePolygon || new google.maps.Polygon({ paths: this.polygonCoords });
    this.inside = google.maps.geometry.poly.containsLocation(point, poly);
  }

  confirmLocation() {
    const center = this.map.getCenter();
    const locationData: any = { lat: center.lat(), lng: center.lng(), address: this.currentAddress };
    
    if (this.isModalOpen) {
      locationData.houseNo = this.houseNo;
      locationData.landmark = this.landmark;
      locationData.label = this.selectedLabel;

      this.locationService.setAddress(locationData);
      localStorage.setItem('location', JSON.stringify(locationData));
      
      this.isModalOpen = false;
      this.navCtrl.back();
      return;
    }

    this.locationService.setAddress(locationData);
    localStorage.setItem('location', JSON.stringify(locationData));

    if (this.routeSource == 'addAddress' || this.routeSource == 'cart') {
      this.mapImgUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${locationData.lat},${locationData.lng}&zoom=17&size=600x300&markers=color:black%7C${locationData.lat},${locationData.lng}&key=AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0`;
      this.isModalOpen = true;
    } else if(this.routeSource == 'grocery') {
      this.navCtrl.navigateBack('/layout/grocery-layout/grocery');
    } else {
      this.navCtrl.navigateBack('/layout/example/home');
    }
  }

  async getCurrentLocation() {
    try {
      const pos = await this.locationService.getCurrentPosition();
      const coords = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      this.map.panTo(coords);
      this.map.setZoom(18);
    } catch (e) {
      console.error("Location access denied", e);
    }
  }

  goBack() { this.navCtrl.back(); }
  backtoServiceArea() { this.map.panTo(new google.maps.LatLng(16.7153, 75.0588)); }
}