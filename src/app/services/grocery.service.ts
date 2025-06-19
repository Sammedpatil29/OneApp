import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroceryService{

  getGroceryUrl = 'https://oneapp-backend.onrender.com/api/grocery/grocery-list/'

  constructor(private http: HttpClient) { }

  getGroceryList(params:any){
    return this.http.post(this.getGroceryUrl, params)
}
}
