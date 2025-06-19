import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonCard,
  IonModal,
  IonButton,
  IonButtons,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonCardSubtitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonInput,
  IonSpinner,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { GroceryService } from '../services/grocery.service';
import { AuthService } from '../services/auth.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { Router } from '@angular/router';
import { NodataComponent } from '../components/nodata/nodata.component';

@Component({
  selector: 'app-grocery',
  templateUrl: './grocery.page.html',
  styleUrls: ['./grocery.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonInput,
    IonItem,
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonCardSubtitle,
    IonRefresherContent,
    IonRefresher,
    IonIcon,
    IonButtons,
    IonButton,
    IonModal,
    IonCard,
    IonSearchbar,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    NodataComponent,
  ],
})
export class GroceryPage implements OnInit {
  address = '';
  label = '';
  token: any;
  groceryList: any;
  data: any;
  filteredGroceryList: any;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  clickedItem: any;
  searchedItems: any = [];
  searchTerm = '';
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
    private groceryService: GroceryService
  ) {}

  ngOnInit() {
    const locationData = localStorage.getItem('location');
    if (locationData) {
      const location = JSON.parse(locationData);
      this.address = location.address;
      this.label = location.label;
    }
    this.authService
      .getToken()
      .then((token) => {
        this.token = token;
        console.log('Token:', this.token);
        this.getGroceryList();
      })
      .catch((error) => {
        console.error('Failed to get token:', error);
      });
  }

  backToHome() {
    this.navCtrl.navigateBack('/layout/example/home');
  }

  openMap() {
    this.navCtrl.navigateForward('/layout/map');
  }

  getGroceryList() {
    let params = {
      token: this.token,
    };
    this.isLoading = true;
    this.groceryService.getGroceryList(params).subscribe(
      (res) => {
        this.groceryList = res;
        this.filteredGroceryList = this.groceryList;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  change() {
    console.log('fbfbrhybbhdf');
  }

  startSearch() {
    this.isModalOpen = true;
  }

  handleModalClose() {
    this.isModalOpen = false;
    this.clickedItem = [];
  }

  searchResult() {
    const query = this.searchTerm.trim().toLowerCase();
    if (query.length == 0) {
      this.searchedItems = [];
    } else {
      this.searchedItems = this.groceryList.filter((item: any) => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      });
      console.log(this.searchedItems);
    }
  }

  openCart() {
    this.navCtrl.navigateForward('/layout/cart')
  }

  increment(){
    alert('+')
  }

  decrement(){
    alert('-')
  }
}
