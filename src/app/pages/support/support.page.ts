import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SupportComponent } from "../../components/support/support.component";

@Component({
  selector: 'app-supportPage',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, SupportComponent]
})
export class SupportPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
