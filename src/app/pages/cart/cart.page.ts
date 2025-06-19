import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, IonFooter, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CartPage implements OnInit {

  constructor(private router: Router, private navCtrl: NavController) { 
    addIcons({arrowBack}); 
  }

  ngOnInit() {
  }

   goBack() {
    this.navCtrl.back()
  }

}
