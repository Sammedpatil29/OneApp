import { Component, OnInit } from '@angular/core';
import { IonContent, IonCardSubtitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonNote, IonList, IonItem, IonLabel, IonText, IonChip, IonSelect, IonSelectOption } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, person, home, homeOutline, time, helpCircle, homeSharp, searchOutline, funnel, funnelOutline } from 'ionicons/icons';
import { HistoryService } from './history.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NodataComponent } from "../nodata/nodata.component";
import { Router } from '@angular/router';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonChip, IonText, IonLabel, IonItem, IonList, IonNote, IonTitle, IonToolbar, IonHeader, IonIcon, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonCardSubtitle, CommonModule, NodataComponent, IonSelect, IonSelectOption]
})
export class HistoryComponent  implements OnInit {
  history: any[] = []
  category: any[] = ['All', 'doctor']
  filteredHistory: any[] = this.history

  constructor(private historyService: HistoryService, private router: Router) {
      addIcons({homeSharp,searchOutline,helpCircle,time,search,homeOutline,radio,library,person,home,playCircle, funnel, funnelOutline});
     }

  ngOnInit() {
    console.log('called history')
    this.getHistory()
  }

  getHistory(){
  this.historyService.getHistory().subscribe(res => {
    this.history = res
    this.filteredHistory = this.history
    let uniqueCategory = Array.from(new Set(this.history.map(item => item.type)));
    this.category = ['All', ...uniqueCategory]
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

  navigateto(){
    this.router.navigate(['/layout/profile'])
  }

onCategoryChange(category: any){
  let selectedCategory = category.target.innerText
  console.log(selectedCategory)
  if(selectedCategory == 'All'){
    this.filteredHistory = this.history
  } else {
this.filteredHistory = this.history.filter((item) => item.type.toLowerCase() == selectedCategory.toLowerCase())
  console.log(this.filteredHistory)
  }
}
  

}
