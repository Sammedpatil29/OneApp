import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
url = 'https://oneapp-backend.onrender.com/api/users/'
tokenUrl = 'https://oneapp-backend.onrender.com/api/login/'
token: any;

  constructor(private http: HttpClient, private router: Router) { }

  getUsers(){
return this.http.get(this.url)
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
    this.router.navigate(['/'])
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
