import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle, calendarOutline, timeOutline, 
  peopleOutline, locationOutline, callOutline, homeOutline,
  ticketOutline, walletOutline, cameraOutline, receiptOutline, cloudUploadOutline, closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dineout-track',
  templateUrl: './dineout-track.page.html',
  styleUrls: ['./dineout-track.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DineoutTrackPage implements OnInit {

  booking: any = null;
  bookingId = 'DIN-882910'; // Default fallback
  
  // Logic State
  isBillWindowOpen = false; // Controls visibility of Pay/Upload section

  constructor(private router: Router, private navCtrl: NavController) { 
    addIcons({ 
      checkmarkCircle, calendarOutline, timeOutline, 
      peopleOutline, locationOutline, callOutline, homeOutline,
      ticketOutline, walletOutline, cameraOutline, receiptOutline, cloudUploadOutline, closeCircleOutline
    });
  }

  ngOnInit() {
    this.loadBookingData();
  }

  loadBookingData() {
    // 1. Try getting data from Router State (Immediate visual)
    const nav = this.router.getCurrentNavigation();
    if (nav && nav.extras && nav.extras.state) {
      this.booking = nav.extras.state['booking'];
      this.checkBillActionWindow();
    } else {
      // 2. Fallback: If page refreshed, simulate API call or redirect
      console.warn('No state found, using dummy data for demo');
      this.mockDummyData();
    }
  }

  // --- Core Logic: Check if within 30min before -> 24hrs after ---
  checkBillActionWindow() {
    if (!this.booking) return;

    try {
      const now = new Date();
      
      // 1. Combine Date + Time Slot into a Date Object
      // booking.date format: "Tue Feb 14 2026"
      // booking.timeSlot format: "07:30 PM - 08:00 PM"
      const dateStr = this.booking.date; 
      const timeStr = this.booking.timeSlot.split(' - ')[0]; // Take start time "07:30 PM"

      const bookingDateTime = this.parseDateTime(dateStr, timeStr);

      // 2. Define Windows
      // Start: 30 mins before booking
      const windowStart = new Date(bookingDateTime);
      windowStart.setMinutes(windowStart.getMinutes() - 30);

      // End: 24 hours after booking
      const windowEnd = new Date(bookingDateTime);
      windowEnd.setHours(windowEnd.getHours() + 24);

      // 3. Compare
      this.isBillWindowOpen = now >= windowStart && now <= windowEnd;

      console.log('Window Open?', this.isBillWindowOpen);

    } catch (e) {
      console.error('Error parsing date/time', e);
      this.isBillWindowOpen = false; // Fail safe
    }
  }

  // Helper: Combine Date String + Time String (Fixed)
  parseDateTime(dateString: string, timeString: string): Date {
    const d = new Date(dateString); // Parses "Tue Feb 14 2026"
    
    // Split "07:30 PM" -> time="07:30", modifier="PM"
    const [time, modifier] = timeString.split(' ');
    let [hoursStr, minsStr] = time.split(':');
    
    let h = parseInt(hoursStr);
    let m = parseInt(minsStr);

    // Convert 12h to 24h
    if (h === 12 && modifier === 'AM') {
      h = 0;
    } else if (h !== 12 && modifier === 'PM') {
      h += 12;
    }

    d.setHours(h, m, 0, 0);
    return d;
  }

  // Actions
  payBillNow() {
    console.log('Launching Payment Gateway...');
  }

  uploadBill() {
    console.log('Opening Camera/Gallery...');
  }

  getOfferText() {
    return this.booking?.offerApplied?.title || 'No offer applied';
  }

  goHome() {
    this.navCtrl.navigateRoot('/home'); 
  }

  callRestaurant() {
    console.log('Calling restaurant...');
  }
  
  getDirections() {
    console.log('Opening maps...');
  }

  // For development testing if router state is lost
  mockDummyData() {
    const today = new Date();
    this.booking = {
      restaurantName: "Club Destini - Destini Bar And Kitchen",
      date: today.toDateString(), 
      timeSlot: "12:00 PM - 04:00 PM", // Ensure this matches logic
      guestCount: 2,
      billDetails: { totalAmount: 40 },
      offerApplied: { title: "Flat 10% Off" }
    };
    this.checkBillActionWindow();
  }
}