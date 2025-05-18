import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ProfileService{
user_id: any;
  constructor(private http: HttpClient) {}

  

profileUrl = 'https://oneapp-backend.onrender.com/api/users/'

getProfileData(user_id:any){
  console.log(user_id)
  return this.http.get(`${this.profileUrl}${user_id.value}/`)
}
}
