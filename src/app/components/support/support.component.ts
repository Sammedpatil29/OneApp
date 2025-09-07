import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonSearchbar, IonTitle, IonLabel, IonAccordion, IonItem, IonAccordionGroup, IonSegmentButton, IonSegment, IonSegmentView, IonSegmentContent, IonList, IonText, IonNote, IonIcon, IonInput, IonButton, IonSpinner, IonTextarea, IonModal, IonToast, IonRefresher, IonRefresherContent } from "@ionic/angular/standalone";
import { NodataComponent } from "../nodata/nodata.component";
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronForward, listCircle } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { CustonModalComponent } from '../custon-modal/custon-modal.component';
import { SupportService } from 'src/app/services/support.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  imports: [IonRefresherContent, IonRefresher, IonToast, IonModal, IonTextarea, IonSpinner, IonButton, IonInput, IonIcon, IonNote, CommonModule, IonText, IonList, IonSegment, IonSegmentButton, IonAccordionGroup, IonItem, IonAccordion, IonLabel, IonHeader, IonToolbar, IonTitle, NodataComponent, IonSegmentView, IonSegmentContent, FormsModule]
})
export class SupportComponent  implements OnInit {
  raiseTicket:boolean = false
  isToastOpen: boolean = false
  isLoading: boolean = false
  isCreating: boolean = false
  toastMessage: string = ''
  title: string = ''
  details: string = ''
  token: any = ''
  openTickets: any = []
  closedTickets: any = []
tickets: any = []

faqs: any = [
  {
    "question": "What is your return policy?",
    "answer": "You can return any unused item within 30 days of purchase for a full refund."
  },
  {
    "question": "How long does shipping take?",
    "answer": "Standard shipping typically takes 5-7 business days."
  },
  {
    "question": "Do you ship internationally?",
    "answer": "Yes, we ship to most countries. International shipping rates may apply."
  },
  {
    "question": "How can I track my order?",
    "answer": "Once your order ships, you’ll receive a tracking number via email."
  },
  {
    "question": "Can I cancel or modify my order?",
    "answer": "Orders can be modified or canceled within 2 hours of placement."
  },
  {
    "question": "What payment methods do you accept?",
    "answer": "We accept Visa, MasterCard, PayPal, and Apple Pay."
  },
  {
    "question": "Is my personal information secure?",
    "answer": "Yes, all transactions are encrypted and your data is securely stored."
  },
  {
    "question": "How do I contact customer support?",
    "answer": "You can reach us via the Contact Us page or by calling our support number."
  },
  {
    "question": "Do you offer gift cards?",
    "answer": "Yes, digital gift cards are available in various denominations."
  },
  {
    "question": "Are your products eco-friendly?",
    "answer": "Many of our products are made with sustainable materials and practices."
  }
]

  constructor(private modalCtrl: ModalController, private supportService: SupportService, private authService: AuthService) {
     addIcons({ chevronForward, listCircle });
   }

  async ngOnInit() {
    this.token = await this.authService.getToken()
    this.getTickets()
  }

  async openItemModal(item: any) {
  const modal = await this.modalCtrl.create({
    component: CustonModalComponent,
    componentProps: { item },
    breakpoints: [0, 0.5, 0.7],           // Allow resizing between 0%, 50%, 100%
      initialBreakpoint: 0.5,
      backdropDismiss: true, 
      cssClass: 'bottom-sheet-modal'
  });

  modal.onDidDismiss().then((res) => {
    if (res.data?.dismissed) {
      console.log('Modal returned:', res.data.data);
    }
  });

  await modal.present();
}

createTicket(){
  let ticket_id = `TKT${Date.now().toString().slice(-5)}${Math.floor(Math.random() * 100)}`
  let params = {
    "token": this.token,
    "title": this.title,
    "details": this.details,
    "ticket_id": ticket_id
  }
  this.isCreating = true
  this.supportService.createTicket(params).subscribe((res:any) => {
    this.isToastOpen = true
    this.isCreating = false
    this.title = ''
    this.details = ''
      this.toastMessage = `${res.ticket_id} created successfully`;
      setTimeout(()=>{
        this.isToastOpen = false
      },3000)
  }, error => {
    this.isToastOpen = true
    this.isCreating = false
      this.toastMessage = `failed to create ticket`;
      setTimeout(()=>{
        this.isToastOpen = false
      },3000)
  })
}

getTickets(){
  let params = {
    "token": this.token,
  }
  this.isLoading = true
  this.supportService.getTickets(params).subscribe((res:any) => {
    this.tickets = res
    this.openTickets = []
      this.closedTickets = []
    this.tickets.forEach((element:any) => {
      this.isLoading = false
      
        if(element.status == 'Open'){
          this.openTickets.push(element);
          console.log(this.openTickets);
        } else {
          this.closedTickets.push(element);
        }
    });
    this.openTickets = this.openTickets.reverse()
    this.closedTickets = this.closedTickets.reverse()
  }, error => {
    this.isLoading = false
  })
}


}
