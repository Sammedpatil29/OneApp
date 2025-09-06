import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;
declare var RazorpayCheckout: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  constructor(private http: HttpClient) { }

 payWithRazorpayCardOVA(amount: number, name: string, email: string, contact: string): Observable<any> {
    return new Observable(observer => {
      const options = {
        description: 'Test Payment',
        currency: 'INR',
        key: 'rzp_live_p6MXH1oq4BBYPk',
        amount: amount,
        name: name || 'MyApp',
        prefill: {
          email: email || '',
          contact: contact || '',
          name: name || ''
        },
        theme: { color: '#050505ff' }
      };

      RazorpayCheckout.open(
        options,
        (success: any) => {
          observer.next(success);  // Emit payment success
          observer.complete();     // Complete the observable
        },
        (error: any) => {
          observer.error(error);   // Emit the error
        }
      );
    });
  }
}
