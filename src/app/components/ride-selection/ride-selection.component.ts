import { IonContent, IonTitle, IonButton, IonSpinner } from "@ionic/angular/standalone";
import { Component, ElementRef, ViewChild, AfterViewInit, OnInit, MissingTranslationStrategy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {  Input } from '@angular/core';
import { RideService } from "src/app/services/ride.service";
import { SocketService } from "src/app/services/socket.service";
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-ride-selection',
  templateUrl: './ride-selection.component.html',
  styleUrls: ['./ride-selection.component.scss'],
  imports: [IonSpinner, IonButton, IonTitle, CommonModule, FormsModule]
})
export class RideSelectionComponent  implements OnInit {

  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  @Input() tripData: any;
  map: any;
  searching: boolean = false 
  availableServices = ['bike','cab','parcel','auto']
  otp = '2345'
  extraMarkers:any
  

  priceChart:any = {
    "bike": {
      "base": 15,
      "perKm": 7,
      "permin": 1,
      "latenight": 30
    },
    "cab": {
      "base": 50,
      "perKm": 12,
      "permin": 1,
      "latenight": 30
    },
    "auto": {
      "base": 30,
      "perKm": 9,
      "permin": 1,
      "latenight": 30
    },
    "parcel": {
      "base": 20,
      "perKm": 8,
      "permin": 1,
      "latenight": 30
    }
  }
  
  tripOptions = [
    {
      "type": 'bike',
      "image_url": 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png',
      "max_person": "max 1 person",
      "estimated_time": "4 mins",
      "estimated_reach_time": "4:10 pm",
      "price": 245
    },
    {
      "type": 'cab',
      "image_url": 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png',
      "max_person": "max 4 persons",
      "estimated_time": "4 mins",
      "estimated_reach_time": "4:10 pm",
      "price": 245
    },
    {
      "type": 'auto',
      "image_url": 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png',
      "max_person": "max 3 persons",
      "estimated_time": "4 mins",
      "estimated_reach_time": "4:10 pm",
      "price": 245
    },
    {
      "type": 'parcel',
      "image_url": '/assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png',
      "max_person": "20 kgs",
      "estimated_time": "4 mins",
      "estimated_reach_time": "4:10 pm",
      "price": 245
    },
  ]

  activeRide: any;

  selected_service = this.tripOptions[0].type
  selected_service_details:any;
distance: any = '';
estimatedDistance: any = '';
  duration: any = '';
  estimatedTime: any = '';
  timeInMins: any = '';
  estimatedTimeinMins: any = '';
  estimatedDisplayTime: any = '';
  error: any = '';
   randomLocations:any;
  constructor(private navCtrl: NavController, private rideService: RideService, private socketService: SocketService) {
   
   }

  ngOnInit() {
     this.socketService.onMessage((msg) => {
      console.log('📩 Received from server:', msg);
    });

    // Optionally send a message to the server
    this.socketService.sendMessage('Hello from Ionic client 👋');

    this.socketService.rideUpdate((msg) => {
      this.activeRide = msg
      if(this.activeRide){
        this.searching = true
      }
      if(this.activeRide.status == 'assigned' || this.activeRide.status == 'cancelled'){
        const origin = { lat: this.activeRide?.raider_details?.current_location.lat, lng: this.activeRide?.raider_details?.current_location.lng };
    const destination = { lat: this.tripData['origin'].coords.lat, lng: this.tripData['origin'].coords.lng };
        this.getRiderDistanceandTime(origin, destination)
        this.loadMap()
      } else {
        this.loadMap()
      }
      console.log('ride update:', msg);
    });
    this.randomLocations = [
  { lat: this.tripData['origin'].coords.lat + 0.001, lng: this.tripData['origin'].coords.lat + 0.001 },
  { lat: this.tripData['origin'].coords.lat - 0.001, lng: this.tripData['origin'].coords.lat - 0.001 },
  { lat: this.tripData['origin'].coords.lat + 0.002, lng: this.tripData['origin'].coords.lat - 0.001 },
];
    this.getDistanceandTime()
    console.log(this.tripData)
  }

  ngAfterViewInit(): void {
    this.loadMap();
  }

  loadMap() {
  let origin;
  let destination;
  
    if(this.activeRide?.status == 'assigned'){
       origin = { lat: this.activeRide.raider_details.current_location.lat, lng: this.activeRide.raider_details.current_location.lng };
     destination = { lat: this.tripData['origin'].coords.lat, lng: this.tripData['origin'].coords.lng };
    } else {
       origin = { lat: this.tripData['origin'].coords.lat, lng: this.tripData['origin'].coords.lng };
     destination = { lat: this.tripData['drop'].coords.lat, lng: this.tripData['drop'].coords.lng };
    }

  const mapOptions = {
  center: origin,
  zoom: 18,
  disableDefaultUI: true,
  styles: [
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { color: "#f8dfdfff" } // set your custom color
      ]
    },
    // Optional: Change road outline (stroke)
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [
        { color: "#f1ededff" }
      ]
    },
    // Hide POI (points of interest)
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    // Hide transit stations
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    // Keep road labels (e.g. street names)
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    },
    // Keep locality (e.g. town/city names)
    {
      featureType: "administrative.locality",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    // Optional: keep neighborhood labels
    {
      featureType: "administrative.neighborhood",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    // Hide water body labels if you want
    {
      featureType: "water",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    }
  ]
};

this.extraMarkers?.forEach((marker: any) => marker.setMap(null));
this.extraMarkers = [];

this.randomLocations.forEach((location: any, index: number) => {
  const marker = new google.maps.Marker({
    position: location,
    map: this.map,
    title: `Extra Marker ${index + 1}`,
    icon: {
      url: 'assets/gif/Holi special (1).gif', // Your custom icon (optional)
      scaledSize: new google.maps.Size(30, 30)
    }
  });
  

  this.extraMarkers.push(marker);
});

  this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

  const directionsService = new google.maps.DirectionsService();

  const request = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING,
  };

  

  directionsService.route(request, (result:any, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      const route = result.routes[0].overview_path;

      // Draw custom red polyline
      new google.maps.Polyline({
        path: route,
        strokeColor: '#000000ff',
        strokeOpacity: 1.0,
        strokeWeight: 2.5,
        map: this.map
      });

      if(this.activeRide?.status == 'assigned'){
        // 🟢 Origin: green circle
      new google.maps.Marker({
  position: origin,
  map: this.map,
  icon: {
    url: 'assets/gif/Holi special (1).gif', // 🔁 Replace with your actual image path
    scaledSize: new google.maps.Size(40, 40), // ⬅️ Adjust size to your needs
    anchor: new google.maps.Point(20, 20), // Center of the icon (optional)
  }
});
      } else {
        // 🟢 Origin: green circle
      new google.maps.Marker({
        position: origin,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#f1f1f1ff", // green
          fillOpacity: 1,
          strokeColor: "#057405ff",
          strokeOpacity: 1,
          strokeWeight: 5,
        }
      });
      }

      // 🔴 Destination: red circle
      new google.maps.Marker({
        position: destination,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#e7e5e5ff", // red
          fillOpacity: 1,
          strokeColor: "#bd0a0aff",
          strokeOpacity: 1,
          strokeWeight: 5,
        }
      });

      // Adjust view to show the entire route
      const bounds = new google.maps.LatLngBounds();
      route.forEach((point: google.maps.LatLng | google.maps.LatLngLiteral) => bounds.extend(point));
      this.map.fitBounds(bounds, 5);

    } else {
      console.error('Directions request failed due to', status);
    }
  });
}






  goback(){
    this.navCtrl.back()
  }

  selectService(item:any){
    this.selected_service = item.type
    this.selected_service_details = item
    console.log(item)
  }

  estimateTripOptions(){
    this.tripOptions = []
    this.availableServices.forEach(async (item)=>{
      let object = {
      "type": item,
      "image_url": '/assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png',
      "max_person": await this.getMaxPerson(item),
      "estimated_time": this.timeInMins,
      "estimated_reach_time": this.distance,
      "price": await this.calculateFare(item)
    }
      this.tripOptions.push(object)
    })
  }

  max_person:any = {
    "bike": 'max 1 person',
    "cab": 'max 4 persons',
    "auto": 'max 3 persons',
    "parcel": 'max 20 kgs'
  }
// "bike": {
//       "base": 15,
//       "perKm": 7,
//       "permin": 1,
//       "latenight": 30
//     },
  async calculateFare(item:any){
    let priceChart = this.priceChart[item]
    console.log(this.distance*priceChart.perKm)
    console.log(this.distance)
      return priceChart.base + this.distance*priceChart.perKm + this.timeInMins*priceChart.permin + 1
  }

  async getMaxPerson(type:any){
    return this.max_person[type]
  }

  async getDistanceandTime(){
    const origin = { lat: this.tripData['origin'].coords.lat, lng: this.tripData['origin'].coords.lng };
    const destination = { lat: this.tripData['drop'].coords.lat, lng: this.tripData['drop'].coords.lng };
    const travelMode = 'DRIVE';
    this.rideService.getRoute(origin, destination, travelMode).subscribe({
      next: (response) => {
        console.log(response)
        if (response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          this.distance = (route.distanceMeters / 1000).toFixed(2);
          console.log(this.distance)
          this.duration = this.formatDuration(route.duration);
          this.timeInMins = Number(route.duration.slice(0,-1))/60
          console.log(this.timeInMins)
        } else {
          this.error = 'No routes found.';
        }
      },
      error: (err) => {
        this.error = 'Error fetching route: ' + (err.message || err.statusText);
      }
    });
    
    let intervalId = setInterval(()=>{
      console.log('jjgjgrg')
      if(this.distance !== ''){
        this.estimateTripOptions()
        clearInterval(intervalId)
      }
    },50)
  }

  async getRiderDistanceandTime(origin:any, destination: any ){
    
    const travelMode = 'DRIVE';
    this.rideService.getRoute(origin, destination, travelMode).subscribe({
      next: (response) => {
        console.log(response)
        if (response.routes && response.routes.length > 0) {
          const route = response.routes[0];
          this.estimatedDistance = (route.distanceMeters / 1000).toFixed(2);
          console.log(this.distance)
          this.estimatedTime = this.formatDuration(route.duration);
          this.estimatedTimeinMins = Math.floor(Number(route.duration.slice(0,-1))/60)
          this.estimatedDisplayTime = `${this.estimatedTimeinMins} mins`
          if(this.estimatedTimeinMins > 60){
            this.estimatedTimeinMins = this.estimatedTimeinMins/60
            this.estimatedDisplayTime = `${this.estimatedTimeinMins} hours`
          }
        } else {
          this.error = 'No routes found.';
        }
      },
      error: (err) => {
        this.error = 'Error fetching route: ' + (err.message || err.statusText);
      }
    });
  }

  formatDuration(durationStr: string): string {
    const match = durationStr.match(/(\d+)s/);
    if (!match) return durationStr;
    const seconds = parseInt(match[1], 10);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  rideId: any;
  bookRide(){
    let params:any = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
      "trip_details": this.tripData,
      "service_details": this.selected_service_details,
    }
    console.log(params)
    // this.rideService.createRide(this.tripData, this.selected_service_details).subscribe(response => {
    //   console.log('Ride created:', response);
    //   this.rideId = response.rideId;
 
    //   // Now connect to the WebSocket to listen for ride updates
    //   this.listenForRideUpdates(this.rideId);
    // }, error => {
    //   console.error('Error creating ride:', error);
    // });
    this.socketService.createRide(params)
    this.socketService.rideUpdate((msg) => {
      this.activeRide = msg
      if(this.activeRide){
        this.searching = true
      }
      console.log('ride update:', msg);
    });
  }

  cancelRide(){
    let params:any = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwicGhvbmUiOiIrOTE3NDA2OTg0MzA4IiwidXNlcl9uYW1lIjoiU2FtbWVkIFBhdGlsIFZJIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTgyMTc2NjJ9.J2j66IfijcfkojEV-TBbfmiDKKTGD9b7amWRbZ4ldxQ",
      "id": this.activeRide.id
    }
    this.socketService.cancelRide(params)
    this.socketService.rideUpdate((msg) => {
      this.activeRide = msg
      if(this.activeRide.status == 'cancelled'){
        this.searching = false
        this.loadMap()
      }
      console.log('ride update:', msg);
    });
  }

  
}
