import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { IonButton, IonSkeletonText, IonToast, IonSpinner, IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  call,
  shieldCheckmark,
  checkmarkCircle,
  alertCircle,
  close,
  location,
  navigate,
  time,
  cash,
  car,
  bicycle,
  cube
} from 'ionicons/icons';
import { RideService, VehicleTripOption } from 'src/app/services/ride.service';
import { SocketService } from 'src/app/services/socket.service';
import { AuthService } from 'src/app/services/auth.service';

declare var google: any;

@InjectableComponent()
@Component({
  selector: 'app-ride-selection',
  templateUrl: './ride-selection.component.html',
  styleUrls: ['./ride-selection.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonToast,
    IonSkeletonText,
    IonButton,
    IonIcon,
    IonModal,
    IonSpinner
  ]
})
export class RideSelectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @Input() tripData: any;

  // Google Maps Objects
  map: any;
  directionsService: any;
  directionsRenderer: any;
  routePolyline: any;
  pickupMarker: any;
  dropMarker: any;
  driverMarker: any;

  // Ride State
  searching: boolean = false;
  isCalculating: boolean = false;
  searchCountdown: number = 90;
  private searchTimer: any = null;

  tripOptions: VehicleTripOption[] = [];
  selected_service: string = 'bike';
  selected_service_details: any = null;

  activeRide: any = null;
  rideId: string | number | null = null;
  token: string | null = null;
  userId: string | null = null;

  // Distance & Duration
  distanceKm: number = 0;
  durationMins: number = 0;
  estimatedDistance: string = '';
  estimatedDisplayTime: string = '';

  // Toast / Alert notifications
  isToastOpen: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'dark';

  // Completion Modal
  isCompletionModalOpen: boolean = false;

  constructor(
    private navCtrl: NavController,
    private rideService: RideService,
    private socketService: SocketService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      arrowBack,
      call,
      shieldCheckmark,
      checkmarkCircle,
      alertCircle,
      close,
      location,
      navigate,
      time,
      cash,
      car,
      bicycle,
      cube
    });
  }

  async ngOnInit() {
    this.token = await this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();
    this.userId = currentUser?.id || localStorage.getItem('user_id');

    // Restore trip data if input is empty
    if (!this.tripData) {
      const storedTrip = history.state?.data || history.state?.tripData;
      if (storedTrip) {
        this.tripData = storedTrip;
      } else {
        const localTrip = localStorage.getItem('pintu_active_trip_data');
        if (localTrip) {
          try {
            this.tripData = JSON.parse(localTrip);
          } catch (e) {}
        }
      }
    } else {
      localStorage.setItem('pintu_active_trip_data', JSON.stringify(this.tripData));
    }

    // Check for existing active ride session
    this.restoreActiveRideState();

    // Setup Socket Listeners
    this.initSocketListeners();

    // Fetch Trip Estimates
    if (this.tripData?.origin?.coords && this.tripData?.drop?.coords) {
      this.getTripOptions();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadMap();
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearInterval(this.searchTimer);
      this.searchTimer = null;
    }
    this.socketService.offRideUpdate();
    this.socketService.offRiderLocation();
  }

  // ─── RESTORE ACTIVE RIDE ──────────────────────────────────────────
  private restoreActiveRideState() {
    const savedRide = localStorage.getItem('pintu_active_ride');
    if (savedRide) {
      try {
        const parsed = JSON.parse(savedRide);
        if (parsed && (parsed.status === 'searching' || parsed.status === 'accepted' || parsed.status === 'assigned' || parsed.status === 'arrived' || parsed.status === 'in_progress' || parsed.status === 'started')) {
          this.activeRide = parsed;
          this.rideId = parsed.id;
          if (parsed.status === 'searching') {
            this.searching = true;
            this.startSearchCountdown();
          } else {
            this.searching = false;
          }
          console.log('🔄 Restored active ride from storage:', this.activeRide);
        }
      } catch (e) {
        localStorage.removeItem('pintu_active_ride');
      }
    }
  }

  // ─── SOCKET EVENT HANDLERS ────────────────────────────────────────
  private initSocketListeners() {
    // 1. Ride Status Updates
    this.socketService.onRideUpdate((msg: any) => {
      console.log('📡 [Customer] rideUpdate received:', msg);
      if (!msg) return;

      const rawStatus = (msg.status || msg.alias_status || '').toLowerCase();

      // Check if message belongs to current ride or if we should adopt it
      if (this.rideId && msg.id && msg.id != this.rideId) {
        return;
      }

      if (rawStatus === 'searching') {
        this.searching = true;
        this.activeRide = msg;
        this.rideId = msg.id;
        localStorage.setItem('pintu_active_ride', JSON.stringify(msg));
        this.startSearchCountdown();
      } else if (rawStatus === 'accepted' || rawStatus === 'assigned') {
        this.stopSearchCountdown();
        this.searching = false;
        this.activeRide = msg;
        this.activeRide.status = 'assigned';
        this.rideId = msg.id;
        localStorage.setItem('pintu_active_ride', JSON.stringify(this.activeRide));

        this.showToast('Captain accepted your ride!', 'success');

        // Update driver location & route to pickup
        const driverLat = msg.raider_details?.current_lat || msg.raider_details?.lat || msg.raider_details?.current_location?.lat;
        const driverLng = msg.raider_details?.current_lng || msg.raider_details?.lng || msg.raider_details?.current_location?.lng;

        if (driverLat && driverLng) {
          this.updateDriverMarker(driverLat, driverLng);
          if (this.tripData?.origin?.coords) {
            this.calculateDriverEta({ lat: driverLat, lng: driverLng }, this.tripData.origin.coords);
          }
        }
      } else if (rawStatus === 'arrived') {
        this.searching = false;
        if (!this.activeRide) this.activeRide = {};
        Object.assign(this.activeRide, msg, { status: 'arrived' });
        localStorage.setItem('pintu_active_ride', JSON.stringify(this.activeRide));

        this.showToast('Captain arrived at your pickup spot! Share your 4-digit PIN.', 'warning');
      } else if (rawStatus === 'in_progress' || rawStatus === 'started') {
        this.searching = false;
        if (!this.activeRide) this.activeRide = {};
        Object.assign(this.activeRide, msg, { status: 'started' });
        localStorage.setItem('pintu_active_ride', JSON.stringify(this.activeRide));

        this.showToast('Trip started! Have a safe journey.', 'primary');

        // Update map to show route to destination
        if (this.tripData?.drop?.coords) {
          const currentDriverPos = this.driverMarker?.getPosition();
          const from = currentDriverPos ? { lat: currentDriverPos.lat(), lng: currentDriverPos.lng() } : this.tripData.origin.coords;
          this.calculateDriverEta(from, this.tripData.drop.coords);
        }
      } else if (rawStatus === 'completed') {
        this.searching = false;
        if (!this.activeRide) this.activeRide = {};
        Object.assign(this.activeRide, msg, { status: 'completed' });
        localStorage.removeItem('pintu_active_ride');

        this.isCompletionModalOpen = true;
      } else if (rawStatus === 'cancelled') {
        this.stopSearchCountdown();
        this.searching = false;
        this.activeRide = null;
        this.rideId = null;
        localStorage.removeItem('pintu_active_ride');

        const reason = msg.message || 'Ride was cancelled or no drivers available';
        this.showToast(reason, 'danger');
        this.loadMap();
      }
    });

    // 2. Real-time Live GPS Coordinates from Driver
    this.socketService.onRiderLocation((data: any) => {
      if (!data || !data.lat || !data.lng) return;

      const driverId = data.riderId;
      const assignedRiderId = this.activeRide?.riderId || this.activeRide?.raider_details?.id;

      if (!assignedRiderId || driverId == assignedRiderId) {
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        const heading = parseFloat(data.heading || 0);

        this.updateDriverMarker(lat, lng, heading);

        // Update ETA dynamically
        if (this.activeRide?.status === 'assigned' && this.tripData?.origin?.coords) {
          this.calculateDriverEta({ lat, lng }, this.tripData.origin.coords);
        } else if (this.activeRide?.status === 'started' && this.tripData?.drop?.coords) {
          this.calculateDriverEta({ lat, lng }, this.tripData.drop.coords);
        }
      }
    });
  }

  // ─── MAP RENDERING & DRIVER GPS MARKERS ───────────────────────────
  loadMap() {
    if (!this.mapElement?.nativeElement || !(window as any).google?.maps) {
      console.warn('Google Maps API not available on DOM');
      return;
    }

    const origin = this.tripData?.origin?.coords || { lat: 16.7341, lng: 75.0520 };
    const destination = this.tripData?.drop?.coords || { lat: 16.7112, lng: 75.0505 };

    const mapOptions = {
      center: origin,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] }
      ]
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.directionsService = new google.maps.DirectionsService();

    // 1. Draw Route Polyline
    this.drawRouteOnMap(origin, destination);

    // 2. Add Pickup & Drop Markers
    this.createOriginDestinationMarkers(origin, destination);
  }

  private drawRouteOnMap(origin: any, destination: any) {
    if (!this.directionsService || !this.map) return;

    this.directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result: any, status: string) => {
        if (status === 'OK' && result?.routes?.[0]) {
          const route = result.routes[0];

          if (this.routePolyline) {
            this.routePolyline.setMap(null);
          }

          this.routePolyline = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: '#0f172a',
            strokeOpacity: 0.9,
            strokeWeight: 4.5,
            map: this.map
          });

          // Extract distance and duration
          const leg = route.legs?.[0];
          if (leg) {
            this.distanceKm = (leg.distance.value / 1000);
            this.durationMins = Math.ceil(leg.duration.value / 60);
            this.estimatedDistance = `${this.distanceKm.toFixed(1)} km`;
            this.estimatedDisplayTime = `${this.durationMins} mins`;
          }

          // Fit bounds
          const bounds = new google.maps.LatLngBounds();
          route.overview_path.forEach((p: any) => bounds.extend(p));
          this.map.fitBounds(bounds, 40);
        }
      }
    );
  }

  private createOriginDestinationMarkers(origin: any, destination: any) {
    if (this.pickupMarker) this.pickupMarker.setMap(null);
    if (this.dropMarker) this.dropMarker.setMap(null);

    // Pickup Green Marker
    this.pickupMarker = new google.maps.Marker({
      position: origin,
      map: this.map,
      title: 'Pickup Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5
      }
    });

    // Drop Red Marker
    this.dropMarker = new google.maps.Marker({
      position: destination,
      map: this.map,
      title: 'Drop Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2.5
      }
    });
  }

  private updateDriverMarker(lat: number, lng: number, heading: number = 0) {
    if (!this.map || !lat || !lng) return;

    const pos = new google.maps.LatLng(lat, lng);

    if (!this.driverMarker) {
      this.driverMarker = new google.maps.Marker({
        position: pos,
        map: this.map,
        title: 'Captain',
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5.5,
          fillColor: '#059669',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: heading
        }
      });
    } else {
      this.driverMarker.setPosition(pos);
      if (heading) {
        const icon = this.driverMarker.getIcon();
        if (icon && typeof icon === 'object') {
          icon.rotation = heading;
          this.driverMarker.setIcon(icon);
        }
      }
    }
  }

  private calculateDriverEta(from: any, to: any) {
    if (!this.directionsService) return;

    this.directionsService.route(
      {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (res: any, status: string) => {
        if (status === 'OK' && res?.routes?.[0]?.legs?.[0]) {
          const leg = res.routes[0].legs[0];
          const mins = Math.ceil(leg.duration.value / 60);
          const km = (leg.distance.value / 1000).toFixed(1);
          this.estimatedDisplayTime = mins <= 1 ? '1 min' : `${mins} mins`;
          this.estimatedDistance = `${km} km`;
        }
      }
    );
  }

  // ─── ESTIMATES & SERVICE SELECTION ───────────────────────────────
  getTripOptions() {
    this.isCalculating = true;

    const params = {
      origin: {
        coords: {
          lat: this.tripData.origin.coords.lat,
          lng: this.tripData.origin.coords.lng
        }
      },
      drop: {
        coords: {
          lat: this.tripData.drop.coords.lat,
          lng: this.tripData.drop.coords.lng
        }
      }
    };

    this.rideService.getTripOptions(params).subscribe({
      next: (response) => {
        if (Array.isArray(response) && response.length > 0) {
          this.tripOptions = response;
        } else {
          this.tripOptions = this.rideService.computeFallbackTripOptions(this.distanceKm, this.durationMins);
        }
        this.selected_service = this.tripOptions[0].type;
        this.selected_service_details = this.tripOptions[0];
        this.isCalculating = false;
      },
      error: (err) => {
        console.warn('Backend estimate error, using local fallback:', err.message);
        this.tripOptions = this.rideService.computeFallbackTripOptions(this.distanceKm, this.durationMins);
        this.selected_service = this.tripOptions[0].type;
        this.selected_service_details = this.tripOptions[0];
        this.isCalculating = false;
      }
    });
  }

  selectService(item: VehicleTripOption) {
    this.selected_service = item.type;
    this.selected_service_details = item;
  }

  // ─── BOOK RIDE ───────────────────────────────────────────────────
  async bookRide() {
    if (!this.selected_service_details) {
      this.selected_service_details = this.tripOptions.find(o => o.type === this.selected_service) || this.tripOptions[0];
    }

    this.searching = true;
    this.startSearchCountdown();

    const params = {
      token: this.token || (await this.authService.getToken()),
      userId: this.userId || this.authService.getCurrentUser()?.id,
      trip_details: this.tripData,
      service_details: this.selected_service_details
    };

    this.rideService.createRide(params).subscribe({
      next: (response: any) => {
        console.log('✅ Ride Created:', response);
        if (response && response.ride) {
          this.rideId = response.ride.id;
          this.activeRide = response.ride;
          localStorage.setItem('pintu_active_ride', JSON.stringify(this.activeRide));
        }
      },
      error: (err: any) => {
        console.error('❌ Failed to create ride:', err);
        this.searching = false;
        this.stopSearchCountdown();
        this.showToast(err?.error?.message || 'Unable to request ride. Please check network.', 'danger');
      }
    });
  }

  private startSearchCountdown() {
    this.stopSearchCountdown();
    this.searchCountdown = 90;
    this.searchTimer = setInterval(() => {
      if (this.searchCountdown > 0) {
        this.searchCountdown--;
      } else {
        this.stopSearchCountdown();
        this.searching = false;
        this.showToast('No captains accepted within 90 seconds. Please try again.', 'warning');
      }
    }, 1000);
  }

  private stopSearchCountdown() {
    if (this.searchTimer) {
      clearInterval(this.searchTimer);
      this.searchTimer = null;
    }
  }

  // ─── CANCEL RIDE ─────────────────────────────────────────────────
  async cancelRide() {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Ride',
      message: 'Are you sure you want to cancel this ride request?',
      buttons: [
        {
          text: 'No, Keep',
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          role: 'destructive',
          handler: () => {
            this.executeCancellation();
          }
        }
      ]
    });
    await alert.present();
  }

  executeCancellation() {
    const targetRideId = this.activeRide?.id || this.rideId;
    if (targetRideId) {
      this.socketService.cancelRide({ rideId: targetRideId });
    }

    this.searching = false;
    this.stopSearchCountdown();
    this.activeRide = null;
    this.rideId = null;
    localStorage.removeItem('pintu_active_ride');

    this.showToast('Ride cancelled successfully', 'dark');
    this.loadMap();
  }

  // ─── CALL CAPTAIN ────────────────────────────────────────────────
  callDriver() {
    const phone = this.activeRide?.raider_details?.contact || this.activeRide?.raider_details?.phone;
    if (phone) {
      window.open(`tel:${phone}`, '_system');
    } else {
      this.showToast('Captain phone number not available', 'warning');
    }
  }

  // ─── COMPLETION MODAL & NAVIGATION ───────────────────────────────
  finishCompletedTrip() {
    this.isCompletionModalOpen = false;
    this.activeRide = null;
    this.rideId = null;
    localStorage.removeItem('pintu_active_ride');
    localStorage.removeItem('pintu_active_trip_data');
    this.navCtrl.navigateRoot('/layout/home');
  }

  goback() {
    if (this.searching || (this.activeRide && this.activeRide.status !== 'completed')) {
      this.cancelRide();
    } else {
      this.navCtrl.navigateBack('/layout/rides/search');
    }
  }

  private showToast(msg: string, color: string = 'dark') {
    this.toastMessage = msg;
    this.toastColor = color;
    this.isToastOpen = true;
  }
}

// Dummy helper decorator
function InjectableComponent(): any {
  return (target: any) => target;
}
