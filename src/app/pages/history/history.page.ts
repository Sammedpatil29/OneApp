import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HistoryComponent } from "../../components/history/history.component";

@Component({
  selector: 'app-historyPage',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HistoryComponent]
})
export class HistoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
