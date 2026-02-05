import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, add, locationOutline, resizeOutline, heartOutline, heart,
  home, business, map, grid, briefcase 
} from 'ionicons/icons';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PropertyPage implements OnInit {

  selectedCategory = 'Rent House';

  categories = [
    { id: 1, name: 'Rent House', icon: 'home' },
    { id: 2, name: 'Buy Home', icon: 'business' },
    { id: 3, name: 'Buy Land', icon: 'map' },
    { id: 4, name: 'Buy Plot', icon: 'grid' },
    { id: 5, name: 'Commercial', icon: 'briefcase' },
  ];

  properties = [
    {
      id: 1,
      title: '3BHK Luxury Villa',
      location: 'Whitefield, Bangalore',
      price: '₹1.2 Cr',
      type: 'Sale',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      specs: '3 Beds • 2500 sqft',
      isFav: false
    },
    {
      id: 2,
      title: '2BHK Apartment',
      location: 'Indiranagar, Bangalore',
      price: '₹25,000/mo',
      type: 'Rent',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      specs: '2 Beds • 1100 sqft',
      isFav: true
    },
    {
      id: 3,
      title: 'Commercial Plot',
      location: 'Hebbal, Bangalore',
      price: '₹85 Lakhs',
      type: 'Plot',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      specs: '1200 sqft',
      isFav: false
    },
    {
      id: 4,
      title: 'Office Space',
      location: 'Koramangala',
      price: '₹45,000/mo',
      type: 'Rent',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      specs: '800 sqft',
      isFav: false
    }
  ];

  constructor(private navCtrl: NavController) { 
    addIcons({ 
      arrowBackOutline, add, locationOutline, resizeOutline, heartOutline, heart,
      home, business, map, grid, briefcase
    });
  }

  ngOnInit() {}

  goBack() {
    this.navCtrl.back();
  }

  listProperty() {
    console.log('Navigate to Add Property Page');
  }

  selectCategory(name: string) {
    this.selectedCategory = name;
  }

  toggleFav(prop: any, event: Event) {
    event.stopPropagation();
    prop.isFav = !prop.isFav;
  }

  openDetails(id: number) {
    console.log('Open details for', id);
  }
}