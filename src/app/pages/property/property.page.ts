import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  location,
  chevronDown,
  searchOutline,
  optionsOutline,
  heartOutline,
  heart,
  callOutline,
  logoWhatsapp,
  bedOutline,
  waterOutline,
  carOutline,
  compassOutline,
  expandOutline,
  checkmarkCircle,
  sparkles,
  shieldCheckmarkOutline,
  filterOutline,
  closeCircleOutline,
  refreshOutline,
  homeOutline,
  keyOutline,
  leafOutline,
  gridOutline,
  shareSocialOutline,
  swapVerticalOutline,
  checkmark,
  closeOutline,
  addOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { PropertyItem, PropertyCategory, DUMMY_PROPERTIES } from 'src/app/models/property.model';
import { LocationService } from 'src/app/services/location.service';
import { PropertyService, PropertyFilters } from 'src/app/services/property.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PropertyFooterComponent } from 'src/app/components/property-footer/property-footer.component';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    IonModal,
    CommonModule,
    FormsModule,
    PropertyFooterComponent
  ]
})
export class PropertyPage implements OnInit, OnDestroy {
  // Address header state
  locationTitle: string = 'Jamkhandi';
  locationSubtitle: string = 'Select your preferred location';
  private locationSub: Subscription | null = null;
  isRefreshing: boolean = false;
  isLoading: boolean = true;

  // Category Tabs
  activeCategory: PropertyCategory = 'buy_house';
  categoryTabs: { id: PropertyCategory; label: string; icon: string; emoji: string }[] = [
    { id: 'buy_house', label: 'Buy House', icon: 'home-outline', emoji: '🏡' },
    { id: 'rent_house', label: 'Rent House', icon: 'key-outline', emoji: '🔑' },
    { id: 'buy_land', label: 'Buy Land', icon: 'leaf-outline', emoji: '🌾' },
    { id: 'buy_plot', label: 'Buy Plot', icon: 'grid-outline', emoji: '📐' }
  ];

  // Search & Filters
  searchQuery: string = '';
  selectedBhk: string = 'all'; // 'all', '1', '2', '3', '4+'
  selectedBudget: string = 'all'; // depends on buy vs rent
  selectedFurnishing: string = 'all';
  selectedFacing: string = 'all';
  selectedParking: string = 'all';
  verifiedOnly: boolean = false;
  sortBy: 'featured' | 'price_low' | 'price_high' | 'newest' | 'area_high' = 'featured';

  // Bottom sheets state
  isSortModalOpen: boolean = false;
  isFilterModalOpen: boolean = false;

  // Rendered listings from API
  filteredProperties: PropertyItem[] = [];

  private searchSubject = new Subject<string>();
  private searchSub: Subscription | null = null;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private locationService: LocationService,
    private propertyService: PropertyService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      arrowBackOutline,
      location,
      chevronDown,
      searchOutline,
      optionsOutline,
      heartOutline,
      heart,
      callOutline,
      logoWhatsapp,
      bedOutline,
      waterOutline,
      carOutline,
      compassOutline,
      expandOutline,
      checkmarkCircle,
      sparkles,
      shieldCheckmarkOutline,
      filterOutline,
      closeCircleOutline,
      refreshOutline,
      homeOutline,
      keyOutline,
      leafOutline,
      gridOutline,
      shareSocialOutline,
      swapVerticalOutline,
      checkmark,
      closeOutline,
      addOutline,
      lockClosedOutline
    });
  }

  ngOnInit() {
    this.initLocation();
    this.setupSearchSubscription();
    this.fetchPropertiesFromApi();
  }

  ionViewWillEnter() {
    this.initLocation();
    this.fetchPropertiesFromApi();
  }

  ngOnDestroy() {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }

  private setupSearchSubscription() {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.fetchPropertiesFromApi();
    });
  }

  onSearchChanged(query: string) {
    this.searchSubject.next(query);
  }

  clearSearch() {
    this.searchQuery = '';
    this.fetchPropertiesFromApi();
  }

  private initLocation() {
    // 1. Try reading selected location from localStorage
    try {
      const saved = localStorage.getItem('location');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.applyAcquiredLocation(parsed);
        if (parsed.lat && parsed.lng) {
          this.detectServiceArea(Number(parsed.lat), Number(parsed.lng));
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read cached location in property page:', e);
    }

    // 2. Try primary address from localStorage as fallback
    try {
      const primarySaved = localStorage.getItem('primary_address');
      if (primarySaved) {
        const primaryParsed = JSON.parse(primarySaved);
        this.applyAcquiredLocation(primaryParsed);
        if (primaryParsed.lat && primaryParsed.lng) {
          this.detectServiceArea(Number(primaryParsed.lat), Number(primaryParsed.lng));
          return;
        }
      }
    } catch {}

    // 3. Fallback: Subscribe to live LocationService streams
    this.locationSub = this.locationService.address$.subscribe((addr) => {
      if (addr) {
        this.locationSubtitle = addr;
      }
    });

    // 4. Try current GPS position if nothing in storage
    this.locationService.getCurrentPosition().then((pos: any) => {
      if (pos?.coords?.coords) {
        const lat = pos.coords.coords.latitude;
        const lng = pos.coords.coords.longitude;
        if (pos.address) this.locationSubtitle = pos.address;
        this.detectServiceArea(lat, lng);
      }
    }).catch(() => {});
  }

  private applyAcquiredLocation(data: any) {
    if (!data) return;

    // Exact street/locality address below
    const detailedParts = [
      data.house_no,
      data.building_name,
      data.landmark ? 'Near ' + data.landmark : '',
      data.address
    ].filter(Boolean);

    if (detailedParts.length > 1) {
      this.locationSubtitle = detailedParts.join(', ');
    } else if (data.address && data.address.trim()) {
      this.locationSubtitle = data.address.trim();
    }

    // Interim service area / city name on top
    if (data.city && data.city.trim()) {
      this.locationTitle = data.city.trim();
    } else if (data.area && data.area.trim()) {
      this.locationTitle = data.area.trim();
    }
  }

  private detectServiceArea(lat: number, lng: number) {
    this.locationService.checkLocationInServiceArea(lat, lng).subscribe({
      next: (res: any) => {
        if (res?.success) {
          if (res.inServiceArea && res.area) {
            // Service area name on top
            this.locationTitle = res.area.cityName || res.area.name || this.locationTitle || 'Jamkhandi';
          } else if (res.nearestArea) {
            // Nearest service area name on top
            this.locationTitle = res.nearestArea.cityName || this.locationTitle || 'Jamkhandi';
          }
        }
      },
      error: (err) => {
        console.warn('Could not detect service area for property page:', err);
      }
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/layout/home');
  }

  openLocation() {
    this.router.navigate(['/layout/map']);
  }

  async refreshData() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    // 1. Re-acquire location & re-evaluate backend service area
    this.initLocation();

    // 2. Fetch fresh property listings from API based on current active filters
    this.fetchPropertiesFromApi();
  }

  fetchPropertiesFromApi() {
    this.isLoading = true;

    // Calculate budget minPrice/maxPrice
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (this.selectedBudget !== 'all') {
      if (this.activeCategory === 'rent_house') {
        if (this.selectedBudget === 'under_10k') maxPrice = 10000;
        else if (this.selectedBudget === '10k_20k') { minPrice = 10000; maxPrice = 20000; }
        else if (this.selectedBudget === 'above_20k') minPrice = 20000;
      } else {
        if (this.selectedBudget === 'under_30l') maxPrice = 3000000;
        else if (this.selectedBudget === '30l_60l') { minPrice = 3000000; maxPrice = 6000000; }
        else if (this.selectedBudget === '60l_1cr') { minPrice = 6000000; maxPrice = 10000000; }
        else if (this.selectedBudget === 'above_1cr') minPrice = 10000000;
      }
    }

    const filters: PropertyFilters = {
      category: this.activeCategory,
      search: this.searchQuery.trim() || undefined,
      bedrooms: (this.activeCategory === 'buy_house' || this.activeCategory === 'rent_house') && this.selectedBhk !== 'all' ? this.selectedBhk : undefined,
      minPrice,
      maxPrice,
      furnishing: this.selectedFurnishing !== 'all' ? this.selectedFurnishing : undefined,
      facing: this.selectedFacing !== 'all' ? this.selectedFacing : undefined,
      parking: this.selectedParking !== 'all' ? this.selectedParking : undefined,
      verifiedOnly: this.verifiedOnly ? true : undefined,
      sortBy: this.sortBy !== 'featured' ? this.sortBy : undefined
    };

    this.propertyService.getProperties(filters).subscribe({
      next: (data) => {
        this.filteredProperties = data || [];
        this.isLoading = false;
        this.isRefreshing = false;
      },
      error: (err) => {
        console.warn('Failed to fetch filtered properties from API:', err);
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  setCategory(catId: PropertyCategory) {
    if (this.activeCategory === catId) return;
    this.activeCategory = catId;
    this.selectedBhk = 'all';
    this.selectedBudget = 'all';
    this.selectedFurnishing = 'all';
    this.selectedFacing = 'all';
    this.selectedParking = 'all';
    this.fetchPropertiesFromApi();
  }

  setBhkFilter(bhk: string) {
    this.selectedBhk = this.selectedBhk === bhk ? 'all' : bhk;
    this.fetchPropertiesFromApi();
  }

  setBudgetFilter(budget: string) {
    this.selectedBudget = this.selectedBudget === budget ? 'all' : budget;
    this.fetchPropertiesFromApi();
  }

  setFurnishingFilter(f: string) {
    this.selectedFurnishing = this.selectedFurnishing === f ? 'all' : f;
    this.fetchPropertiesFromApi();
  }

  setFacingFilter(facing: string) {
    this.selectedFacing = this.selectedFacing === facing ? 'all' : facing;
    this.fetchPropertiesFromApi();
  }

  setParkingFilter(parking: string) {
    this.selectedParking = this.selectedParking === parking ? 'all' : parking;
    this.fetchPropertiesFromApi();
  }

  toggleVerifiedOnly() {
    this.verifiedOnly = !this.verifiedOnly;
    this.fetchPropertiesFromApi();
  }

  // Sort Modal Handlers
  openSortModal() {
    this.isSortModalOpen = true;
  }

  closeSortModal() {
    this.isSortModalOpen = false;
  }

  selectSort(sort: 'featured' | 'price_low' | 'price_high' | 'newest' | 'area_high') {
    this.sortBy = sort;
    this.closeSortModal();
    this.fetchPropertiesFromApi();
  }

  get currentSortLabel(): string {
    switch (this.sortBy) {
      case 'price_low': return 'Price: Low to High';
      case 'price_high': return 'Price: High to Low';
      case 'newest': return 'Newest First';
      case 'area_high': return 'Largest Area';
      default: return 'Featured';
    }
  }

  // Filter Modal Handlers
  openFilterModal() {
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  applyFilters() {
    this.closeFilterModal();
    this.fetchPropertiesFromApi();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.selectedBhk = 'all';
    this.selectedBudget = 'all';
    this.selectedFurnishing = 'all';
    this.selectedFacing = 'all';
    this.selectedParking = 'all';
    this.verifiedOnly = false;
    this.sortBy = 'featured';
    this.fetchPropertiesFromApi();
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.verifiedOnly) count++;
    if (this.selectedBhk !== 'all') count++;
    if (this.selectedBudget !== 'all') count++;
    if (this.selectedFurnishing !== 'all') count++;
    if (this.selectedFacing !== 'all') count++;
    if (this.selectedParking !== 'all') count++;
    return count;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchQuery.trim().length > 0 ||
      this.activeFiltersCount > 0 ||
      this.sortBy !== 'featured'
    );
  }

  toggleFavorite(prop: PropertyItem, event: Event) {
    event.stopPropagation();
    prop.isFavorite = !prop.isFavorite;
  }

  viewDetails(prop: PropertyItem) {
    this.router.navigate(['/layout/property/details', prop.id]);
  }

  callSeller(prop: PropertyItem, event: Event) {
    event.stopPropagation();
    if (prop.status === 'sold') return;
    window.open(`tel:${prop.seller.phone.replace(/[^0-9+]/g, '')}`, '_system');
  }

  whatsappSeller(prop: PropertyItem, event: Event) {
    event.stopPropagation();
    if (prop.status === 'sold') return;
    const text = encodeURIComponent(
      `Hello ${prop.seller.name}, I am interested in your property on Pintu: "${prop.title}" (${prop.priceDisplay}) located in ${prop.locality}. Is it still available?`
    );
    window.open(`https://wa.me/${prop.seller.whatsapp}?text=${text}`, '_system');
  }

  goToRegisterProperty() {
    this.router.navigate(['/layout/property/register']);
  }
}