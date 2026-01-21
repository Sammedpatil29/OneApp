import { Component, OnInit } from '@angular/core';
import { IonContent, IonCardSubtitle, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonNote, IonList, IonItem, IonLabel, IonText, IonChip, IonSelect, IonSelectOption, IonRefresher, IonRefresherContent, IonSpinner, IonButtons } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, person, home, homeOutline, time, helpCircle, homeSharp, searchOutline, funnel, funnelOutline } from 'ionicons/icons';
import { HistoryService } from './history.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NodataComponent } from "../nodata/nodata.component";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [IonButtons, 
    IonSpinner,
    CommonModule,
    IonRefresherContent,
    IonRefresher,
    IonChip,
    IonText,
    IonLabel,
    IonItem,
    IonList,
    IonNote,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonIcon,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonCardSubtitle,
    CommonModule,
    NodataComponent,
    IonSelect,
    IonSelectOption,
  ],
})
export class HistoryComponent implements OnInit {
[x: string]: any;
  history: any[] = [];
  category: any[] = [];
  filteredHistory: any[] = this.history;
  isloading: boolean = false;
  token: any;

  constructor(
    private historyService: HistoryService,
    private router: Router,
    private authService: AuthService,
    private navCtrl: NavController
  ) {
    addIcons({
      homeSharp,
      searchOutline,
      helpCircle,
      time,
      search,
      homeOutline,
      radio,
      library,
      person,
      home,
      playCircle,
      funnel,
      funnelOutline,
    });
  }

  async ngOnInit() {
    console.log('called history');
    await this.getToken();
    this.getHistory();
  }

  getHistory() {
    this.isloading = true;
    let params = {
        type: 'event'
    };
    this.historyService.getHistory(params, this.token).subscribe(
      (res) => {
        this.history = res.data;
        this.filteredHistory = this.history;
        this.filteredHistory = this.filteredHistory.reverse();
        let uniqueCategory = Array.from(
          new Set(this.history.map((item) => item.type))
        );
        this.isloading = false;
        this.category = ['All', ...uniqueCategory];
      },
      (error) => {
        this.isloading = false;
      }
    );
  }

  // async getToken(){
  async getToken() {
    this.token = await this.authService.getToken();
    // }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
      case 'delivered':
      case 'active':
      case 'resolved':
        return 'bi bi-check-circle-fill text-success';
      case 'pending':
      case 'paid':
        return 'bi bi-clock-fill text-success';
      case 'failed':
      case 'cancelled':
      case 'error':
        return 'bi bi-x-circle-fill text-danger';
      case 'processing':
        return 'bi bi-cloud-fill text-primary';
      default:
        return 'bi bi-info-circle-fill text-secondary';
    }
  }

  // navigateto() {
  //   this.nav.navigate(['/layout/profile']);
  // }

  selectedCategory:any = 'All';
  onCategoryChange(category: any) {
   this.selectedCategory = category.target.innerText;
    console.log(this.selectedCategory);
    if (this.selectedCategory == 'All') {
      this.filteredHistory = this.history;
    } else {
      this.filteredHistory = this.history.filter(
        (item) => item.type.toLowerCase() == this.selectedCategory.toLowerCase()
      );
      console.log(this.filteredHistory);
    }
  }

  openDetails(orderDetails: any) {
    console.log(orderDetails);
    if (orderDetails.type == 'grocery') {
      this.navCtrl.navigateRoot('/layout/grocery-order-details', {
        state: {
          orderDetails: orderDetails,
        },
      });
    } else {
      this.navCtrl.navigateForward('/layout/track-order', {
        state: {
          orderId: orderDetails.id,
        },
      });
    }
  }

  // getCost(details: any) {
  //   let parsedDetails = JSON.parse(details);
  //   return parsedDetails.finalCost;
  // }

  goBack(){
    this.navCtrl.back()
  }
}
