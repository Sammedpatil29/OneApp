import { Component, OnInit } from '@angular/core';
import { IonContent, IonCardSubtitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonNote, IonList, IonItem, IonLabel, IonText, IonChip } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, person, home, homeOutline, time, helpCircle, homeSharp, searchOutline } from 'ionicons/icons';
import { HistoryService } from './history.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NodataComponent } from "../nodata/nodata.component";
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonChip, IonText, IonLabel, IonItem, IonList, IonNote, IonTitle, IonToolbar, IonHeader, IonIcon, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonCardSubtitle, CommonModule, NodataComponent]
})
export class HistoryComponent  implements OnInit {
  history: any;

  constructor(private historyService: HistoryService) {
      addIcons({homeSharp,searchOutline,helpCircle,time,search,homeOutline,radio,library,person,home,playCircle});
     }

  ngOnInit() {
    console.log('called')
    this.getHistory()
  }

  getHistory(){
  this.historyService.getHistory().subscribe(res => {
    this.history = res
    console.log(this.history)
  })
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
      case 'delivered':
      case 'report ready':
      case 'resolved':
        return 'bi bi-check-circle text-success';
      case 'pending':
        return 'bi bi-clock text-warning';
      case 'failed':
      case 'rejected':
      case 'error':
        return 'bi bi-x-circle text-danger';
      case 'processing':
        return 'bi bi-cloud text-primary';
      default:
        return 'bi bi-info-circle text-secondary';
    }
  }
  

}
