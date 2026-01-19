import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonCardSubtitle, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonModal, IonImg, IonSpinner, IonSearchbar, IonSkeletonText, IonBadge, IonFab, IonFabButton } from '@ionic/angular/standalone';
import { arrowBack, chevronBack, helpCircleOutline, ticketOutline, searchOutline, heart, heartOutline, locationOutline, calendarOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController, ModalController } from '@ionic/angular';
import { FooterComponent } from "../../components/footer/footer.component";
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventDialogComponent } from 'src/app/components/event-dialog/event-dialog.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, FooterComponent,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonImg,
    IonModal, IonSpinner, IonSearchbar, IonSkeletonText, IonBadge, IonFab, IonFabButton
  ]
})
export class EventsPage implements OnInit {
  events: any[] = [];
  filteredEvents: any[] = [];
  featuredEvents: any[] = []; // Top 3-5 events
  categories: string[] = [];
  
  isLoading: boolean = true;
  currentFilter: string = 'All';
  searchTerm: string = '';
  
  @ViewChild(IonModal) modal: IonModal | undefined;

  constructor(
    private navCtrl: NavController, 
    private eventsService: EventsService, 
    private authService: AuthService, 
    private modalCtrl: ModalController
  ) { 
    addIcons({arrowBack,calendarOutline,searchOutline,locationOutline,ticketOutline,chevronBack,helpCircleOutline,heart,heartOutline}); 
  }

  ngOnInit() {
    this.authService.getToken().then(token => {
      this.getEvents();
    }).catch(error => {
      console.error('Auth Error:', error);
      this.isLoading = false; // Stop loading on error
    });
  }

  getEvents() {
    this.isLoading = true;
    this.eventsService.getEvents().subscribe((res: any) => {
      // Simulate network delay to show off skeleton (remove in production)
      setTimeout(() => {
        this.events = res.data.map((e: any) => ({ ...e, isFavorite: false })); // Add favorite state locally
        this.categories = this.getUniqueCategories(this.events);
        
        // Pick first 5 as "Featured" for the hero slider
        this.featuredEvents = this.events.slice(0, 5);
        
        this.applyFilter('All');
        this.isLoading = false;
      }, 800);
    }, error => {
      this.isLoading = false;
    });
  }

  getUniqueCategories(events: any[]): string[] {
    return [...new Set(events.map(event => event.category))].filter(Boolean).sort();
  }

  applyFilter(filterType: string) {
    this.currentFilter = filterType;
    this.filterList();
  }

  handleSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filterList();
  }

  filterList() {
    let temp = this.events;

    // 1. Apply Category Filter
    if (this.currentFilter === 'Upcoming') {
      const today = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(today.getDate() + 10);
      temp = temp.filter((e: any) => {
        const d = new Date(e.date);
        return d >= today && d <= tenDaysFromNow;
      });
    } else if (this.currentFilter !== 'All') {
      temp = temp.filter((e: any) => e.category === this.currentFilter);
    }

    // 2. Apply Search Filter
    if (this.searchTerm) {
      temp = temp.filter((e: any) => 
        e.title.toLowerCase().includes(this.searchTerm) || 
        (e.location.location && e.location.location.toLowerCase().includes(this.searchTerm))
      );
    }

    this.filteredEvents = temp;
  }

  toggleFavorite(event: any, e: Event) {
    e.stopPropagation(); // Prevent opening modal
    event.isFavorite = !event.isFavorite;
    // Call API to save favorite here
  }

  async openItemModal(item: any) {
    document.body.classList.add('modal-open');
    const modal = await this.modalCtrl.create({
      component: EventDialogComponent,
      componentProps: { item },
      cssClass: 'bottom-sheet-modal',
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      handle: true
    });
    
    await modal.present();
    await modal.onDidDismiss();
    document.body.classList.remove('modal-open');
  }

  openBookings() { this.navCtrl.navigateForward('/layout/example/history'); }
  openHelp() { this.navCtrl.navigateForward('/layout/support'); }
  back() { this.navCtrl.navigateBack('/layout/example/home'); }
}