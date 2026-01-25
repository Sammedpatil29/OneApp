import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RideService {
private apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
private apiKey = 'AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0';
private createRideUrl = 'https://oneapp-express-singapore.onrender.com/api/ride/create';
url = 'https://oneapp-express-singapore.onrender.com';

  constructor(private http: HttpClient) { }


getRoute(origin: { lat: number, lng: number }, destination: { lat: number, lng: number }, mode: string = 'DRIVE') {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters'
    });

    const body = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng
          }
        }
      },
      travelMode: mode
    };

    return this.http.post<any>(this.apiUrl, body, { headers });
  }

 createRide(params:any){
    return this.http.post<any>(`${this.url}/api/ride/create`, params);
 }

  // Method to establish a WebSocket connection to listen for updates
  connectToRideSocket(rideId: number): WebSocket {
    const socket = new WebSocket(`ws://oneapp-express-singapore.onrender.com/ws/ride/${rideId}`); // WebSocket URL for the ride
    return socket;
  }

  getTripOptions(params: any) {
    return this.http.post<any>(`${this.url}/api/ride/estimate`, params)
  }


}