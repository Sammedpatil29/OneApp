import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonIcon, IonButtons, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, cartOutline, add, remove } from 'ionicons/icons';

@Component({
  selector: 'app-grocery-by-category',
  templateUrl: './grocery-by-category.page.html',
  styleUrls: ['./grocery-by-category.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonIcon, IonSearchbar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GroceryByCategoryPage implements OnInit {

  selectedCategory = 'veggies'; // Default active category

  // Sidebar Data
  categories = [
    { id: 'veggies', name: 'Vegetables', img: 'https://cdn-icons-png.flaticon.com/512/2329/2329865.png' },
    { id: 'fruits', name: 'Fruits', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png' },
    { id: 'dairy', name: 'Dairy & Bread', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png' },
    { id: 'snacks', name: 'Munchies', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png' },
    { id: 'drinks', name: 'Cold Drinks', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png' },
    { id: 'instant', name: 'Instant Food', img: 'https://cdn-icons-png.flaticon.com/512/135/135620.png' },
    { id: 'tea', name: 'Tea & Coffee', img: 'https://cdn-icons-png.flaticon.com/512/633/633652.png' },
    { id: 'bakery', name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/992/992747.png' },
    { id: 'frozen', name: 'Frozen Food', img: 'https://cdn-icons-png.flaticon.com/512/2372/2372134.png' },
  ];

  // Dummy Products Data
  products = [
    { id: 1, name: 'Fresh Tomato', weight: '500g', price: 24, oldPrice: 30, discount: 20, img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png' },
    { id: 2, name: 'Red Onion', weight: '1kg', price: 45, oldPrice: 60, discount: 25, img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png' },
    { id: 3, name: 'Potato', weight: '1kg', price: 35, oldPrice: 40, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png' },
    { id: 4, name: 'Carrot', weight: '500g', price: 30, oldPrice: 40, discount: 10, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329954.png' },
    { id: 5, name: 'Broccoli', weight: '1pc', price: 60, oldPrice: 80, discount: 15, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329905.png' },
    { id: 6, name: 'Spinach', weight: '1 bunch', price: 15, oldPrice: 20, discount: 0, img: 'https://cdn-icons-png.flaticon.com/512/2329/2329937.png' },
  ];

  constructor() { 
    addIcons({ searchOutline, cartOutline, add, remove });
  }

  ngOnInit() {}

  selectCategory(id: string) {
    this.selectedCategory = id;
    // In real app: Fetch products for this ID here
  }

  // Helper to get display name
  getCategoryName() {
    return this.categories.find(c => c.id === this.selectedCategory)?.name;
  }
}