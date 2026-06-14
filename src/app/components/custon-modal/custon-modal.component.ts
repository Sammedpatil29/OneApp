import { Component, OnInit, Input } from '@angular/core';
import { IonContent, IonTitle, IonButton, IonFooter } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { SupportService } from 'src/app/services/support.service';

@Component({
  selector: 'app-custon-modal',
  templateUrl: './custon-modal.component.html',
  styleUrls: ['./custon-modal.component.scss'],
  imports: [IonFooter, IonButton, IonTitle, IonContent, CommonModule, FormsModule],
})
export class CustonModalComponent  implements OnInit {
  @Input() item: any;
  constructor(private modalCtrl: ModalController, private supportService: SupportService) { }

  ngOnInit() {}

  closeBottomSheet(){
      this.modalCtrl.dismiss()
  }

  closeTicket(){
    let params = {
      status: [...this.item.status, {status: 'Closed', date: new Date()}],
      closed_at: new Date(),
      comment: [...this.item.comment, {comment: 'Ticket closed by user', date: new Date()}]
    }
    this.supportService.closeTicket(this.item.id, params).subscribe((res:any) => {
      if(res.status == 'success'){
        this.modalCtrl.dismiss({data: 'closed'})
      }})
    this.modalCtrl.dismiss({data: 'closed'})
  }

}
