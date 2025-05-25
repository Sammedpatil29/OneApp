import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ProfileService{
user_id: any;
  constructor(private http: HttpClient) {}

  

profileUrl = 'https://oneapp-459013.uc.r.appspot.com/api/users/'
suggestion = 'https://oneapp-459013.uc.r.appspot.com/api/suggestions/'

getProfileData(params:any){
  return this.http.post(`${this.profileUrl}user-by-token/`, params)
}

deleteProfilePermanently(params:any, id:any){
  return this.http.post(`${this.profileUrl}delete-user/`, params)
}

postSuggestion(params:any){
  return this.http.post(`${this.suggestion}`, params)
}
}
