import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = environment.apiUrl;
  token: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private navCtrl: NavController
  ) {}

  getUsers(): Observable<any> {
    return this.http.get(this.url);
  }

  /**
   * Send Email OTP to customer
   */
  sendEmailOtp(email: string): Observable<any> {
    return this.http.post(`${this.url}/send-otp`, { email });
  }

  /**
   * Verify Customer Email OTP
   */
  verifyEmailOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.url}/verify-otp`, { email, otp });
  }

  /**
   * Legacy phone send OTP (fallback for SMS)
   */
  sendOtp(testMobileNumber: string, otp: string): Observable<any> {
    return this.http.post(`${this.url}/send-otp`, {
      mobileNumber: testMobileNumber,
      otp: otp,
    });
  }

  register(params: any): Observable<any> {
    return this.http.post(`${this.url}/register`, params);
  }

  checkUser(params: any): Observable<any> {
    return this.http.post(`${this.url}/login`, params);
  }

  verifyToken(token: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.url}/verify-token`, { headers });
  }

  hasToken(): boolean {
    const token = localStorage.getItem('auth-token');
    return !!token && token.trim().length > 0;
  }

  getCurrentUser(): any {
    try {
      const u = localStorage.getItem('userDetails');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }

  saveSession(token: string, user: any) {
    if (token) {
      localStorage.setItem('auth-token', token);
    }
    if (user) {
      const details = {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        profile_image: user.profile_image
      };
      localStorage.setItem('userDetails', JSON.stringify(details));
      if (user.id) {
        localStorage.setItem('user_id', String(user.id));
      }
    }
  }

  async logout() {
    localStorage.removeItem('location');
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('userDetails');
    this.navCtrl.navigateRoot(['/login']);
  }

  async getToken(): Promise<string | null> {
    const token = localStorage.getItem('auth-token');
    return token;
  }
}
