// pages/consult-doctor/consult-doctor.page.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { Router } from '@angular/router';
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
  sparklesOutline,
  shieldCheckmarkOutline,
  chevronForwardOutline,
  filterOutline,
  femaleOutline,
  happyOutline,
  heartOutline,
  bodyOutline,
  earOutline,
  eyeOutline,
  ribbonOutline,
  cashOutline,
  flashOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import { DoctorService } from 'src/app/services/doctor.service';
import { LocationService } from 'src/app/services/location.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  Doctor,
  DoctorCategory,
} from 'src/app/models/doctor.model';

@Component({
  selector: 'app-consult-doctor',
  templateUrl: './consult-doctor.page.html',
  styleUrls: ['./consult-doctor.page.scss'],
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
export class ConsultDoctorPage implements OnInit {
  private doctorService = inject(DoctorService);
  private locationService = inject(LocationService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);
  private router = inject(Router);

  // Categories & Doctors Data
  categories: DoctorCategory[] = [];
  selectedCategoryId: string = 'gynecologist';
  topFiveDoctors: Doctor[] = [];
  allDoctors: Doctor[] = [];

  // Loading & Filter States
  isLoadingCategories: boolean = true;
  isLoadingDoctors: boolean = true;
  searchQuery: string = '';
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
      sparklesOutline,
      shieldCheckmarkOutline,
      chevronForwardOutline,
      filterOutline,
      femaleOutline,
      happyOutline,
      heartOutline,
      bodyOutline,
      earOutline,
      eyeOutline,
      ribbonOutline,
      cashOutline,
      flashOutline,
      shareSocialOutline,
    });
  }

  ngOnInit() {
    this.syncCity();
    this.loadCategories();
    this.loadTopDoctors();
  }

  private syncCity() {
    this.locationService.city$.subscribe((city: string) => {
      if (city && city.trim()) {
        this.currentCity = city.trim();
      }
    });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    this.doctorService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoadingCategories = false;
      },
      error: () => {
        this.isLoadingCategories = false;
      },
    });
  }

  loadTopDoctors() {
    this.isLoadingDoctors = true;
    this.doctorService.getDoctors().subscribe({
      next: (all) => {
        this.allDoctors = all;
        this.filterTopFive();
        this.isLoadingDoctors = false;
      },
      error: () => {
        this.isLoadingDoctors = false;
      },
    });
  }

  filterTopFive() {
    let list = [...this.allDoctors];

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.hospitalOrClinic.toLowerCase().includes(q)
      );
    }

    // Sort by isTopDoctor and rating, then take top 5
    const sorted = list.sort((a, b) => {
      if (a.isTopDoctor && !b.isTopDoctor) return -1;
      if (!a.isTopDoctor && b.isTopDoctor) return 1;
      return b.rating - a.rating;
    });

    this.topFiveDoctors = sorted.slice(0, 5);
  }

  navigateToSpecialty(catId: string) {
    this.router.navigate(['/layout/doctor-specialty', catId]);
  }

  onSearchInput() {
    this.filterTopFive();
  }

  clearSearch() {
    this.searchQuery = '';
    this.filterTopFive();
  }

  navigateToBooking(doctor: Doctor) {
    this.router.navigate(['/layout/doctor-booking', doctor.id]);
  }

  handleRefresh(event: any) {
    this.loadCategories();
    this.loadTopDoctors();
    setTimeout(() => {
      event?.target?.complete();
    }, 800);
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  goBack() {
    this.navCtrl.back();
  }
}

