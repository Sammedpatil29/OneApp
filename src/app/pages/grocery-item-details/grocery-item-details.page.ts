import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonFooter, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBack, heartOutline, shareSocialOutline, timeOutline, shieldCheckmarkOutline, leafOutline, star } from 'ionicons/icons';

@Component({
  selector: 'app-grocery-item-details',
  templateUrl: './grocery-item-details.page.html',
  styleUrls: ['./grocery-item-details.page.scss'],
  standalone: true,
  imports: [IonBackButton, IonFooter, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GroceryItemDetailsPage implements OnInit {

  // State
  qty = 0;
  isExpanded = false; // For description text

  // Dummy Product Data
  product = {
    id: 101,
    name: 'Fresh Organic Tomatoes (Hybrid)',
    weight: '500 g',
    price: 24,
    originalPrice: 30,
    discount: 20,
    description: 'Freshly handpicked tomatoes from local farms. These hybrid tomatoes are rich in antioxidants and perfect for curries, salads, and soups.',
    images: ['https://cdn-icons-png.flaticon.com/512/1202/1202125.png'], // Usually an array for sliders
    tags: ['Organic', 'Farm Fresh', 'No Preservatives']
  };

  // Similar Products
  similarProducts = [
    { name: 'Red Onion', weight: '1kg', price: 45, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png' },
    { name: 'Potato', weight: '1kg', price: 35, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png' },
    { name: 'Cucumber', weight: '500g', price: 18, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329921.png' },
  ];

  constructor() { 
    addIcons({ arrowBack, heartOutline, shareSocialOutline, timeOutline, shieldCheckmarkOutline, leafOutline, star });
  }

  ngOnInit() {
    // In real app: Fetch ID from route/state here
  }

  toggleQty(action: 'add' | 'remove') {
    if (action === 'add') this.qty++;
    else if (this.qty > 0) this.qty--;
  }

}