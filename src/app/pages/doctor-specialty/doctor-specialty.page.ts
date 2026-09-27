// pages/doctor-specialty/doctor-specialty.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  searchOutline,
  closeCircle,
  checkmarkCircle,
  star,
  locationOutline,
  videocamOutline,
  medkitOutline,
  calendarOutline,
  timeOutline,
  personOutline,
  callOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline,
  sparklesOutline,
  filterOutline,
} from 'ionicons/icons';
import { DoctorService } from 'src/app/services/doctor.service';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  Doctor,
  DoctorCategory,
} from 'src/app/models/doctor.model';

@Component({
  selector: 'app-doctor-specialty',
  templateUrl: './doctor-specialty.page.html',
  styleUrls: ['./doctor-specialty.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonToast,
  ],
})
export class DoctorSpecialtyPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private doctorService = inject(DoctorService);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);

  // Category & Doctor Data
  categoryId: string = 'gynecologist';
  currentCategory: DoctorCategory | null = null;
  doctors: Doctor[] = [];
  allSpecialtyDoctors: Doctor[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  activeFilter: 'all' | 'top' | 'today' | 'clinic' | 'video' = 'all';
  currentCity: string = 'Athani';

  // Toast
  toastMessage: string = '';
  isToastOpen: boolean = false;

  // Track appointed doctors in this session
  appointedDoctorIds: { [doctorId: string]: { date: string; time: string; bookingId: string } } = {};

  constructor() {
    addIcons({
      arrowBack,
      searchOutline,
      closeCircle,
      checkmarkCircle,
      star,
      locationOutline,
      videocamOutline,
      medkitOutline,
      calendarOutline,
      timeOutline,
      personOutline,
      callOutline,
      shieldCheckmarkOutline,
      chevronForwardOutline,
      sparklesOutline,
      filterOutline,
    });
  }

  ngOnInit() {
    this.syncCity();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('categoryId');
      if (id) {
        this.categoryId = id;
        this.loadCategoryAndDoctors();
      } else {
        this.loadCategoryAndDoctors();
      }
    });
  }


  private syncCity() {
    this.locationService.city$.subscribe((city: string) => {
      if (city && city.trim()) {
        this.currentCity = city.trim();
      }
    });
  }

  loadCategoryAndDoctors() {
    this.isLoading = true;

    // 1. Fetch Categories to find current category metadata
    this.doctorService.getCategories().subscribe({
      next: (categories) => {
        const found = categories.find((c) => c.id === this.categoryId);
        if (found) {
          this.currentCategory = found;
        } else {
          this.currentCategory = {
            id: this.categoryId,
            name: this.formatCategoryName(this.categoryId),
            title: this.formatCategoryName(this.categoryId),
            icon: 'medkit-outline',
            color: '#a000e2',
            bgColor: '#fbf5ff',
            borderColor: '#e9d5ff',
            description: 'Specialist consultations',
          };
        }
      },
    });

    // 2. Fetch Doctors for this category
    this.doctorService.getDoctors({ category: this.categoryId }).subscribe({
      next: (data) => {
        this.allSpecialtyDoctors = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatCategoryName(id: string): string {
    return id
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  onSearchInput() {
    this.applyFilters();
  }

  clearSearch() {
    this.searchQuery = '';
    this.applyFilters();
  }

  setFilter(filter: 'all' | 'top' | 'today' | 'clinic' | 'video') {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    let list = [...this.allSpecialtyDoctors];

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(
        (doc) =>
          doc.name.toLowerCase().includes(q) ||
          doc.specialization.toLowerCase().includes(q) ||
          doc.hospitalOrClinic.toLowerCase().includes(q)
      );
    }

    // Tab filter
    switch (this.activeFilter) {
      case 'top':
        list = list.filter((d) => d.rating >= 4.8 || d.isTopDoctor);
        break;
      case 'today':
        list = list.filter((d) => d.availableToday);
        break;
      case 'clinic':
        list = list.filter((d) => d.consultationModes.includes('In-Clinic'));
        break;
      case 'video':
        list = list.filter((d) => d.consultationModes.includes('Video Call'));
        break;
    }

    this.doctors = list;
  }

  handleRefresh(event: any) {
    this.loadCategoryAndDoctors();
    setTimeout(() => {
      event?.target?.complete();
    }, 600);
  }

  goBack() {
    this.navCtrl.back();
  }

  navigateToBooking(doc: Doctor) {
    this.router.navigate(['/layout/doctor-booking', doc.id]);
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}
