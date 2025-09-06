import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonButton } from "@ionic/angular/standalone";
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-bottomsheet-message',
  templateUrl: './bottomsheet-message.component.html',
  styleUrls: ['./bottomsheet-message.component.scss'],
  imports: [IonButton, IonContent],
})
export class BottomsheetMessageComponent  implements OnInit {
@Input() item: any;
  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  closeModal() {
    this.modalController.dismiss();
  }

}
