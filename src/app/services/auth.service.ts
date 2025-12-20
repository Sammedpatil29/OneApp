import { HttpClient } from '@angular/common/http';
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
url = 'https://oneapp-backend.onrender.com/api/users/'
tokenUrl = 'https://oneapp-backend.onrender.com/api/login/'
token: any;

private apiUrl = 'https://api.msg91.com/api/v5/otp';

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

  postNewUser(params:any){
    return this.http.post(this.url, params)
  }

  checkUser(params:any){
    return this.http.post(`${this.url}check-phone/`, params)
  }

  createToken(params:any){
    return this.http.post(`${this.tokenUrl}create-token/`, params)
  }

  verifyToken(params:any){
    return this.http.post(`${this.tokenUrl}verify-token/`, params)
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

  response:any
  async getUserId(){
    const token = await this.getToken()
    console.log(token)
    let params = {
      "token": token
    }
    this.verifyToken(params).subscribe(res => {
      this.response = res
      const user_id = this.response.data.user_id
      console.log(user_id)
      Preferences.set({key: 'user_id', value: String(user_id)})
    })
  }

  
}
