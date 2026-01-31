import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  arrowBack, calendarOutline, timeOutline, moonOutline, 
  chevronDownOutline, checkmarkCircle, 
  informationCircleOutline,
  giftOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dineout-select-time',
  templateUrl: './dineout-select-time.page.html',
  styleUrls: ['./dineout-select-time.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DineoutSelectTimePage implements OnInit {

  // --- 1. Configuration (Backend Data) ---
  operatingHours = [
    { day: "Monday", slots: ["12:00 PM - 04:00 PM", "07:00 PM - 12:00 AM"] },
    { day: "Tuesday", slots: ["12:00 PM - 04:00 PM", "07:00 PM - 12:00 AM"] },
    { day: "Wednesday", slots: ["12:00 PM - 04:00 PM", "07:00 PM - 12:00 AM"] },
    { day: "Thursday", slots: ["12:00 PM - 04:00 PM", "07:00 PM - 12:00 AM"] },
    { day: "Friday", slots: ["12:00 PM - 04:00 PM", "07:00 PM - 01:00 AM"] },
    { day: "Saturday", slots: ["12:00 PM - 01:00 PM", "07:00 PM - 01:00 AM"] },
    { day: "Sunday", slots: ["12:00 PM - 12:00 AM"] }
  ];

  offers:any = [
    {
      type: "FLAT",
      title: "Flat ₹150 OFF",
      value: 150,
      description: "on orders above ₹600",
      max_discount: 150,
      applicable_for: "NEW_USER",
      min_bill_amount: 600,
      is_exclusive: true // Added for UI styling
    },
    {
      type: "PERCENTAGE",
      title: "10% Cashback",
      value: 10,
      description: "on all dineout bills",
      max_discount: null,
      applicable_for: "ALL_USER",
      min_bill_amount: 300,
      is_exclusive: false
    }
  ];

  // --- 2. State Variables ---
  restaurantName = "Club Destini - Destini Bar And Kitchen";
  guests: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, '10+'];
  selectedGuest: number = 2;
  selectedOffer: any = null;
  dates: any[] = [];
  selectedDateIdx: number = 0;

  timeSlots: any[] = [];
  selectedTimeSlot: string = '';
  
  coverCharge = 0;

  constructor() { 
    addIcons({ arrowBack, calendarOutline, timeOutline, informationCircleOutline, giftOutline, moonOutline, chevronDownOutline, checkmarkCircle });
  }

  ngOnInit() {
    this.generateDates();
    
   if (this.dates.length > 0) this.selectDate(0);
    
    // Auto-select the first offer by default
    if (this.offers.length > 0) {
      this.selectedOffer = this.offers[0];
    }
  }

  // --- Logic 1: Generate Next 15 Days & Filter Missing Days ---
  generateDates() {
    const today = new Date();
    const tempDates = [];

    // Loop for next 15 days
    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      // Get full day name (e.g., "Monday") to match your config
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }); 

      // CHECK: Does this day exist in operatingHours?
      const config = this.operatingHours.find(h => h.day === dayName);
      
      if (config) {
        // Only add if day exists in config
        tempDates.push({
          fullDate: d, 
          date: d.getDate().toString().padStart(2, '0'), // "01"
          day: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }), // "Mon"
          month: d.toLocaleDateString('en-US', { month: 'short' }), // "Feb"
          offer: this.getRandomOffer(), // Dummy offer logic
          dayConfig: config // Store the slots config for later
        });
      }
    }
    this.dates = tempDates;
  }

  // --- Logic 2: Date Selection & Slot Generation ---
  selectDate(index: number) {
    this.selectedDateIdx = index;
    const selectedDateObj = this.dates[index];
    const isToday = index === 0;
    
    // Generate slots based on THAT specific day's configuration
    if(selectedDateObj && selectedDateObj.dayConfig) {
      this.generateTimeSlots(selectedDateObj.dayConfig.slots, isToday);
    }
  }

  generateTimeSlots(ranges: string[], isToday: boolean) {
    let allSlots: any[] = [];

    ranges.forEach(range => {
      // Range format: "12:00 PM - 04:00 PM"
      const parts = range.split(' - ');
      if (parts.length === 2) {
        const slots = this.createSlotsFromRange(parts[0], parts[1], isToday);
        allSlots = [...allSlots, ...slots];
      }
    });

    this.timeSlots = allSlots;
    
    // Auto-select first slot if available
    const firstAvailable = this.timeSlots.find(s => !s.disabled);
    if (firstAvailable) {
      this.selectedTimeSlot = firstAvailable.time;
    } else {
      this.selectedTimeSlot = '';
    }
  }

  // --- Logic 3: Time Parsing (15 min intervals) ---
  createSlotsFromRange(startStr: string, endStr: string, isToday: boolean) {
    const generated = [];
    
    let startDate = this.parseTime(startStr);
    let endDate = this.parseTime(endStr);
    const now = new Date();

    // Handle crossing midnight (e.g., 11 PM to 1 AM next day)
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    // Loop by 15 minutes
    // Copy start date to avoid modifying original
    let current = new Date(startDate);

    while (current < endDate) {
      const timeString = current.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });

      const isDisabled = isToday && current < now;
      generated.push({
        time: timeString,
        offer: '15% off', // You can make this dynamic too
        disabled: isDisabled
      });

      // Add 15 minutes
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return generated;
  }

  // Helper: Convert "07:00 PM" string to Date object
  parseTime(timeStr: string) {
    const d = new Date(); // Today
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    let h = parseInt(hours);
    const m = parseInt(minutes);

    if (h === 12 && modifier === 'AM') {
      h = 0;
    } else if (h !== 12 && modifier === 'PM') {
      h += 12;
    }

    d.setHours(h, m, 0, 0);
    return d;
  }

  // --- UI Interactions ---
  selectGuest(num: number) {
    this.selectedGuest = num;
  }

  selectTime(time: string) {
    this.selectedTimeSlot = time;
  }
  
  getRandomOffer() {
    const offers = ['15% off', '20% off', '25% off'];
    return offers[Math.floor(Math.random() * offers.length)];
  }

 selectOffer(offer: any) {
    this.selectedOffer = offer;
  }

  proceed() {
    if(!this.selectedDateIdx || !this.selectedTimeSlot) return;

    const date = this.dates[this.selectedDateIdx];
    
    console.log(`BOOKING SUMMARY:
      Guests: ${this.selectedGuest}
      Date: ${date.day}, ${date.date} ${date.month}
      Time: ${this.selectedTimeSlot}
      Offer Applied: ${this.selectedOffer ? this.selectedOffer.title : 'None'}
    `);
  }
}
