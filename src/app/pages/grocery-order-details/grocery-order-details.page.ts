import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, timeOutline, bicycleOutline, homeOutline, 
  receiptOutline, chevronBackOutline, chatbubbleEllipsesOutline,
  cubeOutline, checkmarkDoneCircleOutline, closeCircleOutline,
  star,
  call,
  map,
  callOutline,
  mapOutline,
  checkmarkOutline,
  closeOutline,
  arrowBack
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { GroceryService } from 'src/app/services/grocery.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorComponent } from "src/app/components/error/error.component";

declare var google: any;

@Component({
  selector: 'app-grocery-order-details',
  templateUrl: './grocery-order-details.page.html',
  styleUrls: ['./grocery-order-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ErrorComponent]
})
export class GroceryOrderDetailsPage implements OnInit {

  @ViewChild('mapElement') mapElement!: ElementRef;
  map: any;
  directionsService: any;
  directionsRenderer: any;

  orderId:any;
  token:any;
  currentRoute: any;
  // Mock Data matching your JSON Response
  orderDetails:any = {}
  isLoading: boolean = false;
  isCancelling: boolean = false;
  viewMap: boolean = false;
  isError: boolean = false;
  // backButtonSubscription: any;
  
  // {
  //   "id": "14",
  //   "user_id": 4,
  //   "status": "confirmed", // Change this to 'delivered', 'cancelled', 'preparing' to test UI
  //   "createdAt": "2026-02-04T17:16:23.502Z",
  //   "address": "Home - 123, Green Street, Bengaluru",
  //   "payment_details": {
  //       "mode": "cod"
  //   },
  //   "cart_items": [
  //       {
  //           "name": "Potato",
  //           "image": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1770195830/potato_wvontb.png",
  //           "weight": "1 kg",
  //           "quantity": 1,
  //           "sellingPrice": 35,
  //           "total": 35
  //       },
  //       {
  //           "name": "Broccoli",
  //           "image": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1770196191/brocolli_vj1lsw.png",
  //           "weight": "1 pc",
  //           "quantity": 1,
  //           "sellingPrice": 45,
  //           "total": 45
  //       }
  //   ],
  //   "bill_details": {
  //       "itemTotal": "80.00",
  //       "handlingCharge": "3.00",
  //       "deliveryFee": "30.00",
  //       "toPay": "113.00",
  //       "totalSavings": "15.00"
  //   }
  // };

  timeline:any = []
  
  // [
  //   { status: 'confirmed', title: 'Order Confirmed', icon: 'checkmark-circle', active: false },
  //   { status: 'preparing', title: 'Being Prepared', icon: 'cube-outline', active: false },
  //   { status: 'out_for_delivery', title: 'Out for Delivery', icon: 'bicycle-outline', active: false },
  //   { status: 'delivered', title: 'Delivered', icon: 'home-outline', active: false }
  // ];

  constructor(private navCtrl: NavController, private route: ActivatedRoute, private router: Router, private groceryService: GroceryService, private authServcie: AuthService, private platform: Platform) { 
    addIcons({ 
      checkmarkCircle, timeOutline, bicycleOutline, homeOutline, 
      receiptOutline, chevronBackOutline, chatbubbleEllipsesOutline,
      cubeOutline, checkmarkDoneCircleOutline, closeCircleOutline, star, callOutline, mapOutline, checkmarkOutline, closeOutline, arrowBack 
    });
  }

  async ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
  this.currentRoute = history.state?.from;


    this.token = await this.authServcie.getToken();
    this.getOrderDetails(true)
  }

  // ionViewDidEnter() {
  //   this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(9999, () => {
  //     this.goBack();
  //   });
  // }

  // ionViewWillLeave() {
  //   this.backButtonSubscription?.unsubscribe();
  // }

  openHelp(orderId: any) {
    this.router.navigate(['/layout/example/support'], {
      state: { from: 'order_details', orderId, service: 'grocery' }
    });
  }

  updateTimeline() {
    // Basic logic to activate timeline steps based on current status
    const statusMap: any = { 'confirmed': 0, 'preparing': 1, 'out_for_delivery': 2, 'delivered': 3 };
    const currentStepIndex = statusMap[this.orderDetails.status] || 0;

    this.timeline.forEach((step:any, index:any) => {
      step.active = index <= currentStepIndex;
    });
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'confirmed': return 'primary';
      case 'preparing': return 'warning';
      case 'out_for_delivery': return 'tertiary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getStatusText(status: string) {
  // Add this check to prevent the 'undefined' error
  if (!status) return 'LOADING...'; 
  
  return status.replace(/_/g, ' ').toUpperCase();
}

  getInitials(name: string) {
    if (!name) return '';
    return name.trim().split(/\s+/).map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getOrderDetails(reload:any){
    if(reload){
      this.isLoading = true;
    }
    this.isError = false;
    this.groceryService.getOrderById(this.token, this.orderId).subscribe((res:any)=>{
      this.orderDetails = res.data;
      this.isLoading = false
      this.updateTimeline();
      
      // Wait for DOM to render the @if block before initializing the map
      // setTimeout(() => {
      //   this.initMap();
      // }, 300);
    }, error => {
      this.isLoading = false;
      this.isError = true;
    })
  }

  doRefresh(event:any) {
    setTimeout(() => {
      this.getOrderDetails(true);
      if(this.viewMap){
        this.initMap();
      }
      event.target.complete();
    }, 500);
  }

  goBack() {
    if(this.currentRoute == 'history') {
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateRoot('/layout/example/home');
    }
  }

  initMap() {
    if (!this.mapElement || !this.orderDetails?.address || !this.orderDetails?.rider_details) return;

    const deliveryLat = parseFloat(this.orderDetails.address.lat);
    const deliveryLng = parseFloat(this.orderDetails.address.lng);
    const riderLat = parseFloat(this.orderDetails.rider_details.current_lat);
    const riderLng = parseFloat(this.orderDetails.rider_details.current_lng);

    if (!deliveryLat || !deliveryLng || !riderLat || !riderLng) return;

    const deliveryLoc = { lat: deliveryLat, lng: deliveryLng };
    const riderLoc = { lat: riderLat, lng: riderLng };

    // Hide Google Map Logo/Controls dynamically
    const styleId = 'google-maps-hide-logo';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .gmnoprint a, .gmnoprint span, .gm-style-cc { display: none !important; }
        .gmnoprint div { background: none !important; }
        a[href^="https://maps.google.com/maps"], a[href^="https://www.google.com/maps"] { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Custom Map Style blending with #a000e2 brand theme
    const mapStyles = [
      // Base background (Land) - Very soft purple tint
      { elementType: "geometry", stylers: [{ color: "#f9f6fb" }] },
      // Hide standard icons to keep it clean
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      // Text styling matching the theme subtly
      { elementType: "labels.text.fill", stylers: [{ color: "#8b7d91" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
      // Water elements - Soft theme purple
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#ebdcf0" }] },
      // Parks & Nature
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#eaf3eb" }] },
      // Points of interest - Subtle grey-purple
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f2ebf5" }] },
      // General roads - Crisp white
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      // Highways - Slightly more prominent theme tint
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e6d6eb" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#7c6885" }] }
    ];

    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      zoom: 14,
      center: riderLoc,
      disableDefaultUI: true,
      keyboardShortcuts: false,
      styles: mapStyles,
      gestureHandling: 'greedy'
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#a000e2',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    this.calculateAndDisplayRoute(riderLoc, deliveryLoc);
  }

  calculateAndDisplayRoute(origin: any, destination: any) {
    this.directionsService.route(
      { origin, destination, travelMode: google.maps.TravelMode.DRIVING },
      (response: any, status: any) => {
        if (status === 'OK') {
          this.directionsRenderer.setDirections(response);
          const route = response.routes[0].legs[0];
          this.addCustomMarkers(route.start_location, route.end_location);
        } else {
          console.error('Directions request failed due to ' + status);
          
          this.addCustomMarkers(origin, destination);
          
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          this.map.fitBounds(bounds);
        }
      }
    );
  }

  addCustomMarkers(origin: any, destination: any) {
    // Rider Marker (A pulsating dot or simple bold circle)
    const riderIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#a000e2" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>'),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16)
    };

    // Destination Marker (A red home icon)
    const homeIcon = {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path d="M12 2L1 11h3v11h16V11h3L12 2zm0 2.8l7 6.4V20H5v-8.8l7-6.4z" fill="#000" stroke="#fff" stroke-width="1"/><path d="M12 5.8L6 11.3V19h12v-7.7L12 5.8z" fill="#a000e2"/></svg>'),
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 18)
    };

    new google.maps.Marker({
      position: origin,
      map: this.map,
      icon: riderIcon
    });

    new google.maps.Marker({
      position: destination,
      map: this.map,
      icon: homeIcon
    });
  }

  cancelOrder(){
    let params = {
      "orderId": this.orderDetails?.id
    }
    this.isCancelling = true
    this.groceryService.cancelOrder(params).subscribe((res:any)=>{
      this.isCancelling = false
      this.viewMap = false;
      this.getOrderDetails(true);
    }, error => {
      this.isCancelling = false
    })
  }

  getColor(status: any) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'linear-gradient(135deg, #4CAF50, #66BB6A)'; // Green

    case 'confirmed':
      return 'linear-gradient(135deg, #2196F3, #42A5F5)'; // Blue

    case 'rider assigned':
      return 'linear-gradient(135deg, #FF9800, #FFB74D)'; // Orange

    case 'packed':
      return 'linear-gradient(135deg, #9C27B0, #BA68C8)'; // Purple

    case 'cancelled':
      return 'linear-gradient(135deg, #F44336, #EF5350)'; // Red

    case 'on the way':
      return 'linear-gradient(135deg, #3F51B5, #5C6BC0)'; // Indigo

    case 'reached':
      return 'linear-gradient(135deg, #607D8B, #78909C)'; // Blue Grey

    case 'delivered':
      return 'linear-gradient(135deg, #009688, #26A69A)'; // Teal

    default:
      return '#a000e2';
  }
}

 getMessage(status: any) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '⏳ Order received! We’re on it.';

    case 'confirmed':
      return '✅ Order confirmed! Preparing it now.';

    case 'rider assigned':
      return '🛵 Rider assigned! Pickup happening soon.';

    case 'packed':
      return '📦 Packed & ready! Dispatching shortly.';

    case 'cancelled':
      return 'Order is cancelled.';

    case 'on the way':
      return '🚀 On the way! Almost there.';

    case 'reached':
      return '📍 Rider has arrived! Please be ready.';

    case 'delivered':
      return '🎉 Delivered! Enjoy your order.';

    default:
      return '⚡ We’re preparing your order!';
  }
}

openMap(){
  this.viewMap = !this.viewMap;
  if(this.viewMap){
    setTimeout(()=>{
      this.initMap();
  }, 50)
  }
}
}