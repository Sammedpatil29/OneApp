import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  arrowBack, shareSocialOutline, heartOutline, heart,
  star, timeOutline, callOutline, locationOutline,
  navigateOutline, imagesOutline, chevronDownOutline,
  informationCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dineout-hotel-details',
  templateUrl: './dineout-hotel-details.page.html',
  styleUrls: ['./dineout-hotel-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class DineoutHotelDetailsPage implements OnInit {

  // Active Tab State
  activeSegment = 'offers';

  // Dummy Data matching the screenshot
  restaurant = {
    name: 'Poco A Poco - Crescendo',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    galleryCount: 20,
    distance: '8.5 km',
    location: 'Akshay Nagar, Bangalore',
    tags: 'Continental, North Indian',
    price: '₹1200 for two',
    rating: 5.0,
    ratingCount: 14,
    isOpen: false,
    openTime: '7:30AM',
    isFav: false,
    offers: [
      { 
        title: '20% Cashback', 
        subtitle: 'on every dining bill',
        image: 'assets/banner-green.png' // You can use a CSS gradient if no image
      }
    ]
  };

  segments = ['Offers', 'Reviews', 'Menu', 'Photos', 'About'];

  constructor() {
    addIcons({ 
      arrowBack, shareSocialOutline, heartOutline, heart,
      star, timeOutline, callOutline, locationOutline,
      navigateOutline, imagesOutline, chevronDownOutline,
      informationCircleOutline
    });
  }

  ngOnInit() { }

}