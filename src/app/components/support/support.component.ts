import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonSearchbar, IonTitle, IonLabel, IonAccordion, IonItem, IonAccordionGroup, IonSegmentButton, IonSegment, IonSegmentView, IonSegmentContent, IonList, IonText, IonNote, IonIcon, IonInput, IonButton, IonSpinner, IonTextarea, IonModal } from "@ionic/angular/standalone";
import { NodataComponent } from "../nodata/nodata.component";
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronForward, listCircle } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { CustonModalComponent } from '../custon-modal/custon-modal.component';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  imports: [IonModal, IonTextarea, IonSpinner, IonButton, IonInput, IonIcon, IonNote, CommonModule, IonText, IonList, IonSegment, IonSegmentButton, IonAccordionGroup, IonItem, IonAccordion, IonLabel, IonHeader, IonToolbar, IonTitle, NodataComponent, IonSegmentView, IonSegmentContent]
})
export class SupportComponent  implements OnInit {
  raiseTicket:boolean = false
tickets: any = [
  {'title': 'Damaged  Item',
    'details': 'jlnfrri  bre',
    'created_at': '25/05/2025',
    'closed_at': '27/05/2025',
    'status': 'Open',
    'order_id': 'Order2342323',
    'ticket_id': 'Order2342323',
    'item_list': [],
    'user_id': '1',
    'assigned_to': '',
    'comment': '',
    'connected_by': ''
  },
  {'title': 'Damaged Item',
        'details': 'jlnfr ibfirbf erbre rbuierb erjgbierb erbfer erbgerb erbire erbgerg erber ergberibg rebier erbier erbgie berb geri ergbre bre',
    'created_at': '25/05/2025',
    'closed_at': '27/05/2025',
    'ticket_id': 'Order2342323',
    'status': 'Closed',
    'comment': 'Issue is resolved after refunding the partial amount'
  }
]

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

  constructor(private modalCtrl: ModalController) {
     addIcons({ chevronForward, listCircle });
   }

  ngOnInit() {}

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


}
