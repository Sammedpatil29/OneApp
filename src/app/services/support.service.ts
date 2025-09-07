import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(private http: HttpClient) { }

  createTicketUrl = 'https://oneapp-backend.onrender.com/api/ticket/user-ticket-create/'
  getTicketUrl = 'https://oneapp-backend.onrender.com/api/ticket/user-ticket-list/'

  createTicket(params:any){
    return this.http.post(this.createTicketUrl, params)
  }

  getTickets(params:any){
    return this.http.post(this.getTicketUrl, params)
  }
}

