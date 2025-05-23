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
suggestion = 'https://oneapp-backend.onrender.com/api/suggestions/'

getProfileData(params:any){
  return this.http.post(`${this.profileUrl}user-by-token/`, params)
}

postSuggestion(params:any){
  return this.http.post(`${this.suggestion}`, params)
}
}
