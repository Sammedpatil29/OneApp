import { Component, OnInit, Input } from '@angular/core';
import { IonContent, IonTitle } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custon-modal',
  templateUrl: './custon-modal.component.html',
  styleUrls: ['./custon-modal.component.scss'],
  imports: [IonTitle, IonContent, CommonModule, FormsModule],
})
export class CustonModalComponent  implements OnInit {
  @Input() item: any;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  closeBottomSheet(){
      this.modalCtrl.dismiss()
  }

}
