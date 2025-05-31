import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonCardSubtitle, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonModal, IonImg } from '@ionic/angular/standalone';
import { arrowBack } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController } from '@ionic/angular';
import { FooterComponent } from "../../components/footer/footer.component";
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonImg, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent]
})
export class EventsPage implements OnInit {

  events: any = [];
  saved: boolean = false
  isModalOpen: boolean = false
  eventDetails: any
  @ViewChild(IonModal, { static: false }) modal: IonModal | undefined;
presentingEl: any;

  constructor(private navCtrl: NavController, private eventsService: EventsService, private authService: AuthService) { 
          addIcons({arrowBack}); 
  }

  ngOnInit() {
    this.getEvents()
    this.authService.getToken().then()
  }

  getEvents(){
      this.eventsService.getServices().subscribe((res)=>{
        this.events = res
        console.log(this.events)
      })
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

}
