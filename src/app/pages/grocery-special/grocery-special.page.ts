import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonFooter, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, filterOutline, caretForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-grocery-special',
  templateUrl: './grocery-special.page.html',
  styleUrls: ['./grocery-special.page.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonIcon, IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GrocerySpecialPage implements OnInit {

  // Dynamic Data (In real app, fetch based on Route ID)
  categoryInfo = {
    name: 'Farm Fresh Veggies',
    color: '#e8f5e9', // Light Green Theme
    bannerImg: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
    offerText: 'Up to 40% OFF'
  };

  // Filter Chips
  filters = ['All', 'Leafy', 'Root', 'Organic', 'Exotic', 'Cut & Peeled'];
  selectedFilter = 'All';

  // Products List
  products = [
    { id: 1, name: 'Fresh Tomato', weight: '500g', price: 24, oldPrice: 30, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png', qty: 0 },
    { id: 2, name: 'Red Onion', weight: '1kg', price: 45, oldPrice: 60, discount: 25, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png', qty: 2 },
    { id: 3, name: 'Potato', weight: '1kg', price: 35, oldPrice: 40, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png', qty: 0 },
    { id: 4, name: 'Broccoli', weight: '1 pc', price: 60, oldPrice: 80, discount: 15, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329905.png', qty: 0 },
    { id: 5, name: 'Carrot', weight: '500g', price: 30, oldPrice: 40, discount: 10, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329954.png', qty: 0 },
    { id: 6, name: 'Spinach', weight: '1 bunch', price: 15, oldPrice: 20, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329937.png', qty: 1 },
    { id: 7, name: 'Capsicum', weight: '500g', price: 40, oldPrice: 50, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329932.png', qty: 0 },
    { id: 8, name: 'Cucumber', weight: '500g', price: 18, oldPrice: 25, discount: 5, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329921.png', qty: 0 },
  ];

  constructor() { 
    addIcons({ searchOutline, filterOutline, caretForwardOutline });
  }

  ngOnInit() {}

  // Quantity Logic
  updateQty(item: any, change: number) {
    if (change === 1) item.qty++;
    else if (item.qty > 0) item.qty--;
  }

  // Filter Logic
  setFilter(f: string) {
    this.selectedFilter = f;
  }
}