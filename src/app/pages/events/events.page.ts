import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonCardSubtitle, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonModal, IonImg, IonSpinner } from '@ionic/angular/standalone';
import { arrowBack } from 'ionicons/icons';
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
  token: any;
  @ViewChild(IonModal, { static: false }) modal: IonModal | undefined;
presentingEl: any;

  constructor(private navCtrl: NavController, private eventsService: EventsService, private authService: AuthService, private modalCtrl: ModalController, private popoverController: PopoverController) { 
          addIcons({arrowBack}); 
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
    let params = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJwaG9uZSI6Iis5MTk1OTE0MjAwNjgiLCJ1c2VyX25hbWUiOiJzYW1tZWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTQ2MDI4Mn0.tO4XklsZN3Qw4QLHNctoEgW59dk3pOWAeF7qO8Imv8s"
    }
    this.isLoading = true
      this.eventsService.getEvents(params).subscribe((res)=>{
        this.events = res
        console.log(this.events)
        this.isLoading = false
      }, error => {
        this.isLoading = false
      })
  }

  openHelp(){
    this.navCtrl.navigateForward('/layout/example/support')
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
    document.body.classList.add('modal-open');
   const modal = await this.modalCtrl.create({
      component: EventDialogComponent,
      componentProps: { item },
      backdropDismiss: true,
      cssClass: 'bottom-sheet-modal', // Custom class for bottom sheet styling
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    console.log('Modal dismissed:', role, data);
  }
  
  }

