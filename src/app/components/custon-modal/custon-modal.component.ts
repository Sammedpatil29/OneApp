import { Component, OnInit, Input } from '@angular/core';
import { IonContent, IonTitle } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custon-modal',
  templateUrl: './custon-modal.component.html',
  styleUrls: ['./custon-modal.component.scss'],
  imports: [IonTitle, IonContent, CommonModule, FormsModule],
})
export class CustonModalComponent  implements OnInit {
  @Input() item: any;
  constructor() { }

  ngOnInit() {}

}
