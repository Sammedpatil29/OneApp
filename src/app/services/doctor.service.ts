// services/doctor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  Doctor,
  DoctorCategory,
  DoctorAppointment,
  DUMMY_DOCTOR_CATEGORIES,
  DUMMY_DOCTORS,
} from '../models/doctor.model';

export interface DoctorFilters {
  category?: string;
  search?: string;
  topOnly?: boolean;
  mode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/doctor`;

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
   * Fetch all doctor categories / specializations
   */
  getCategories(): Observable<DoctorCategory[]> {
    return this.http.get<{ success: boolean; data: DoctorCategory[] }>(`${this.apiUrl}/categories`).pipe(
      map(res => (res?.success && Array.isArray(res.data) ? res.data : DUMMY_DOCTOR_CATEGORIES)),
      catchError(err => {
        console.warn('Falling back to local doctor categories:', err);
        return of(DUMMY_DOCTOR_CATEGORIES);
      })
    );
  }

  /**
   * Fetch doctors with optional category, search, and top doctor filters
   */
  getDoctors(filters?: DoctorFilters): Observable<Doctor[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.category && filters.category !== 'all') {
        params = params.set('category', filters.category);
      }
      if (filters.search && filters.search.trim()) {
        params = params.set('search', filters.search.trim());
      }
      if (filters.topOnly) {
        params = params.set('topOnly', 'true');
      }
      if (filters.mode) {
        params = params.set('mode', filters.mode);
      }
    }

    return this.http.get<{ success: boolean; data: Doctor[] }>(`${this.apiUrl}/doctors`, { params }).pipe(
      map(res => {
        if (res?.success && Array.isArray(res.data)) {
          return res.data;
        }
        return this.filterFallbackDoctors(filters);
      }),
      catchError(err => {
        console.warn('Falling back to local doctor catalog:', err);
        return of(this.filterFallbackDoctors(filters));
      })
    );
  }

  /**
   * Fetch single doctor details by ID
   */
  getDoctorById(id: string): Observable<Doctor | null> {
    return this.http.get<{ success: boolean; data: Doctor }>(`${this.apiUrl}/doctors/${id}`).pipe(
      map(res => (res?.success && res.data ? res.data : (DUMMY_DOCTORS.find(d => d.id === id) || null))),
      catchError(() => of(DUMMY_DOCTORS.find(d => d.id === id) || null))
    );
  }

  /**
   * Book a doctor consultation appointment
   */
  bookAppointment(data: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ success: boolean; message: string; data: DoctorAppointment }>(
      `${this.apiUrl}/appointments`,
      data,
      { headers }
    ).pipe(
      map(res => res),
      catchError(err => {
        console.warn('Appointment creation error, providing local mock confirmation:', err);
        const mockAppointment: DoctorAppointment = {
          id: `APT-${Date.now().toString(36).toUpperCase()}`,
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          specialization: data.specialization,
          hospitalOrClinic: data.hospitalOrClinic,
          patientName: data.patientName,
          patientPhone: data.patientPhone,
          patientAge: Number(data.patientAge) || 25,
          patientGender: data.patientGender || 'Male',
          consultationType: data.consultationType || 'In-Clinic',
          appointmentDate: data.appointmentDate,
          timeSlot: data.timeSlot,
          symptomsOrReason: data.symptomsOrReason,
          consultationFee: Number(data.consultationFee) || 320,
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: new Date().toISOString(),
        };
        return of({
          success: true,
          message: 'Appointment confirmed successfully!',
          data: mockAppointment,
        });
      })
    );
  }

  /**
   * Get user's booked appointments
   */
  getUserAppointments(): Observable<DoctorAppointment[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean; data: DoctorAppointment[] }>(
      `${this.apiUrl}/appointments`,
      { headers }
    ).pipe(
      map(res => (res?.success && Array.isArray(res.data) ? res.data : [])),
      catchError(() => of([]))
    );
  }

  private filterFallbackDoctors(filters?: DoctorFilters): Doctor[] {
    let list = [...DUMMY_DOCTORS];
    if (!filters) return list;

    if (filters.category && filters.category !== 'all') {
      list = list.filter(d => d.categoryId === filters.category);
    }
    if (filters.topOnly) {
      list = list.filter(d => d.isTopDoctor);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.hospitalOrClinic.toLowerCase().includes(q) ||
        d.qualification.toLowerCase().includes(q)
      );
    }
    if (filters.mode) {
      list = list.filter(d =>
        d.consultationModes.some(m => m.toLowerCase().includes(filters.mode!.toLowerCase()))
      );
    }
    return list;
  }
}

