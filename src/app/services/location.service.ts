import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private citySource = new BehaviorSubject<string>('');
  city$ = this.citySource.asObservable();

  private addressSource = new BehaviorSubject<string>('');
  address$ = this.addressSource.asObservable();
  
  coordinates: any = []
  city: any = ''
  address: any = ''
  addresslistUrl = "https://oneapp-backend.onrender.com/api/address/create/"
  addresslistByUser = "https://oneapp-backend.onrender.com/api/address/user-address/"
  deleteAddresses = "https://oneapp-backend.onrender.com/api/address/delete-address/"

  constructor(private http: HttpClient) { }

  async getCurrentPosition() {
    this.coordinates = await Geolocation.getCurrentPosition();
    this.getAddress(this.coordinates.coords.latitude, this.coordinates.coords.longitude)
    console.log('Current position:', this.coordinates);
    let finalData = {
      coords: this.coordinates,
      address: this.address
    }
    return finalData;
  }

  getAddress(lat: number, lng: number) {
    const apiKey = '7aa0aa489c7246e388e62965c4154f6b';
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`;
  
    this.http.get(url).subscribe((data: any) => {
      const components = data.results[0].components;
       this.city = components.city || components.town || components.village;
       this.address = data.results[0].formatted;

       this.citySource.next(this.city);
      this.addressSource.next(this.address);
      return this.address
       
      console.log('City:', this.city);
      console.log('Full Address:', this.address);
    });
  }

  getData(){
    return this.http.get('https://oneapp-backend.onrender.com/api/services/active/')
  }

  saveAddress(params:any){
    return this.http.post(this.addresslistUrl, params)
  }

  deleteAddress(params:any, id:any){
    return this.http.post(`${this.deleteAddresses}${id}/`, params)
  }

  getAddressesList(params:any){
    return this.http.post(this.addresslistByUser, params)
  }
}
