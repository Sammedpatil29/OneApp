import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PropertyItem, PropertyCategory, DUMMY_PROPERTIES } from '../models/property.model';

export interface PropertyFilters {
  category?: PropertyCategory;
  city?: string;
  search?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string | number;
  furnishing?: string;
  facing?: string;
  parking?: string;
  verifiedOnly?: boolean;
  status?: string;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/api/properties`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    try {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {}
    return headers;
  }

  /**
   * Fetch properties from backend API with optional filters.
   * Gracefully falls back to DUMMY_PROPERTIES if the backend is offline or errors.
   */
  getProperties(filters?: PropertyFilters): Observable<PropertyItem[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.category) params = params.set('category', filters.category);
      if (filters.city) params = params.set('city', filters.city);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.propertyType) params = params.set('propertyType', filters.propertyType);
      if (filters.minPrice !== undefined) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.bedrooms !== undefined && filters.bedrooms !== 'all') params = params.set('bedrooms', filters.bedrooms.toString());
      if (filters.furnishing && filters.furnishing !== 'all') params = params.set('furnishing', filters.furnishing);
      if (filters.facing && filters.facing !== 'all') params = params.set('facing', filters.facing);
      if (filters.parking && filters.parking !== 'all') params = params.set('parking', filters.parking);
      if (filters.verifiedOnly !== undefined) params = params.set('verifiedOnly', filters.verifiedOnly.toString());
      if (filters.status) params = params.set('status', filters.status);
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    }

    return this.http.get<any>(this.apiUrl, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      map((res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          return res.data as PropertyItem[];
        }
        return DUMMY_PROPERTIES;
      }),
      catchError(err => {
        console.warn('PropertyService: backend fetch failed, using fallback listings', err);
        // If offline fallback, filter DUMMY_PROPERTIES locally so user still sees filtered results
        let list = [...DUMMY_PROPERTIES];
        if (filters?.category) {
          list = list.filter(p => p.category === filters.category);
        }
        // In main app, only approved and sold properties are shown
        if (filters?.status && filters.status !== 'all') {
          const allowed = filters.status.split(',').map(s => s.trim());
          list = list.filter(p => allowed.includes(p.status || 'approved'));
        } else {
          list = list.filter(p => (p.status || 'approved') === 'approved' || p.status === 'sold');
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          list = list.filter(p => p.title.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q));
        }
        if (filters?.bedrooms && filters.bedrooms !== 'all') {
          if (filters.bedrooms === '4+' || filters.bedrooms === '4_plus') {
            list = list.filter(p => (p.bedrooms || 0) >= 4);
          } else {
            list = list.filter(p => p.bedrooms === parseInt(filters.bedrooms as string, 10));
          }
        }
        if (filters?.verifiedOnly) {
          list = list.filter(p => p.tags.includes('Verified') || p.is_verified);
        }
        return of(list);
      })
    );
  }

  /**
   * Fetch single property by ID.
   * Falls back to local match in DUMMY_PROPERTIES.
   */
  getPropertyById(id: string): Observable<PropertyItem | null> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((res: any) => {
        if (res && res.success && res.data) {
          return res.data as PropertyItem;
        }
        const localMatch = DUMMY_PROPERTIES.find(p => p.id === id);
        return localMatch || null;
      }),
      catchError(err => {
        console.warn(`PropertyService: backend fetch for id ${id} failed, using local fallback`, err);
        const localMatch = DUMMY_PROPERTIES.find(p => p.id === id);
        return of(localMatch || null);
      })
    );
  }

  /**
   * Register new property listing on the backend.
   * Also prepends to DUMMY_PROPERTIES for instant local consistency.
   */
  createProperty(propertyData: Partial<PropertyItem>): Observable<{ success: boolean; data?: PropertyItem; message?: string }> {
    return this.http.post<any>(
      this.apiUrl,
      propertyData,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap((res: any) => {
        if (res && res.success && res.data) {
          const item = res.data as PropertyItem;
          const exists = DUMMY_PROPERTIES.some(p => p.id === item.id);
          if (!exists) {
            DUMMY_PROPERTIES.unshift(item);
          }
        }
      }),
      map((res: any) => {
        return {
          success: res?.success ?? true,
          data: res?.data as PropertyItem,
          message: res?.message || 'Property registered successfully!'
        };
      }),
      catchError(err => {
        console.warn('PropertyService: backend creation failed, saving to local state', err);
        const localProp = {
          ...propertyData,
          id: propertyData.id || `prop-${Date.now()}`
        } as PropertyItem;
        const exists = DUMMY_PROPERTIES.some(p => p.id === localProp.id);
        if (!exists) {
          DUMMY_PROPERTIES.unshift(localProp);
        }
        return of({
          success: true,
          data: localProp,
          message: 'Saved to local listings (offline mode)'
        });
      })
    );
  }
}

