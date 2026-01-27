import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonFooter, IonButtons, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, homeOutline, search, timeOutline, caretForwardOutline, add, remove } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grocery',
  templateUrl: 'grocery.page.html',
  styleUrls: ['grocery.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonFooter, IonIcon, IonToolbar, IonTitle, IonHeader, IonContent, CommonModule, FormsModule]
})
export class GroceryPage implements OnInit, OnDestroy {

  // Header Data
  deliveryTime = '10 mins';
  currentLocation = 'Home - Indiranagar, Bengaluru';

  // 1. Dynamic Banners
  banners = [
    { 
      title: '50% OFF', 
      subtitle: 'On First Order', 
      img: 'https://cdn-icons-png.flaticon.com/512/3081/3081986.png',
      bg: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)'
    },
    { 
      title: 'Fresh', 
      subtitle: 'Vegetables', 
      img: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png',
      bg: 'linear-gradient(to right, #ff9966 0%, #ff5e62 100%)'
    }
  ];

  // 2. Dynamic Categories
  categories = [
    { name: 'Fruits', img: 'https://cdn-icons-png.flaticon.com/512/1625/1625048.png', bg: '#e3f2fd' },
    { name: 'Veggies', img: 'https://cdn-icons-png.flaticon.com/512/2329/2329865.png', bg: '#e8f5e9' },
    { name: 'Dairy', img: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png', bg: '#fff3e0' },
    { name: 'Snacks', img: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', bg: '#fce4ec' },
    { name: 'Drinks', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', bg: '#e0f7fa' },
    { name: 'Bakery', img: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', bg: '#fff8e1' },
    { name: 'Instant', img: 'https://cdn-icons-png.flaticon.com/512/135/135620.png', bg: '#f3e5f5' },
    { name: 'Teas', img: 'https://cdn-icons-png.flaticon.com/512/633/633652.png', bg: '#eefebe' },
  ];

  // 3. Dynamic Products organized by Sections
  productSections = [
    {
      title: 'Fresh Vegetables',
      subtitle: 'Farm fresh to your door',
      products: [
        { id: 1, name: 'Fresh Tomato', weight: '500 g', price: 24, originalPrice: 30, discount: 20, time: '8 mins', img: 'https://cdn-icons-png.flaticon.com/512/1202/1202125.png', qty: 0 },
        { id: 2, name: 'Onion Red', weight: '1 kg', price: 45, originalPrice: 60, discount: 15, time: '12 mins', img: 'https://cdn-icons-png.flaticon.com/512/765/765580.png', qty: 2 }, // Example with initial qty
        { id: 3, name: 'Potato', weight: '1 kg', price: 35, originalPrice: 40, discount: 0, time: '9 mins', img: 'https://cdn-icons-png.flaticon.com/512/765/765544.png', qty: 0 },
      ]
    },
    {
      title: 'Summer Drinks',
      subtitle: 'Beat the heat',
      products: [
        { id: 4, name: 'Coca Cola', weight: '750 ml', price: 40, originalPrice: 45, discount: 0, time: '15 mins', img: 'https://cdn-icons-png.flaticon.com/512/2405/2405536.png', qty: 0 },
        { id: 5, name: 'Orange Juice', weight: '1 L', price: 110, originalPrice: 130, discount: 15, time: '10 mins', img: 'https://cdn-icons-png.flaticon.com/512/931/931613.png', qty: 0 }
      ]
    }
  ];

  constructor(private router: Router) { 
    addIcons({ chevronDownOutline, homeOutline, search, timeOutline, caretForwardOutline, add, remove });
  }

  ngOnInit() {}

  ngOnDestroy() {}
  
  // --- Cart Logic ---
  
  add(item: any, event: Event) {
    event.stopPropagation(); // Prevent opening details page
    item.qty++;
  }

  remove(item: any, event: Event) {
    event.stopPropagation();
    if (item.qty > 0) item.qty--;
  }

  // Computed Properties for Footer
  get totalItems() {
    let count = 0;
    this.productSections.forEach(sec => {
      sec.products.forEach(p => count += p.qty);
    });
    return count;
  }

  get totalPrice() {
    let total = 0;
    this.productSections.forEach(sec => {
      sec.products.forEach(p => total += (p.price * p.qty));
    });
    return total;
  }

  // --- Navigation ---

  gotoSearch() {
    this.router.navigate(['/layout/grocery-search']);
  }

  goToSpecialCategory() {
    this.router.navigate(['/layout/grocery-special']);
  }

  goToGrocerybyCategory(catName?: string) {
    this.router.navigate(['/layout/grocery-by-category'], { state: { category: catName } });
  }

  goToDetails(product?: any) {
    this.router.navigate(['/layout/grocery-item-details'], { state: { product } });
  }

  goToCart() {
    this.router.navigate(['/layout/cart']);
  }

}