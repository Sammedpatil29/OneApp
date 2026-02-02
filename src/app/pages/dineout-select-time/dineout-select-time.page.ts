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
import { AuthService } from 'src/app/services/auth.service';

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
  token:any = ''

  constructor(
    private route: ActivatedRoute, 
    private navCtrl: NavController,
    private dineoutService: DineoutService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authServcie: AuthService
  ) { 
    addIcons({ 
      arrowBack, calendarOutline, timeOutline, moonOutline, 
      chevronDownOutline, checkmarkCircle, informationCircleOutline, giftOutline 
    });
  }

  async ngOnInit() {
    this.token = await this.authServcie.getToken()
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

    proceed() {
    // 1. Validation
    if (!this.selectedGuest || !this.selectedTimeSlot || this.selectedDateIdx === undefined || this.selectedDateIdx < 0) {
      console.error('Please select guest count, date, and time slot.');
      return;
    }

    this.isLoading = true;
    this.isError = false;

    // 2. Prepare Data
    // Assuming this.dates[this.selectedDateIdx] contains the date info. 
    // You might need to format it to 'YYYY-MM-DD' if it isn't already.
    const selectedDateObj = this.dates[this.selectedDateIdx];
    const d = selectedDateObj.fullDate;
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    // const totalAmount = (this.coverCharge || 0) * this.selectedGuest;

    // 3. Construct Payload
    const payload = {
      restaurantId: this.restaurantId || 1, // Ensure restaurantId is available in your class
      restaurantName: this.restaurantName,
      guestCount: this.selectedGuest,
      date: formattedDate,
      timeSlot: this.selectedTimeSlot,
      offerApplied: this.selectedOffer ? {
        type: this.selectedOffer.type || 'FLAT', // Ensure these properties exist on your offer object
        title: this.selectedOffer.title,
        value: this.selectedOffer.value || 0,
        description: this.selectedOffer.description
      } : null,
      billDetails: {
        coverChargePerHead: this.coverCharge || 0,
        totalAmount: this.coverCharge
      }
    };

    // 4. Call Service
    // Retrieve token from your AuthService or LocalStorage

    this.dineoutService.createOrder(this.token, payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Order Created Successfully', response);

        this.navCtrl.navigateRoot(`/layout/dineout-layout/dineout-track/${response.data.id}`, {
          state: {
            from: 'time-slot'
          }
        })
        // Navigate to the track page or success page
        // this.router.navigate(['/dineout-track'], { state: { booking: response } });
      },
      error: (error: any) => {
        this.isLoading = false;
        this.isError = true; // This triggers the error view in your HTML
        console.error('Failed to create order', error);
      }
    });
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