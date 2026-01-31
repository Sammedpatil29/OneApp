import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import { 
  arrowBack, shareSocialOutline, heartOutline, heart,
  star, timeOutline, callOutline, locationOutline,
  navigateOutline, imagesOutline, chevronDownOutline, chevronUpOutline,
  informationCircleOutline, wifiOutline, snowOutline,
  carOutline, wineOutline, musicalNotesOutline, cardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dineout-hotel-details',
  templateUrl: './dineout-hotel-details.page.html',
  styleUrls: ['./dineout-hotel-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DineoutHotelDetailsPage implements OnInit {

  // Active Tab State
  activeSegment = 'offers';
  showHours = false;

  // Dummy Data matching the screenshot
  restaurant = {
    name: 'Poco A Poco - Crescendo',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryCount: 20,
    distance: '8.5 km',
    location: 'Akshay Nagar, Bangalore',
    tags: 'Continental, North Indian',
    price: '₹1200 for two',
    rating: 5.0,
    ratingCount: 14,
    isOpen: true,
    openTime: '7:30AM',
    contact: '+91 9876543210',
    coords: { lat: 12.9352, lng: 77.6245 },
    isFav: false,
    isVeg: true,
    openingHours: [
      { day: 'Monday', slots: ['12:00 PM - 04:00 PM', '07:00 PM - 12:00 AM'] },
      { day: 'Tuesday', slots: ['12:00 PM - 04:00 PM', '07:00 PM - 12:00 AM'] },
      { day: 'Wednesday', slots: ['12:00 PM - 04:00 PM', '07:00 PM - 12:00 AM'] },
      { day: 'Thursday', slots: ['12:00 PM - 04:00 PM', '07:00 PM - 12:00 AM'] },
      { day: 'Friday', slots: ['12:00 PM - 04:00 PM', '07:00 PM - 01:00 AM'] },
      { day: 'Saturday', slots: ['12:00 PM - 01:00 PM', '07:00 PM - 01:00 AM'] },
      { day: 'Sunday', slots: ['12:00 PM - 12:00 AM'] }
    ],
    address: '123, 4th Cross, Indiranagar, Bangalore - 560038',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31120.256132278104!2d77.68693908173829!3d12.841207627641785!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6d6289e4d8e9%3A0x5ad05b7fa73638e4!2sM5%20Ecity%20Mall!5e0!3m2!1sen!2sin!4v1769839022454!5m2!1sen!2sin',
    offers: [
      {
    type: 'FLAT',
    value: 150, // "Flat ₹150 OFF"
    min_bill_amount: 600,
    max_discount: 150,
    title: 'Flat ₹150 OFF',
    description: 'on orders above ₹600',
    applicable_for: 'NEW_USER'
  },
  {
    type: 'PERCENTAGE',
    value: 10, // "Flat ₹150 OFF"
    min_bill_amount: 300,
    max_discount: null,
    title: '10% Cashback',
    description: 'on all dineout bills',
    applicable_for: 'ALL_USER'
  }
    ],
    menuItems: [
    { title: 'Main Course', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80' },
    { title: 'Starters', img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80' },
    { title: 'Drinks', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&q=80' },
    { title: 'Desserts', img: 'https://images.unsplash.com/photo-1563729768-7491b31b7b93?w=200&q=80' },
  ],
  restaurantPhotos: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=500&q=80',
    'https://images.unsplash.com/photo-1554679665-f5537f187268?w=500&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&q=80',
    'https://images.unsplash.com/photo-1560624052-449f5ddf0c31?w=500&q=80',
  ],
  amenities: [
    { name: 'Wifi', icon: 'wifi-outline' },
    { name: 'AC', icon: 'snow-outline' },
    { name: 'Parking', icon: 'car-outline' },
    { name: 'Bar', icon: 'wine-outline' },
    { name: 'Music', icon: 'musical-notes-outline' },
    { name: 'Card', icon: 'card-outline' },
  ]
  };

    

  bgColorStyle = [
  'linear-gradient(to right, #0e4d2a, #15663a)'
];

  safeMapUrl!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    addIcons({ 
      arrowBack, shareSocialOutline, heartOutline, heart,
      star, timeOutline, callOutline, locationOutline,
      navigateOutline, imagesOutline, chevronDownOutline, chevronUpOutline,
      informationCircleOutline, wifiOutline, snowOutline,
      carOutline, wineOutline, musicalNotesOutline, cardOutline
    });
  }

  ngOnInit() {
    this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.restaurant.mapEmbedUrl);
    this.checkRestaurantStatus();
  }

  callRestaurant(){
    window.open(`tel:${this.restaurant.contact}`, '_self');
  }

  openMap(){
    const lat = this.restaurant.coords.lat;
    const lng = this.restaurant.coords.lng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  }

  toggleHours() {
    this.showHours = !this.showHours;
  }

  getOfferBgStyle() {
    return this.bgColorStyle[Math.floor(Math.random() * this.bgColorStyle.length)];
  }

  checkRestaurantStatus() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    let isOpen = false;

    // 1. Check Today's Schedule
    const todaySchedule = this.restaurant.openingHours.find(h => h.day === currentDay);
    if (todaySchedule) {
      for (const slot of todaySchedule.slots) {
        if (this.isTimeInSlot(now, slot)) {
          isOpen = true;
          break;
        }
      }
    }

    // 2. Check Yesterday's Schedule (for late night slots spilling over to today)
    if (!isOpen) {
      const yesterdayIndex = (now.getDay() + 6) % 7;
      const yesterdayDay = days[yesterdayIndex];
      const yesterdaySchedule = this.restaurant.openingHours.find(h => h.day === yesterdayDay);
      if (yesterdaySchedule) {
        for (const slot of yesterdaySchedule.slots) {
           if (this.isTimeInSlot(now, slot, true)) {
             isOpen = true;
             break;
           }
        }
      }
    }

    this.restaurant.isOpen = isOpen;

    if (!isOpen) {
      this.updateNextOpenTime(now, currentDay);
    }
  }

  isTimeInSlot(now: Date, slot: string, isYesterday: boolean = false): boolean {
    const [startStr, endStr] = slot.split(' - ');
    const baseDate = new Date(now);
    if (isYesterday) baseDate.setDate(baseDate.getDate() - 1);

    const startTime = this.parseTime(startStr, baseDate);
    let endTime = this.parseTime(endStr, baseDate);

    // Handle overnight slots (e.g. 7 PM - 1 AM)
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return now >= startTime && now <= endTime;
  }

  parseTime(timeStr: string, baseDate: Date): Date {
    const d = new Date(baseDate);
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  updateNextOpenTime(now: Date, currentDay: string) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = days.indexOf(currentDay);

    // Check remaining slots today
    const todaySchedule = this.restaurant.openingHours.find(h => h.day === currentDay);
    if (todaySchedule) {
      for (const slot of todaySchedule.slots) {
        const [startStr] = slot.split(' - ');
        const startTime = this.parseTime(startStr, now);
        if (startTime > now) {
          this.restaurant.openTime = startStr;
          return;
        }
      }
    }

    // Check next days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (dayIndex + i) % 7;
      const nextDay = days[nextDayIndex];
      const schedule = this.restaurant.openingHours.find(h => h.day === nextDay);
      if (schedule && schedule.slots.length > 0) {
        const firstSlot = schedule.slots[0];
        const [startStr] = firstSlot.split(' - ');
        this.restaurant.openTime = `${nextDay} ${startStr}`;
        return;
      }
    }
  }
}