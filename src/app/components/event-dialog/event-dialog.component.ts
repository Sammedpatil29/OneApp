import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonTitle, IonButton, IonModal, IonContent, IonIcon, IonFooter } from "@ionic/angular/standalone";
import { NavController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  imports: [IonFooter, IonIcon, IonContent, IonModal, CommonModule, FormsModule, IonTitle, IonButton]
})
export class EventDialogComponent  implements OnInit {
  eventDetails: any;
  constructor(private navCtrl: NavController, private navParams: NavParams, private modalCtrl: ModalController, private popoverController: PopoverController) { 
    this.eventDetails = this.navParams.get('item');
    console.log('Item from navParams:', this.eventDetails);
  }

  ngOnInit() {
    console.log(this.eventDetails)
  }

  async bookNow(item: any) {
  // 1. Close the modal first and WAIT for it to finish
  await this.modalCtrl.dismiss();

  // 2. Navigate after the modal is closed
  this.navCtrl.navigateForward('/layout/order-details', {
    state: { eventId: item.id } 
  });
}

}
