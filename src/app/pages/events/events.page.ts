import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonCardSubtitle, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonModal, IonImg, IonSpinner } from '@ionic/angular/standalone';
import { arrowBack, chevronBack, helpCircleOutline, ticketOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController } from '@ionic/angular';
import { FooterComponent } from "../../components/footer/footer.component";
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventDialogComponent } from 'src/app/components/event-dialog/event-dialog.component';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonSpinner,CommonModule, IonImg, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent]
})
export class EventsPage implements OnInit {

  events: any = [];
  saved: boolean = false
  isModalOpen: boolean = false
  isLoading: boolean = false
  eventDetails: any
  categories: any
  token: any;
  currentFilter: string = 'Upcoming'; 
  filteredEvents: any[] = [];
  @ViewChild(IonModal, { static: false }) modal: IonModal | undefined;
presentingEl: any;

  constructor(private navCtrl: NavController, private eventsService: EventsService, private authService: AuthService, private modalCtrl: ModalController, private popoverController: PopoverController) { 
          addIcons({chevronBack,helpCircleOutline,ticketOutline,arrowBack}); 
  }

ngOnInit() {
  this.authService.getToken().then(token => {
    this.token = token;
    console.log('Token:', this.token);
    this.getEvents();
  }).catch(error => {
    console.error('Failed to get token:', error);
  });
}

  getEvents(){
    this.isLoading = true
      this.eventsService.getEvents().subscribe((res:any)=>{
        this.events = res.data
this.categories = this.getUniqueCategories(this.events)
this.applyFilter('All');
        console.log(this.events)
        this.isLoading = false
      }, error => {
        this.isLoading = false
      })
  }

  getUniqueCategories(events: any[]): string[] {
  // Extract categories, filter out nulls/undefined, and remove duplicates
  return [...new Set(events.map(event => event.category))].sort();
}

applyFilter(filterType: string) {
    this.currentFilter = filterType;

    if (filterType === 'All') {
      this.filteredEvents = this.events;
    } 
    else if (filterType === 'Upcoming') {
      const today = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(today.getDate() + 10);

      this.filteredEvents = this.events.filter((event:any) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= tenDaysFromNow;
      });
    } 
    else {
      // Filter by specific category
      this.filteredEvents = this.events.filter((e:any) => e.category === filterType);
    }
  }

  openHelp(){
    this.navCtrl.navigateForward('/layout/support')
  }

  openBookings(){
    this.navCtrl.navigateForward('/layout/example/history')
  }

  createOrder(){
    let params = {
      "token": "",
      "service_name": "",
    "category": "",
    "service_image": "",
    "provider_id": "",
    "provider_name": "",
    "address": null,
    "status": null,
    "price": null,
    "payment": null
    }
    this.eventsService.createOrder(params).subscribe((res)=>{

    })
  }

  openEventDetails(details:any){
    this.isModalOpen = true
    this.eventDetails = details
    console.log(details.title)
  }

  back(){
this.navCtrl.navigateBack('/layout/example/home')
  }

  bookNow(item:any){
    this.isModalOpen = false
    const order = {
    data: item,
    value: 'event'
  };
    setTimeout(()=>{
      this.navCtrl.navigateForward('/layout/order-details', {
    state: { order }
  });
    })
  }


async openItemModal(item: any) {
  // 1. Lock scroll
  document.body.classList.add('modal-open');

  const modal = await this.modalCtrl.create({
    component: EventDialogComponent,
    componentProps: { item },
    backdropDismiss: true,
    cssClass: 'bottom-sheet-modal',
    // Adding breakpoints even at 1 allows Ionic to use the "Sheet" engine 
    // which is better at blocking background touch events
    initialBreakpoint: 1,
    breakpoints: [0, 1]
  });

  modal.onDidDismiss().then((res) => {
    // 2. Unlock scroll
    document.body.classList.remove('modal-open');
    
    if (res.data?.dismissed) {
      console.log('Modal returned:', res.data.data);
    }
  });

  await modal.present();
}
  
  }

