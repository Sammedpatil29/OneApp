import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { GroceryService } from 'src/app/services/grocery.service';
import { Router, NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-grocery-layout',
  templateUrl: './grocery-layout.page.html',
  styleUrls: ['./grocery-layout.page.scss'],
  standalone: true,
  imports: [IonIcon, IonFooter, IonRouterOutlet, IonApp, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GroceryLayoutPage implements OnInit {

  totalPrice: number = 0;
  totalItems: number = 0;
  currentRoute: string = '';

  constructor(private groceryService: GroceryService, private router: Router, private navCtrl: NavController) {
    // 1. Initialize Route (Check current URL immediately)
    this.currentRoute = this.router.url;

    // 2. Listen for Route Changes (Updates variable when you navigate)
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        // console.log('Current Route:', this.currentRoute);
      }
    });
  }

  ngOnInit() {
    // Subscribe to the summary
    this.groceryService.summary$.subscribe(summary => {
      this.totalPrice = summary.totalAmount;
      this.totalItems = summary.itemCount;
      console.log('Updated Summary:', summary);
    });
  }

  goToCart(){
    this.navCtrl.navigateForward('/layout/cart');
  }

}
