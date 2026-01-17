import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
url = 'https://oneapp-express-singapore.onrender.com/'
tokenUrl = 'https://oneapp-backend.onrender.com/api/login/'
token: any;

  constructor(private http: HttpClient, private router: Router, private navCtrl: NavController) { }

  getUsers(){
return this.http.get(this.url)
  }

  sendOtp(testMobileNumber: string, otp: string): Observable<any> {
  return this.http.post('http://localhost:3000/send-otp', {
    mobileNumber: testMobileNumber,
    otp: otp,
  });
}

  register(params:any){
    return this.http.post(`${this.url}register`, params)
  }

  checkUser(params:any){
    return this.http.post(`${this.url}login`, params)
  }

  verifyToken(token: string) {
    // 1. Create the headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 2. Pass headers in the request options
    // Note: I removed the trailing slash '/' to match your Node route exactly
    return this.http.get(`${this.url}verify-token`, { headers: headers });
  }

  async logout(){
    await Preferences.remove({key: 'auth-token'})
    await Preferences.remove({key: 'user_id'})
    localStorage.removeItem('location')
    this.navCtrl.navigateRoot(['/login']);
  }

  async getToken(){
    const token = await Preferences.get({ key: 'auth-token' });
    console.log(token)
    return token.value
  }

  // response:any
  // async getUserId(){
  //   const token = await this.getToken()
  //   console.log(token)
  //   let params = {
  //     "token": token
  //   }
  //   this.verifyToken(params).subscribe(res => {
  //     this.response = res
  //     const user_id = this.response.data.user_id
  //     console.log(user_id)
  //     Preferences.set({key: 'user_id', value: String(user_id)})
  //   })
  // }

  
}
