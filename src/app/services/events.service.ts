import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService{
  postUrl = 'https://oneapp-backend.onrender.com/api/orders/'

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

  constructor(private http: HttpClient) { }

  getServices(){
    return this.http.get('assets/json/events.json')
  }

  createOrder(params:any){
    return this.http.post(this.postUrl, params)
  }
}
