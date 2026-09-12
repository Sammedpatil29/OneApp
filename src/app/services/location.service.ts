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

  /**
   * Comprehensive location check: returns precise status (ok, permission_denied, gps_disabled)
   */
  async getDetailedPosition(): Promise<{
    status: 'ok' | 'permission_denied' | 'gps_disabled' | 'error';
    coords?: { latitude: number; longitude: number };
    address?: string;
    city?: string;
    error?: any;
  }> {
    // 1. Check permission first
    let perm: PermissionStatus;
    try {
      perm = await this.checkLocationPermission();
      if (perm.location === 'prompt' || perm.location === 'prompt-with-rationale') {
        perm = await this.requestLocationPermission();
      }
      if (perm.location !== 'granted') {
        return { status: 'permission_denied' };
      }
    } catch (err) {
      return { status: 'permission_denied', error: err };
    }

    // 2. Permission is granted. Now try to fetch current GPS coordinates
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 3000
      });

      if (position?.coords) {
        this.coordinates = position;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.getAddress(lat, lng);

        return {
          status: 'ok',
          coords: { latitude: lat, longitude: lng },
          address: this.address,
          city: this.city
        };
      }
      return { status: 'gps_disabled' };
    } catch (posErr: any) {
      console.warn('Geolocation.getCurrentPosition error:', posErr);
      const msg = (posErr?.message || '').toLowerCase();
      const code = posErr?.code;
      if (code === 1 || msg.includes('denied') || msg.includes('permission')) {
        return { status: 'permission_denied', error: posErr };
      }
      return { status: 'gps_disabled', error: posErr };
    }
  }

  /**
   * Continuous Location Watch
   */
  async watchPosition(callback: (pos: any, err?: any) => void): Promise<string | null> {
    try {
      const watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (position, err) => {
          if (position?.coords) {
            this.coordinates = position;
            callback(position, null);
          } else if (err) {
            callback(null, err);
          }
        }
      );
      return String(watchId);
    } catch (e) {
      console.warn('watchPosition failed:', e);
      return null;
    }
  }

  async clearWatch(watchId: string): Promise<void> {
    try {
      await Geolocation.clearWatch({ id: watchId });
    } catch (e) {
      console.warn('clearWatch failed:', e);
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
   * Fetch polygon data strictly from service areas (no legacy metadata fallback)
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
        return { success: false, data: { polygon: [], allAreas: [] } };
      }),
      catchError(() => {
        return new Observable(subscriber => {
          subscriber.next({ success: false, data: { polygon: [], allAreas: [] } });
          subscriber.complete();
        });
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

  updateAddress(id: number | string, params: any, token: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.addressUrl}/api/addresses/${id}`, params, { headers });
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

  setAddress(location: any, token?: string) {
    this.locationSource.next(location);
    localStorage.setItem('location', JSON.stringify(location));

    // If selected address is a saved address with ID and token is provided, mark as primary in DB
    if (location?.id && token) {
      this.setPrimaryAddress(location.id, token).subscribe({
        next: () => console.log(`✅ Saved address #${location.id} marked as primary in DB`),
        error: (err) => console.warn('Could not mark address as primary in DB:', err)
      });
    }
  }

  /**
   * Mark an address as primary in the database
   * PUT /api/addresses/:id/set-primary
   */
  setPrimaryAddress(addressId: number | string, token: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put(`${this.addressUrl}/api/addresses/${addressId}/set-primary`, {}, { headers });
  }

  /**
   * Get the user's primary address from the database
   * GET /api/addresses/primary
   */
  getPrimaryAddress(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.addressUrl}/api/addresses/primary`, { headers });
  }
}
