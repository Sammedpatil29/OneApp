import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  searchOutline, optionsOutline, heartOutline, star, heart, 
  bookmarkOutline, locationOutline, chevronDownOutline, pricetagOutline,
  bicycleOutline, timeOutline, flame, homeOutline, closeCircle
} from 'ionicons/icons';
import { DineoutService } from 'src/app/services/dineout.service';
import { ErrorComponent } from "src/app/components/error/error.component";

@Component({
  selector: 'app-dineout',
  templateUrl: './dineout.page.html',
  styleUrls: ['./dineout.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ErrorComponent]
})
export class DineoutPage implements OnInit {

  // City Dropdown Data
  cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];
  selectedCity = 'Bangalore';
  isLoading: boolean = false;
  isError: boolean = false;

  // Filters UI State
  // REMOVED: 'Fast Delivery'
  filters = ['Sort by', 'Pure Veg', 'Rated 4.0+', 'New Arrivals'];
  activeFilters: string[] = [];
  
  // Sorting State
  currentSort = ''; // '' | 'rating' | 'cost_low'

  // Search State
  searchTerm = '';

  // Data
  allRestaurants: any[] = []; // Master copy
  restaurants: any[] = [];    // Display copy

  constructor(private navCtrl: NavController, private dineoutService: DineoutService) {
    addIcons({ 
      searchOutline, optionsOutline, heartOutline, star, heart, 
      bookmarkOutline, locationOutline, chevronDownOutline, pricetagOutline,
      bicycleOutline, timeOutline, flame, homeOutline, closeCircle
    });
  }

  ngOnInit() {
    this.getRestaurantList();
  }

  getRestaurantList() {
    this.isLoading = true;
    this.isError = false;
    this.dineoutService.getRestaurants().subscribe((res: any) => {
      // Store Master Copy
      this.allRestaurants = res.data;
      // Initialize Display Copy
      this.restaurants = [...this.allRestaurants];
      this.isLoading = false;
    }, () => {
      this.isLoading = false;
      this.isError = true;
    });
  }

  // --- 1. Search Logic ---
  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyAllFilters();
  }

  // --- 2. Filter Button Logic ---
  toggleFilter(filterName: string) {
    // Special Case: Sort By
    if (filterName === 'Sort by') {
      this.toggleSort();
      return;
    }

    // Toggle other filters
    if (this.activeFilters.includes(filterName)) {
      this.activeFilters = this.activeFilters.filter(f => f !== filterName);
    } else {
      this.activeFilters.push(filterName);
    }
    
    this.applyAllFilters();
  }

  toggleSort() {
    // Cycle: '' -> 'rating' -> 'cost_low' -> ''
    if (this.currentSort === '') this.currentSort = 'rating';
    else if (this.currentSort === 'rating') this.currentSort = 'cost_low';
    else this.currentSort = '';
    
    this.applyAllFilters();
  }

  // --- 3. Master Filter Function ---
  applyAllFilters() {
    let temp = [...this.allRestaurants];

    // A. Apply Search
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      
      temp = temp.filter(r => {
        // 1. Safe Name Check
        const nameMatch = (r.name || '').toLowerCase().includes(term);
        
        // 2. Safe Tags Check (Handles Array OR String)
        let tagMatch = false;
        if (Array.isArray(r.tags)) {
          // If tags is ['Pizza', 'Burger']
          tagMatch = r.tags.join(' ').toLowerCase().includes(term);
        } else if (typeof r.tags === 'string') {
          // If tags is "Pizza, Burger"
          tagMatch = r.tags.toLowerCase().includes(term);
        }

        return nameMatch || tagMatch;
      });
    }

    // B. Apply "Pure Veg"
    if (this.activeFilters.includes('Pure Veg')) {
      temp = temp.filter(r => r.isVeg === true);
    }

    // C. Apply "Rated 4.0+"
    if (this.activeFilters.includes('Rated 4.0+')) {
      temp = temp.filter(r => r.rating >= 4.0);
    }

    // D. Apply "New Arrivals"
    if (this.activeFilters.includes('New Arrivals')) {
      // Add logic if you have an 'isNew' flag, otherwise this does nothing
    }

    // E. Apply Sorting
    if (this.currentSort === 'rating') {
      temp.sort((a, b) => b.rating - a.rating); // High to Low
    } else if (this.currentSort === 'cost_low') {
      temp.sort((a, b) => {
        // Extract numbers from string "₹800 for two" -> 800
        const priceA = parseInt((a.price_for_two || '0').toString().replace(/[^0-9]/g, '')) || 0;
        const priceB = parseInt((b.price_for_two || '0').toString().replace(/[^0-9]/g, '')) || 0;
        return priceA - priceB;
      });
    }

    this.restaurants = temp;
  }

  // --- Navigation ---
  gotodetails(restaurantId: number) {
    this.navCtrl.navigateForward(`/layout/dineout-layout/dineout-hotel-details/${restaurantId}`);
  }

  goHome() {
    this.navCtrl.navigateBack(['/home']);
  }

  gotohome() {
    this.navCtrl.navigateForward('/layout/example/home');
  }
}