import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface VehicleTripOption {
  type: 'bike' | 'auto' | 'cab' | 'parcel';
  image_url: string;
  max_person: string;
  estimated_time: string;
  estimated_reach_time: string;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  private apiKey = 'AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0';
  url = environment.apiUrl || 'https://pintu-api.democompany.in.net';

  constructor(private http: HttpClient) {}

  /**
   * Request Google computeRoutes API for distance & duration calculation
   */
  getRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string = 'DRIVE'): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
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

  /**
   * Fetch trip options and dynamic pricing estimates from Express backend
   */
  getTripOptions(params: any): Observable<VehicleTripOption[]> {
    return this.http.post<VehicleTripOption[]>(`${this.url}/api/ride/estimate`, params);
  }

  /**
   * Create a new ride request and initiate captain matching
   */
  createRide(params: any): Observable<any> {
    return this.http.post<any>(`${this.url}/api/ride/create`, params);
  }

  /**
   * Local fallback fare computation if network is offline
   */
  computeFallbackTripOptions(distanceKm: number, durationMins: number): VehicleTripOption[] {
    const safeKm = Math.max(0.5, distanceKm || 1);
    const safeMins = Math.max(3, Math.ceil(durationMins || 5));

    const options = [
      { type: 'bike' as const, image_url: 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png', max_person: 'max 1 person', base: 20, rate: 10 },
      { type: 'auto' as const, image_url: 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png', max_person: 'max 3 persons', base: 30, rate: 15 },
      { type: 'cab' as const, image_url: 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png', max_person: 'max 4 persons', base: 50, rate: 25 },
      { type: 'parcel' as const, image_url: 'assets/icon/ChatGPT Image Oct 14, 2025, 07_41_18 PM.png', max_person: '20 kgs', base: 40, rate: 12 }
    ];

    const arrivalDate = new Date(Date.now() + safeMins * 60000);
    const estimated_reach_time = arrivalDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();

    return options.map(opt => ({
      type: opt.type,
      image_url: opt.image_url,
      max_person: opt.max_person,
      estimated_time: `${safeMins} mins`,
      estimated_reach_time: estimated_reach_time,
      price: Math.ceil(opt.base + (safeKm * opt.rate))
    }));
  }
}