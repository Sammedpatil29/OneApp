import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private http: HttpClient) { }

  // createTicketUrl = 'https://oneapp-backend.onrender.com/api/ticket/user-ticket-create/'
  // getTicketUrl = 'https://oneapp-backend.onrender.com/api/ticket/user-ticket-list/'

  url = environment.apiUrl

  createTicket(params:any){
    return this.http.post(`${this.url}/api/tickets/create`, params)
  }

  getTickets(){
    let headers = {
      "authorization": `Bearer ${localStorage.getItem('auth-token')}`
    }
    return this.http.get(`${this.url}/api/tickets/user`, { headers })
  }

  closeTicket(id:any, params:any){
    let headers = {
      "authorization": `Bearer ${localStorage.getItem('auth-token')}`
    }
    return this.http.put(`${this.url}/api/tickets/${id}`, params, { headers })
  }
}

