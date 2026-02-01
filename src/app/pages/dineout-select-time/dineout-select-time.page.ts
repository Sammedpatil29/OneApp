import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  arrowBack, calendarOutline, timeOutline, moonOutline, 
  chevronDownOutline, checkmarkCircle, informationCircleOutline, giftOutline 
} from 'ionicons/icons';
import { DineoutService } from 'src/app/services/dineout.service';
import { ErrorComponent } from "src/app/components/error/error.component";

@Component({
  selector: 'app-dineout-select-time',
  templateUrl: './dineout-select-time.page.html',
  styleUrls: ['./dineout-select-time.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ErrorComponent]
})
export class DineoutSelectTimePage implements OnInit {

  // Data Containers
  restaurantId: any;
  restaurantName = "";
  operatingHours: any[] = [];
  offers: any[] = [];
  
  // State
  guests: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedGuest: number = 2;
  
  dates: any[] = [];
  selectedDateIdx: number = 0;

  timeSlots: any[] = [];
  selectedTimeSlot: string = '';
  
  selectedOffer: any = null;
  coverCharge = 0;

  isLoading = true;
  isError = false

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController,
    private dineoutService: DineoutService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { 
    addIcons({ 
      arrowBack, calendarOutline, timeOutline, moonOutline, 
      chevronDownOutline, checkmarkCircle, informationCircleOutline, giftOutline 
    });
  }

  ngOnInit() {
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    if(this.restaurantId) {
      this.loadRestaurantData();
    }
  }

  loadRestaurantData() {
    this.isLoading = true;
    this.isError = false

    this.dineoutService.getRestaurantDetails(this.restaurantId).subscribe((res: any) => {
      const data = res.data;
      
      this.restaurantName = data.name;
      this.operatingHours = data.openingHours || [];
      this.offers = data.offers || [];

      if (this.offers.length > 0) this.selectedOffer = this.offers[0];

      this.generateDates();
      
      if (this.dates.length > 0) {
        this.selectDate(0);
      }

      this.isLoading = false;
    }, err => {
      console.error(err);
      this.isLoading = false;
      this.isError = true
    });
  }

  generateDates() {
    if (!this.operatingHours || this.operatingHours.length === 0) return;

    const today = new Date();
    const tempDates = [];

    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' }); 
      const config = this.operatingHours.find(h => h.day === dayName);
      
      if (config) {
        tempDates.push({
          fullDate: d, 
          date: d.getDate().toString().padStart(2, '0'),
          day: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
          month: d.toLocaleDateString('en-US', { month: 'short' }),
          dayConfig: config 
        });
      }
    }
    this.dates = tempDates;
  }

  selectDate(index: number) {
    this.selectedDateIdx = index;
    const selectedDateObj = this.dates[index];
    
    const now = new Date();
    const isToday = selectedDateObj.fullDate.getDate() === now.getDate() && 
                    selectedDateObj.fullDate.getMonth() === now.getMonth();

    if(selectedDateObj && selectedDateObj.dayConfig) {
      this.generateTimeSlots(selectedDateObj.dayConfig.slots, isToday);
    }
  }

  generateTimeSlots(ranges: string[], isToday: boolean) {
    let allSlots: any[] = [];

    if(ranges) {
      ranges.forEach(range => {
        const parts = range.split(' - ');
        if (parts.length === 2) {
          const slots = this.createSlotsFromRange(parts[0], parts[1], isToday);
          allSlots = [...allSlots, ...slots];
        }
      });
    }

    this.timeSlots = allSlots;
    
    // Auto-select first valid slot
    const firstAvailable = this.timeSlots.find(s => !s.disabled);
    this.selectedTimeSlot = firstAvailable ? firstAvailable.time : '';
  }

  createSlotsFromRange(startStr: string, endStr: string, isToday: boolean) {
    const generated = [];
    
    let startDate = this.parseTime(startStr);
    let endDate = this.parseTime(endStr);
    const now = new Date();

    if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

    let current = new Date(startDate);

    while (current < endDate) {
      const timeString = current.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });

      const isDisabled = isToday && current < now;

      generated.push({
        time: timeString,
        disabled: isDisabled
      });

      current.setMinutes(current.getMinutes() + 30);
    }
    
    return generated;
  }

  parseTime(timeStr: string) {
    const d = new Date(); 
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    let h = parseInt(hours);
    const m = parseInt(minutes);

    if (h === 12 && modifier === 'AM') h = 0;
    else if (h !== 12 && modifier === 'PM') h += 12;

    d.setHours(h, m, 0, 0);
    return d;
  }

  selectGuest(num: number) { this.selectedGuest = num; }
  selectTime(time: string) { this.selectedTimeSlot = time; }
  selectOffer(offer: any) { this.selectedOffer = offer; }

  // --- BOOKING LOGIC ---
  async proceed() {
    // 1. Validation
    if (this.selectedDateIdx === undefined || this.selectedDateIdx === null) {
      this.presentToast('Please select a date', 'warning');
      return;
    }
    if (!this.selectedTimeSlot) {
      this.presentToast('Please select a time slot', 'warning');
      return;
    }

    // 2. Prepare Payload
    const dateObj = this.dates[this.selectedDateIdx];
    const bookingDate = dateObj.fullDate.toDateString(); 
    const totalBill = this.coverCharge * this.selectedGuest;

    const bookingPayload = {
      restaurantId: this.restaurantId,
      restaurantName: this.restaurantName,
      guestCount: this.selectedGuest,
      date: bookingDate,
      timeSlot: this.selectedTimeSlot,
      offerApplied: this.selectedOffer ? this.selectedOffer : null,
      billDetails: {
        coverChargePerHead: this.coverCharge,
        totalAmount: totalBill
      },
      status: 'PENDING',
      userId: 'USER_MOCK_001' 
    };

    console.log('🚀 Booking Payload:', bookingPayload);

    // 3. Show Loader
    const loader = await this.loadingCtrl.create({
      message: 'Confirming your slot...',
      duration: 2000,
      spinner: 'crescent'
    });
    await loader.present();

    // 4. Simulate Success
    setTimeout(async () => {
      await loader.dismiss();
      
      const bookingId = Math.floor(Math.random() * 100000);
      await this.presentToast(`Booking Confirmed! ID: #${bookingId}`, 'success');

      setTimeout(async () => {
    await loader.dismiss();
    
    // NAVIGATE TO TRACK PAGE WITH DATA
    this.navCtrl.navigateForward(['/layout/dineout-layout/dineout-track'], {
      state: { booking: bookingPayload }
    });
    
  }, 2000);
    }, 2000);
  }

  async presentToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      color: color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    toast.present();
  }
}