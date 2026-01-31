import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  searchOutline, optionsOutline, heartOutline, star, heart, 
  bookmarkOutline, locationOutline, chevronDownOutline, pricetagOutline,
  bicycleOutline, timeOutline, flame
} from 'ionicons/icons';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-dineout',
  templateUrl: './dineout.page.html',
  styleUrls: ['./dineout.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DineoutPage implements OnInit {

  // City Dropdown Data
  cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];
  selectedCity = 'Bangalore';

  // Filters
  filters = ['Sort by', 'Pure Veg', 'Fast Delivery', 'Rated 4.0+', 'New Arrivals'];

  // Expanded Professional Data
  restaurants = [
    {
      id: 1,
      name: 'Truffles - Ice & Spice',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Koramangala, 5th Block',
      distance: '2.5 km',
      time: '35 mins',
      tags: 'American, Burgers, Cafe',
      price_for_two: '₹800 for two',
      rating: 4.5,
      ratingCount: '15K+',
      offers: [
        { icon: 'pricetag', text: 'Flat 20% off on orders above ₹500' }
      ],
      isAd: true,
      isFav: false,
      isVeg: false
    },
    {
      id: 2,
      name: 'Meghana Foods',
      image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Indiranagar',
      distance: '4.2 km',
      time: '45 mins',
      tags: 'Biryani, Andhra, North Indian',
      price_for_two: '₹950 for two',
      rating: 4.4,
      ratingCount: '22K+',
      offers: [],
      isAd: false,
      isFav: true,
      isVeg: false
    },
    {
      id: 3,
      name: 'Brahmin\'s Thatte Idli',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Malleshwaram',
      distance: '6.0 km',
      time: '50 mins',
      tags: 'South Indian, Breakfast',
      price_for_two: '₹200 for two',
      rating: 4.8,
      ratingCount: '5K+',
      offers: [
        { icon: 'bicycle', text: 'Free Delivery' }
      ],
      isAd: false,
      isFav: false,
      isVeg: true // Pure Veg
    },
    {
      id: 4,
      name: 'Chianti - Italian Kitchen',
      image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Indiranagar',
      distance: '3.8 km',
      time: '40 mins',
      tags: 'Italian, Pasta, Pizza',
      price_for_two: '₹1400 for two',
      rating: 4.2,
      ratingCount: '1.2K+',
      offers: [
        { icon: 'pricetag', text: 'Free Dessert with Pizza' }
      ],
      isAd: true,
      isFav: true,
      isVeg: false
    },
    {
      id: 5,
      name: 'Empire Restaurant',
      image: 'https://images.unsplash.com/photo-1606471191009-63994c53433b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Church Street',
      distance: '1.2 km',
      time: '25 mins',
      tags: 'North Indian, Kebab, Mughlai',
      price_for_two: '₹700 for two',
      rating: 4.1,
      ratingCount: '50K+',
      offers: [],
      isAd: false,
      isFav: false,
      isVeg: false
    },
    {
      id: 6,
      name: 'Kapoor\'s Cafe',
      image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      location: 'Whitefield',
      distance: '8 km',
      time: '60 mins',
      tags: 'Punjabi, Paratha, Lassi',
      price_for_two: '₹600 for two',
      rating: 4.3,
      ratingCount: '8K+',
      offers: [
        { icon: 'pricetag', text: 'Flat ₹100 OFF' }
      ],
      isAd: false,
      isFav: true,
      isVeg: true
    }
  ];

  constructor(private navCtrl: NavController) {
    addIcons({ 
      searchOutline, optionsOutline, heartOutline, star, heart, 
      bookmarkOutline, locationOutline, chevronDownOutline, pricetagOutline,
      bicycleOutline, timeOutline, flame
    });
  }

  ngOnInit() { }

gotodetails(){
    this.navCtrl.navigateForward('/layout/dineout-layout/dineout-hotel-details');
}
}