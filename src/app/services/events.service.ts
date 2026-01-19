import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  postUrl = 'https://oneapp-backend.onrender.com/api/orders/';
  postGroceryUrl =
    'https://oneapp-backend.onrender.com/api/orders/grocery-order/';
  getEventsUrl = 'https://oneapp-express-singapore.onrender.com';
  // postDetailsUrl = 'https://oneapp-express-singapore.onrender.com/api/events/booking-details'

  //   {
  //     "id": 14,
  //     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxOCwicGhvbmUiOiI5NTkxNDIwMDY4IiwidXNlcl9uYW1lIjoiU2FtbWVkIEJpcmFkYXJwYXRpbCIsImlhdCI6MTc0ODQxNzc3Nn0.eKquCtEXSiEf5_LDKnowHiHQ3oQFPQi_rdMhwMIlSAY",
  //     "service_name": "events",
  //     "category": "event",
  //     "service_image": "",
  //     "provider_id": "1",
  //     "provider_name": "sammed",
  //     "scheduled_date": "2025-05-30T15:41:38.132193Z",
  //     "scheduled_time": "2025-05-30T15:41:38.132219Z",
  //     "address": "rjfgrf",
  //     "status": "completed",
  //     "price": "30.00",
  //     "payment": "done",
  //     "created_at": "2025-05-30T15:41:38.132299Z",
  //     "user": 18
  // }

  constructor(private http: HttpClient) {}

  getEvents(token: string) {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  
  return this.http.get(`${this.getEventsUrl}/api/events`, { headers: headers });
}

  // createOrder(params: any) {
  //   return this.http.post(this.postUrl, params);
  // }

  createGroceryOrder(params: any) {
    return this.http.post(this.postGroceryUrl, params);
  }

  getEventDetails(params:any, token: any) {
    let headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.post(`${this.getEventsUrl}/api/events/booking-details`, params, { headers: headers });
  }

  checkAvailability(params:any){
    return this.http.post(`${this.getEventsUrl}/api/events/check-availability`, params);
  }

  createRazorpayOrder(params: any, token: any) {
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    })
    return this.http.post(`${this.getEventsUrl}/api/payment/create-order`, params, { headers: headers });
  }

  verifyPayment(params: any) {
    return this.http.post(`${this.getEventsUrl}/api/payment/verify-status`, params);
  }

  fetchOrderDetails(params:any){
    return this.http.post(`${this.getEventsUrl}/api/events/order-details`, params)
  }
}
