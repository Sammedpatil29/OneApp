import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app'

@Injectable({
  providedIn: 'root'
})
export class ProfileService{
user_id: any;
  constructor(private http: HttpClient) {}

  

profileUrl = 'https://oneapp-backend.onrender.com/api/users/'
suggestion = 'https://oneapp-backend.onrender.com/api/suggestions/'
updateDetails = 'https://oneapp-backend.onrender.com/api/address/'
bannerUrl = 'https://oneapp-backend.onrender.com/api/banner/banners/'

url = 'https://oneapp-express-singapore.onrender.com/'


// getProfileData(params:any){
//   return this.http.post(`${this.profileUrl}user-by-token/`, params)
// }

getProfileData(token: string) {
    // 1. Create the headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.url}user`, { headers: headers });
  }

async getAppVersion(): Promise<string | null> {
    try {
      const appInfo = await App.getInfo();
      const appVersion = appInfo.version; // app version
      console.log('App Version:', appVersion);
      return appVersion; // Return the version
    } catch (error) {
      console.error('Error retrieving app version', error);
      return null;
    }
  }

deleteProfilePermanently(params:any, id:any){
  return this.http.post(`${this.profileUrl}delete-user/`, params)
}

postSuggestion(params:any){
  return this.http.post(`${this.suggestion}`, params)
}

updateUser(params: any, token: any) {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  // Correct order: url, body (params), options ({ headers })
  return this.http.patch(`${this.url}user`, params, { headers: headers });
}

getBanners(type:any){
  return this.http.get(`${this.bannerUrl}?type=${type}`)
}
}
