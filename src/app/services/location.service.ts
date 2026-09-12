import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { BehaviorSubject, Observable, map, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private citySource = new BehaviorSubject<string>('');
  city$ = this.citySource.asObservable();

  private locationSource = new BehaviorSubject<any>(null);
  location$ = this.locationSource.asObservable();

  private addressSource = new BehaviorSubject<string>('');
  address$ = this.addressSource.asObservable();

  coordinates: any = [];
  city: any = '';
  address: any = '';

  polygonUrl = environment.apiUrl;
  addressUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Check current GPS permission status
   */
  async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      return await Geolocation.checkPermissions();
    } catch (e) {
      return { location: 'prompt', coarseLocation: 'prompt' } as PermissionStatus;
    }
  }

  /**
   * Prompt user to grant GPS permission
   */
  async requestLocationPermission(): Promise<PermissionStatus> {
    try {
      return await Geolocation.requestPermissions();
    } catch (e) {
      return { location: 'denied', coarseLocation: 'denied' } as PermissionStatus;
    }
  }

  async getCurrentPosition() {
    try {
      const perm = await this.checkLocationPermission();
      if (perm.location !== 'granted') {
        const requested = await this.requestLocationPermission();
        if (requested.location !== 'granted') {
          console.warn('Location permission denied by user.');
          return null;
        }
      }

      this.coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      if (this.coordinates?.coords) {
        this.getAddress(this.coordinates.coords.latitude, this.coordinates.coords.longitude);
        const finalData = {
          coords: this.coordinates,
          address: this.address
        };
        return finalData;
      }
      return null;
    } catch (e) {
      console.warn('Could not fetch GPS coordinates:', e);
      return null;
    }
  }

  getAddress(lat: number, lng: number) {
    const apiKey = '7aa0aa489c7246e388e62965c4154f6b';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        const components = data?.results?.[0]?.components;
        if (components) {
          this.city = components.city || components.town || components.village || components.county || '';
          this.address = data?.results?.[0]?.formatted || '';

          if (this.city) this.citySource.next(this.city);
          if (this.address) this.addressSource.next(this.address);
        }
      },
      error: (err) => console.warn('Geocoding error:', err)
    });
  }

  /**
   * Fetch all active service areas from backend
   * GET /api/service-areas?active=true
   */
  getServiceAreas(activeOnly: boolean = true): Observable<any> {
    const query = activeOnly ? '?active=true' : '';
    return this.http.get(`${this.polygonUrl}/api/service-areas${query}`);
  }

  /**
   * Validate coordinates against backend service areas
   * POST /api/service-areas/check
   */
  checkLocationInServiceArea(lat: number, lng: number): Observable<any> {
    return this.http.post(`${this.polygonUrl}/api/service-areas/check`, { lat, lng });
  }

  /**
   * Fetch polygon data (dynamically from service areas, with fallback to legacy metadata)
   */
  getPolygonData(): Observable<any> {
    return this.getServiceAreas(true).pipe(
      map((res: any) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const primary = res.data[0];
          return {
            success: true,
            data: {
              polygon: primary.polygon || [],
              border_color: primary.strokeColor || '#a000e2',
              inside_color: primary.areaColor || '#a000e2',
              city: primary.cityName || 'Athani',
              allAreas: res.data
            }
          };
        }
        throw new Error('No active service areas configured');
      }),
      catchError(() => {
        const params = { "fields": ["polygon"] };
        return this.http.post(`${this.polygonUrl}/api/metadata/query`, { params });
      })
    );
  }

  getData() {
    return this.http.get('https://oneapp-backend.onrender.com/api/services/active/');
  }

  saveAddress(params: any, token: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.addressUrl}/api/addresses`, params, { headers });
  }

  deleteAddress(token: any, id: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.addressUrl}/api/addresses/${id}`, { headers });
  }

  getAddressesList(token: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.addressUrl}/api/addresses`, { headers });
  }

  setAddress(location: any) {
    this.locationSource.next(location);
    localStorage.setItem('location', JSON.stringify(location));
  }
}
