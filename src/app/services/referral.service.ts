import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ReferralStats {
  total_invites: number;
  completed_invites: number;
  total_earnings: number;
  reward_per_referral: number;
}

export interface ReferralRecord {
  id: string;
  referee_name: string;
  status: 'REGISTERED' | 'COMPLETED' | 'EXPIRED';
  reward_amount: number;
  reward_credited: boolean;
  signup_date: string;
}

export interface ReferralDetailsResponse {
  success: boolean;
  referral_code: string;
  stats: ReferralStats;
  referrals: ReferralRecord[];
  message?: string;
}

export interface ReferralValidationResponse {
  success: boolean;
  valid: boolean;
  referrer_name?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Validate a referral code (public, called during registration)
   */
  validateReferralCode(code: string): Observable<ReferralValidationResponse> {
    return this.http.post<ReferralValidationResponse>(`${this.apiUrl}/api/referral/validate`, {
      referral_code: code.trim()
    });
  }

  /**
   * Get referral dashboard details & stats for the authenticated user
   */
  getReferralDetails(): Observable<ReferralDetailsResponse> {
    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<ReferralDetailsResponse>(`${this.apiUrl}/api/referral/details`, { headers });
  }
}

