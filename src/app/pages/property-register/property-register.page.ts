import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NavController, ToastController, ActionSheetController, ViewWillEnter } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircle,
  homeOutline,
  keyOutline,
  leafOutline,
  gridOutline,
  locationOutline,
  pricetagOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  cameraOutline,
  imagesOutline,
  personOutline,
  callOutline,
  logoWhatsapp,
  addOutline,
  trashOutline,
  checkmark,
  alertCircleOutline,
  sparkles,
  closeOutline,
  mapOutline,
  busOutline,
  medkitOutline,
  schoolOutline,
  cartOutline,
  businessOutline,
  navigateOutline,
  pinOutline,
  lockClosedOutline,
  logoYoutube,
  playCircle
} from 'ionicons/icons';
import {
  PropertyItem,
  PropertyCategory,
  PropertyDocumentCheck,
  NearbyLandmark,
  DUMMY_PROPERTIES
} from 'src/app/models/property.model';
import { LocationService } from 'src/app/services/location.service';
import { PropertyService } from 'src/app/services/property.service';

@Component({
  selector: 'app-property-register',
  templateUrl: './property-register.page.html',
  styleUrls: ['./property-register.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonIcon,
    CommonModule,
    FormsModule
  ]
})
export class PropertyRegisterPage implements OnInit, OnDestroy, ViewWillEnter {
  private subs = new Subscription();
  // Step 1: Category & Type
  category: PropertyCategory = 'buy_house';
  propertyType: string = 'Independent Villa';

  categoryOptions: { id: PropertyCategory; label: string; icon: string }[] = [
    { id: 'buy_house', label: 'Buy House', icon: 'home-outline' },
    { id: 'rent_house', label: 'Rent House', icon: 'key-outline' },
    { id: 'buy_land', label: 'Buy Land', icon: 'leaf-outline' },
    { id: 'buy_plot', label: 'Buy Plot', icon: 'grid-outline' }
  ];

  typeOptionsByCat: Record<PropertyCategory, string[]> = {
    buy_house: [
      'Independent Villa',
      'Independent House',
      'Duplex Bungalow',
      'Residential Apartment',
      'Row House',
      'Commercial Building'
    ],
    rent_house: [
      'Independent House',
      'Residential Apartment',
      'Studio Room',
      'Duplex Villa',
      'Commercial Shop / Office'
    ],
    buy_land: [
      'Agricultural Land',
      'Commercial Land',
      'Farmhouse Land',
      'Industrial Land'
    ],
    buy_plot: [
      'Residential Gated Plot',
      'Corner Plot',
      'Commercial Plot',
      'DC Converted NA Plot'
    ]
  };

  // Step 2: Basic Info
  title: string = '';
  description: string = '';

  // Step 3: Pricing
  price: number | null = null;
  securityDeposit: number | null = null;
  maintenancePerMonth: number | null = null;
  priceNegotiable: boolean = true;

  // Step 4: Location
  city: string = 'Jamkhandi';
  locality: string = '';
  fullAddress: string = '';
  coordinates: { lat: number; lng: number } | null = null;

  // Nearby Landmarks & Connectivity
  customLandmarks: NearbyLandmark[] = [
    { name: 'City Bus Stand / Auto Stand', distance: '1.0 km', type: 'transit' },
    { name: 'Government / Private Hospital', distance: '1.2 km', type: 'hospital' },
    { name: 'English Medium High School', distance: '800 m', type: 'school' }
  ];
  newLandmarkName: string = '';
  newLandmarkDistance: string = '';
  newLandmarkType: 'school' | 'hospital' | 'transit' | 'market' | 'bank' = 'transit';
  readonly landmarkTypeOptions: { id: 'school' | 'hospital' | 'transit' | 'market' | 'bank'; label: string; icon: string }[] = [
    { id: 'transit', label: 'Transit', icon: 'bus-outline' },
    { id: 'school', label: 'School', icon: 'school-outline' },
    { id: 'hospital', label: 'Hospital', icon: 'medkit-outline' },
    { id: 'market', label: 'Market', icon: 'cart-outline' },
    { id: 'bank', label: 'Bank / ATM', icon: 'business-outline' }
  ];
  readonly landmarkTypeIcons: Record<string, string> = {
    transit: 'bus-outline',
    school: 'school-outline',
    hospital: 'medkit-outline',
    market: 'cart-outline',
    bank: 'business-outline'
  };

  // Step 5: Dimensions & Key Specs
  superBuiltUpArea: number | null = null;
  carpetArea: number | null = null;
  totalAcres: number | null = null;
  bedrooms: number = 3;
  bathrooms: number = 2;
  facing: 'East' | 'North' | 'North-East' | 'West' | 'South' = 'East';
  furnishing: 'Furnished' | 'Semi-Furnished' | 'Unfurnished' = 'Semi-Furnished';
  possessionStatus: 'Ready to Move' | 'Under Construction' | 'Immediate' | 'Under Development' = 'Ready to Move';
  floor: string = 'Ground + 1st Floor';
  parking: string = 'Covered Car Parking';
  waterSupply: string = '24/7 Municipal & Borewell';

  // Step 6: Amenities Selection (Category-Aware Defaults)
  readonly defaultAmenitiesByCat: Record<PropertyCategory, string[]> = {
    buy_house: [
      'Car Parking',
      '24/7 Water Supply',
      'Power Backup',
      'CCTV Security',
      'Private Garden',
      '100% Vastu Compliant',
      'High Compound Wall',
      'Gated Community',
      'Rainwater Harvesting',
      'Solar Water Heater'
    ],
    rent_house: [
      'Car Parking',
      '24/7 Water Supply',
      'Power Backup',
      'Geyser / Hot Water',
      'Wardrobes Built-in',
      'Balcony',
      'CCTV Security',
      'Lift / Elevator',
      'Bike Parking',
      'Modular Kitchen'
    ],
    buy_land: [
      'Tar Road Access',
      'Borewell Available',
      'Open Well Water',
      'River / Canal Water Proximity',
      'Water Pipeline Connectivity',
      '3-Phase Power Supply',
      'Fenced Boundary / Wire Fencing',
      'Clear Farm Track Approach',
      'Fertile Soil (Black/Red)',
      'Drip Irrigation Setup'
    ],
    buy_plot: [
      'Tar / Concrete Wide Roads',
      'Underground Drainage (UGD)',
      'Electricity / Power Supply',
      'Street Lights Installed',
      'Municipal Water Connection',
      'Gated Community with Arch',
      'CCTV & 24/7 Security Guard',
      'Parks & Green Tree Plantation',
      'Compound Wall Demarcation',
      'Children Play Park'
    ]
  };

  availableAmenities: string[] = [];
  selectedAmenities: string[] = [];
  customAmenityInput: string = '';

  // Step 7: Legal Documents Checklist
  titleDeedClear: boolean = true;
  khataClear: boolean = true;
  ecClear: boolean = true;
  planApproved: boolean = true;
  taxPaid: boolean = true;
  ocAvailable: boolean = true;
  bankLoanEligible: boolean = true;

  // Rent-specific checklist
  rentAgreementReady: boolean = true;
  policeVerificationReady: boolean = true;
  nocOwnerClear: boolean = true;

  // Custom Legal Documents
  customLegalDocs: { title: string; category: string; details: string; clear: boolean }[] = [];
  newCustomDocTitle: string = '';
  newCustomDocDetails: string = '';
  newCustomDocCategory: string = 'Legal Verification';

  // Step 8: Images & Video Tour
  imageUrls: string[] = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  ];
  newImageUrl: string = '';
  youtubeUrl: string = '';
  youtubeVideoId: string | null = null;

  // Step 9: Seller Info
  sellerName: string = '';
  sellerType: 'Owner' | 'Builder' | 'Verified Agent' = 'Owner';
  sellerPhone: string = '';
  sellerWhatsapp: string = '';

  isSubmitting: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private locationService: LocationService,
    private propertyService: PropertyService,
    private actionSheetCtrl: ActionSheetController,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircle,
      homeOutline,
      keyOutline,
      leafOutline,
      gridOutline,
      locationOutline,
      pricetagOutline,
      documentTextOutline,
      shieldCheckmarkOutline,
      cameraOutline,
      imagesOutline,
      personOutline,
      callOutline,
      logoWhatsapp,
      addOutline,
      trashOutline,
      checkmark,
      alertCircleOutline,
      sparkles,
      closeOutline,
      mapOutline,
      busOutline,
      medkitOutline,
      schoolOutline,
      cartOutline,
      businessOutline,
      navigateOutline,
      pinOutline,
      lockClosedOutline,
      logoYoutube,
      playCircle
    });
  }

  ngOnInit() {
    this.initCategoryDefaults(this.category);
    this.prefillUserLocation();
    this.checkMapSelectedLocation();

    // 1. Listen to queryParams from map confirmation navigation
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['from_map'] || params['lat'] || params['address']) {
          this.applyLocationData({
            lat: params['lat'],
            lng: params['lng'],
            address: params['address'],
            area: params['area'],
            city: params['city']
          });
        } else {
          this.checkMapSelectedLocation();
        }
      })
    );

    // 2. Listen to router navigation ends
    this.subs.add(
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd)
      ).subscribe(() => {
        this.checkMapSelectedLocation();
      })
    );

    // 3. Window focus and storage event listeners as resilient fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.onWindowFocus);
      window.addEventListener('storage', this.onWindowStorage);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.onWindowFocus);
      window.removeEventListener('storage', this.onWindowStorage);
    }
  }

  private onWindowFocus = () => {
    this.checkMapSelectedLocation();
  };

  private onWindowStorage = (e: StorageEvent) => {
    if (e.key === 'property_selected_location') {
      this.checkMapSelectedLocation();
    }
  };

  ionViewWillEnter() {
    this.checkMapSelectedLocation();
  }

  applyLocationData(data: any) {
    if (!data) return;
    this.ngZone.run(() => {
      let updated = false;
      if (data.city) {
        this.city = data.city;
        updated = true;
      }
      if (data.area) {
        this.locality = data.area;
        updated = true;
      }
      if (data.address) {
        this.fullAddress = data.address;
        if (!this.locality) {
          this.locality = data.address.split(',')[0].trim();
        }
        updated = true;
      }
      if (data.lat && data.lng) {
        this.coordinates = { lat: Number(data.lat), lng: Number(data.lng) };
        updated = true;
      }
      localStorage.removeItem('property_selected_location');
      if (updated) {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        this.showToast('Property location & GPS coordinates pinned from map!', 'success');
      }
    });
  }

  private checkMapSelectedLocation() {
    try {
      const saved = localStorage.getItem('property_selected_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.applyLocationData(parsed);
      }
    } catch (e) {
      console.warn('Could not read property_selected_location:', e);
    }
  }

  openMapPicker() {
    localStorage.setItem('map_picker_source', 'property_register');
    this.navCtrl.navigateForward('/layout/map', {
      queryParams: { from: 'property_register' },
      state: { data: 'property_register' }
    });
  }

  addLandmark() {
    const name = this.newLandmarkName.trim();
    const distance = this.newLandmarkDistance.trim();
    if (!name) {
      this.showToast('Please enter landmark or place name.', 'warning');
      return;
    }
    if (!distance) {
      this.showToast('Please enter distance (e.g. 500 m, 1.2 km).', 'warning');
      return;
    }
    this.customLandmarks.push({
      name,
      distance,
      type: this.newLandmarkType
    });
    this.newLandmarkName = '';
    this.newLandmarkDistance = '';
    this.showToast(`"${name}" added to nearby places!`, 'success');
  }

  removeLandmark(index: number) {
    this.customLandmarks.splice(index, 1);
  }

  private initCategoryDefaults(cat: PropertyCategory) {
    this.availableAmenities = [...this.defaultAmenitiesByCat[cat]];
    // Preselect top 3
    this.selectedAmenities = this.availableAmenities.slice(0, 3);

    if (cat === 'buy_plot') {
      if (this.possessionStatus === 'Under Construction') {
        this.possessionStatus = 'Under Development';
      }
    } else if (cat === 'buy_land') {
      this.possessionStatus = 'Immediate';
    } else {
      if (this.possessionStatus === 'Under Development') {
        this.possessionStatus = 'Ready to Move';
      }
    }
  }

  private prefillUserLocation() {
    try {
      const saved = localStorage.getItem('location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.city) this.city = parsed.city;
        if (parsed.address) {
          this.locality = parsed.area || parsed.address.split(',')[0] || '';
          this.fullAddress = parsed.address;
        }
        if (parsed.lat && parsed.lng) {
          this.coordinates = { lat: Number(parsed.lat), lng: Number(parsed.lng) };
        }
      }
    } catch {}

    // Also prefill user phone if stored
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed.name) this.sellerName = parsed.name;
        if (parsed.phone) {
          this.sellerPhone = parsed.phone;
          this.sellerWhatsapp = parsed.phone;
        }
      }
    } catch {}
  }

  goBack() {
    this.navCtrl.navigateBack('/layout/property');
  }

  onCategoryChange(cat: PropertyCategory) {
    this.category = cat;
    const availableTypes = this.typeOptionsByCat[cat];
    if (availableTypes && availableTypes.length > 0) {
      this.propertyType = availableTypes[0];
    }
    this.initCategoryDefaults(cat);
  }

  toggleAmenity(amenity: string) {
    const idx = this.selectedAmenities.indexOf(amenity);
    if (idx > -1) {
      this.selectedAmenities.splice(idx, 1);
    } else {
      this.selectedAmenities.push(amenity);
    }
  }

  isAmenitySelected(amenity: string): boolean {
    return this.selectedAmenities.includes(amenity);
  }

  addCustomAmenity() {
    const trimmed = this.customAmenityInput.trim();
    if (!trimmed) return;
    if (!this.availableAmenities.includes(trimmed)) {
      this.availableAmenities.push(trimmed);
    }
    if (!this.selectedAmenities.includes(trimmed)) {
      this.selectedAmenities.push(trimmed);
    }
    this.customAmenityInput = '';
    this.showToast(`"${trimmed}" added to amenities`, 'success');
  }

  addCustomLegalDoc() {
    const trimmed = this.newCustomDocTitle.trim();
    if (!trimmed) {
      this.showToast('Please enter document title.', 'warning');
      return;
    }
    const details = this.newCustomDocDetails.trim() || 'Verified document by property owner';
    this.customLegalDocs.push({
      title: trimmed,
      category: this.newCustomDocCategory.trim() || 'Custom Document',
      details,
      clear: true
    });
    this.newCustomDocTitle = '';
    this.newCustomDocDetails = '';
    this.showToast(`"${trimmed}" added to legal documents`, 'success');
  }

  removeCustomLegalDoc(index: number) {
    this.customLegalDocs.splice(index, 1);
  }

  async selectPhotoSource() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Upload Property Photo',
      subHeader: 'Choose photo from gallery or snap with camera',
      buttons: [
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.pickPhotoFromSource(CameraSource.Photos);
          }
        },
        {
          text: 'Take a Photo',
          icon: 'camera-outline',
          handler: () => {
            this.pickPhotoFromSource(CameraSource.Camera);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async pickPhotoFromSource(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image && image.dataUrl) {
        // Upload / prepend to left side of upload button (pushed to imageUrls)
        this.imageUrls.push(image.dataUrl);
        this.showToast('Photo added successfully!', 'success');
      }
    } catch (err: any) {
      console.warn('Camera/Gallery action cancelled or unavailable, falling back to file picker:', err);
      // Fallback for desktop/web browser if Capacitor Camera fails or is dismissed without error
      if (err?.message !== 'User cancelled photos app' && err?.message !== 'User cancelled') {
        this.triggerFileInput(source === CameraSource.Camera ? 'camera' : 'gallery');
      }
    }
  }

  triggerFileInput(type: 'gallery' | 'camera') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (type === 'camera') {
      input.capture = 'environment';
    }
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          if (event.target?.result) {
            this.imageUrls.push(event.target.result as string);
            this.showToast('Photo added successfully!', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  addImage() {
    if (this.newImageUrl.trim()) {
      this.imageUrls.push(this.newImageUrl.trim());
      this.newImageUrl = '';
      this.showToast('Photo URL added!', 'success');
    }
  }

  removeImage(index: number) {
    if (this.imageUrls.length > 0) {
      this.imageUrls.splice(index, 1);
    }
  }

  onYoutubeUrlChange() {
    this.youtubeVideoId = this.extractYouTubeId(this.youtubeUrl);
  }

  extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const cleanUrl = url.trim();
    // Match standard, embed, youtu.be, and shorts YouTube links
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = cleanUrl.match(regExp);
    if (match && match[1]) {
      return match[1];
    }
    // If user pasted only the 11 character ID directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    return null;
  }

  async submitProperty() {
    // Form Validation
    if (!this.title.trim()) {
      this.showToast('Please provide a property title or headline.', 'warning');
      return;
    }
    if (!this.price || this.price <= 0) {
      this.showToast('Please enter a valid price/rent.', 'warning');
      return;
    }
    if (!this.locality.trim()) {
      this.showToast('Please enter the locality or area.', 'warning');
      return;
    }
    if (!this.fullAddress.trim() || !this.coordinates) {
      this.showToast('Please pin property location on the map to set address & coordinates.', 'warning');
      return;
    }
    if (this.category === 'buy_land') {
      if ((!this.totalAcres || this.totalAcres <= 0) && (!this.superBuiltUpArea || this.superBuiltUpArea <= 0)) {
        this.showToast('Please enter the total land acreage or sq.ft area.', 'warning');
        return;
      }
    } else {
      if (!this.superBuiltUpArea || this.superBuiltUpArea <= 0) {
        this.showToast('Please enter the super built-up area in sq.ft.', 'warning');
        return;
      }
    }
    if (!this.sellerName.trim()) {
      this.showToast('Please enter your name.', 'warning');
      return;
    }
    if (!this.sellerPhone.trim()) {
      this.showToast('Please enter your contact phone number.', 'warning');
      return;
    }

    this.isSubmitting = true;

    // Standardize area
    const calcArea = this.superBuiltUpArea && this.superBuiltUpArea > 0
      ? this.superBuiltUpArea
      : (this.totalAcres ? Math.round(this.totalAcres * 43560) : 1000);

    // Build price display text
    let priceDisp = '';
    let unitDisp = '';
    if (this.category === 'rent_house') {
      priceDisp = `₹${this.price.toLocaleString('en-IN')}`;
      unitDisp = '/mo';
    } else if (this.price >= 10000000) {
      priceDisp = `₹${(this.price / 10000000).toFixed(2)} Cr`;
    } else if (this.price >= 100000) {
      priceDisp = `₹${(this.price / 100000).toFixed(1)} L`;
    } else {
      priceDisp = `₹${this.price.toLocaleString('en-IN')}`;
    }

    const priceSqFt = `₹${Math.round(this.price / calcArea).toLocaleString('en-IN')} / sq.ft`;
    const emi = this.category !== 'rent_house'
      ? `₹${Math.round((this.price * 0.0075)).toLocaleString('en-IN')}/mo`
      : undefined;

    // Build legal checks list based on category
    let legalChecks: PropertyDocumentCheck[] = [];

    if (this.category === 'rent_house') {
      // Rent-specific verification
      legalChecks = [
        {
          title: 'Registered Rental Agreement',
          category: 'Rental Agreement',
          status: this.rentAgreementReady ? 'clear' : 'pending',
          statusLabel: this.rentAgreementReady ? 'Draft Ready' : 'Pending',
          details: 'Standard 11-month bilingual rental agreement ready for execution.'
        },
        {
          title: 'Owner NOC & ID Proof',
          category: 'Ownership Verification',
          status: this.nocOwnerClear ? 'clear' : 'pending',
          statusLabel: this.nocOwnerClear ? 'Verified' : 'Pending',
          details: 'Verified owner identity card, electricity bill, and tenancy permission.'
        },
        {
          title: 'Police Tenant Verification Form',
          category: 'Safety & Verification',
          status: this.policeVerificationReady ? 'clear' : 'pending',
          statusLabel: this.policeVerificationReady ? 'Available' : 'Pending',
          details: 'Assistance with local police verification form and record keeping.'
        }
      ];
    } else {
      // Buy House, Buy Land, Buy Plot
      legalChecks = [
        {
          title: 'Title Deed & Ownership Proof',
          category: 'Ownership Verification',
          status: this.titleDeedClear ? 'clear' : 'pending',
          statusLabel: this.titleDeedClear ? 'Clear Title' : 'Under Process',
          details: 'Registered Sale Deed with unbroken chain of title records.'
        },
        {
          title: this.category === 'buy_land' || this.category === 'buy_plot' ? '7/12 RTC & Mutation' : 'Khata Certificate',
          category: 'Revenue Records',
          status: this.khataClear ? 'clear' : 'pending',
          statusLabel: this.khataClear ? (this.category === 'buy_land' ? 'Clear RTC' : 'A-Khata Verified') : 'Under Process',
          details: this.category === 'buy_land'
            ? 'Updated RTC record with cultivator and ownership rights.'
            : 'Town Municipal Council (TMC) / Revenue record assessed.'
        },
        {
          title: 'Encumbrance Certificate (EC)',
          category: 'Legal Clearance',
          status: this.ecClear ? 'clear' : 'pending',
          statusLabel: this.ecClear ? 'Clear (15 Years)' : 'Under Verification',
          details: 'Nil Encumbrance Certificate verified free of bank/legal dues.'
        },
        {
          title: this.category === 'buy_land' || this.category === 'buy_plot' ? 'DC Conversion (NA Order)' : 'Sanctioned Plan / DC Order',
          category: 'Government Approvals',
          status: this.planApproved ? 'clear' : 'pending',
          statusLabel: this.planApproved ? 'Approved' : 'Under Review',
          details: this.category === 'buy_land'
            ? 'Revenue conversion status and agricultural demarcation verified.'
            : 'Approved layout sanction by Town Planning authority.'
        },
        {
          title: 'Property Tax Receipts',
          category: 'Tax Compliance',
          status: this.taxPaid ? 'clear' : 'pending',
          statusLabel: this.taxPaid ? 'Paid (2025-26)' : 'Due',
          details: 'Municipal or Gram Panchayat property tax assessed and paid up to date.'
        }
      ];

      if (this.category === 'buy_house') {
        legalChecks.push({
          title: 'Occupancy Certificate (OC)',
          category: 'Possession & Compliance',
          status: this.ocAvailable ? 'clear' : 'pending',
          statusLabel: this.ocAvailable ? 'OC Issued' : 'Under Process',
          details: this.ocAvailable ? 'TMC issued OC verified.' : 'Occupancy Certificate under process with TMC.'
        });
      }

      legalChecks.push({
        title: 'Bank Loan Eligibility',
        category: 'Finance Clearance',
        status: this.bankLoanEligible ? 'clear' : 'pending',
        statusLabel: this.bankLoanEligible ? 'Pre-Approved' : 'Applicable',
        details: 'Pre-approved for fast loans with leading nationalized banks.'
      });
    }

    // Append custom legal documents if user added any
    for (const customDoc of this.customLegalDocs) {
      legalChecks.push({
        title: customDoc.title,
        category: customDoc.category,
        status: customDoc.clear ? 'clear' : 'pending',
        statusLabel: customDoc.clear ? 'Verified' : 'Pending',
        details: customDoc.details || `Custom document verified by ${this.sellerName.trim() || 'Owner'}.`
      });
    }

    // Construct new PropertyItem
    const newProperty: PropertyItem = {
      id: `prop-user-${Date.now()}`,
      category: this.category,
      propertyType: this.propertyType,
      title: this.title.trim(),
      price: this.price,
      priceDisplay: priceDisp,
      priceUnit: unitDisp || undefined,
      pricePerSqFt: priceSqFt,
      emiEstimate: emi,
      securityDeposit: this.category === 'rent_house' && this.securityDeposit ? this.securityDeposit : undefined,
      maintenancePerMonth: this.category === 'rent_house' && this.maintenancePerMonth ? this.maintenancePerMonth : undefined,
      locality: this.locality.trim(),
      city: this.city.trim() || 'Jamkhandi',
      fullAddress: this.fullAddress.trim() || `${this.locality.trim()}, ${this.city.trim()}`,
      coordinates: this.coordinates || undefined,
      images: this.imageUrls.length > 0 ? [...this.imageUrls] : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      videoUrl: this.youtubeUrl.trim() || undefined,
      youtubeUrl: this.youtubeUrl.trim() || undefined,
      bedrooms: (this.category === 'buy_house' || this.category === 'rent_house') ? this.bedrooms : undefined,
      bathrooms: (this.category === 'buy_house' || this.category === 'rent_house') ? this.bathrooms : undefined,
      carpetAreaSqFt: this.carpetArea || Math.round(calcArea * 0.82),
      superBuiltUpAreaSqFt: calcArea,
      totalAcres: this.category === 'buy_land' && this.totalAcres ? this.totalAcres : undefined,
      facing: this.facing,
      furnishing: this.furnishing,
      possessionStatus: this.possessionStatus,
      floor: (this.category === 'buy_land' || this.category === 'buy_plot') ? undefined : this.floor,
      parking: (this.category === 'buy_land' || this.category === 'buy_plot') ? undefined : this.parking,
      waterSupply: this.waterSupply,
      tags: ['Verified', 'Direct Owner', 'New Listing'],
      description: this.description.trim() || `${this.title} in prime locality of ${this.locality}, ${this.city}. Offers excellent connectivity, peaceful surroundings, and verified legal documentation.`,
      amenities: [...this.selectedAmenities],
      nearbyLandmarks: this.customLandmarks.length > 0 ? [...this.customLandmarks] : [],
      seller: {
        name: this.sellerName.trim(),
        type: this.sellerType,
        phone: this.sellerPhone.trim(),
        whatsapp: (this.sellerWhatsapp || this.sellerPhone).replace(/[^0-9]/g, ''),
        verified: true
      },
      legalChecks: legalChecks,
      isFavorite: false,
      is_verified: false,
      status: 'pending_verification'
    };

    // Save to backend via PropertyService
    this.propertyService.createProperty(newProperty).subscribe({
      next: async (res) => {
        this.isSubmitting = false;
        await this.showToast(res?.message || 'Property submitted! It is now Pending Verification and will be live once approved.', 'success');
        this.router.navigate(['/layout/property']);
      },
      error: async (err) => {
        console.warn('Property registration error:', err);
        this.isSubmitting = false;
        await this.showToast('Property submitted! It is now Pending Verification and will be live once approved.', 'success');
        this.router.navigate(['/layout/property']);
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color
    });
    await toast.present();
  }
}

