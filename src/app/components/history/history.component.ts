import { Component, OnInit } from '@angular/core';
import { IonContent, IonCardSubtitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonNote, IonList, IonItem, IonLabel, IonText, IonChip, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, IonSpinner } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, person, home, homeOutline, time, helpCircle, homeSharp, searchOutline, funnel, funnelOutline } from 'ionicons/icons';
import { HistoryService } from './history.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NodataComponent } from "../nodata/nodata.component";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonSpinner, IonRefresherContent, IonRefresher, IonChip, IonText, IonLabel, IonItem, IonList, IonNote, IonTitle, IonToolbar, IonHeader, IonIcon, IonButton, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonCardSubtitle, CommonModule, NodataComponent, IonSelect, IonSelectOption]
})
export class HistoryComponent  implements OnInit {
  history: any[] = []
  category: any[] = ['All', 'doctor']
  filteredHistory: any[] = this.history
  isloading: boolean = false
  token: any;

  constructor(private historyService: HistoryService, private router: Router, private authService: AuthService) {
      addIcons({homeSharp,searchOutline,helpCircle,time,search,homeOutline,radio,library,person,home,playCircle, funnel, funnelOutline});
     }

  async ngOnInit() {
    console.log('called history')
    await this.getToken()
    this.getHistory()
  }

  getHistory(){
    this.isloading = true
    let params = {
      "token": this.token
    }
  this.historyService.getHistory(params).subscribe(res => {
    this.history = res
    this.filteredHistory = this.history
    let uniqueCategory = Array.from(new Set(this.history.map(item => item.type)));
    this.isloading = false
    this.category = ['All', ...uniqueCategory]
  }, error => {
    this.isloading = false
  })
  }

  // async getToken(){
    async getToken(){
 this.token = await this.authService.getToken()
// }
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
