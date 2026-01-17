import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonCardSubtitle, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonModal, IonImg, IonSpinner } from '@ionic/angular/standalone';
import { arrowBack, chevronBack, helpCircleOutline, ticketOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { NavController } from '@ionic/angular';
import { FooterComponent } from "../../components/footer/footer.component";
import { EventsService } from 'src/app/services/events.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventDialogComponent } from 'src/app/components/event-dialog/event-dialog.component';
import { ModalController } from '@ionic/angular';
import { PopoverController } from '@ionic/angular';
@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonSpinner,CommonModule, IonImg, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonIcon, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FooterComponent]
})
export class EventsPage implements OnInit {

  events: any = [];
  saved: boolean = false
  isModalOpen: boolean = false
  isLoading: boolean = false
  eventDetails: any
  categories: any
  token: any;
  currentFilter: string = 'Upcoming'; 
  filteredEvents: any[] = [];
  @ViewChild(IonModal, { static: false }) modal: IonModal | undefined;
presentingEl: any;

  constructor(private navCtrl: NavController, private eventsService: EventsService, private authService: AuthService, private modalCtrl: ModalController, private popoverController: PopoverController) { 
          addIcons({chevronBack,helpCircleOutline,ticketOutline,arrowBack}); 
  }

ngOnInit() {
  this.authService.getToken().then(token => {
    this.token = token;
    console.log('Token:', this.token);
    this.getEvents();
  }).catch(error => {
    console.error('Failed to get token:', error);
  });
}

  getEvents(){
    let params = {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJwaG9uZSI6Iis5MTk1OTE0MjAwNjgiLCJ1c2VyX25hbWUiOiJzYW1tZWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0OTQ2MDI4Mn0.tO4XklsZN3Qw4QLHNctoEgW59dk3pOWAeF7qO8Imv8s"
    }
    this.isLoading = true
      this.eventsService.getEvents(params).subscribe((res)=>{
        this.events = [
  {
    "id": 5,
    "title": "Tech Summit 2026",
    "description": "Explore the future of AI and robotics with industry leaders. A two-day deep dive into the next generation of technology.",
    "location": { "lat": "12.9716", "lng": "77.5946", "location": "Silicon Valley Hub" },
    "date": "2026-03-15",
    "time": "09:00:00",
    "duration": "16hr",
    "category": "conference",
    "tags": "tech,ai,future",
    "organizer": "Innovate Corp",
    "contact": "9876543210",
    "email": "events@innovate.com",
    "ticketcount": 500,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "1500.00",
    "imageUrl": "",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 6,
    "title": "Summer Jazz Nights",
    "description": "Relax under the stars with soulful jazz performances by local and international artists.",
    "location": { "lat": "18.5204", "lng": "73.8567", "location": "Blue Gardenia Park" },
    "date": "2026-06-20",
    "time": "19:00:00",
    "duration": "4hr",
    "category": "music",
    "tags": "jazz,concert,nightlife",
    "organizer": "Melody Events",
    "contact": "8887776665",
    "email": "jazz@melody.com",
    "ticketcount": 200,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "weekly",
    "user": null
  },
  {
    "id": 7,
    "title": "International Food Fest",
    "description": "Taste cuisines from over 30 countries. Street food, gourmet delicacies, and live cooking demos.",
    "location": { "lat": "19.0760", "lng": "72.8777", "location": "Expo Grounds" },
    "date": "2026-04-10",
    "time": "11:00:00",
    "duration": "10hr",
    "category": "food",
    "tags": "foodie,festival,culture",
    "organizer": "Global Eats",
    "contact": "7776665554",
    "email": "contact@globaleats.org",
    "ticketcount": 1000,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "499.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 8,
    "title": "Art & Canvas Workshop",
    "description": "Unleash your creativity in this guided painting session. No experience required; materials provided.",
    "location": { "lat": "28.6139", "lng": "77.2090", "location": "The Creative Studio" },
    "date": "2026-02-14",
    "time": "15:00:00",
    "duration": "3hr",
    "category": "workshop",
    "tags": "art,painting,hobby",
    "organizer": "Aman Verma",
    "contact": "9988776655",
    "email": "aman@artstudio.com",
    "ticketcount": 25,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "1200.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "monthly",
    "user": null
  },
  {
    "id": 9,
    "title": "Startup Pitch Night",
    "description": "Watch rising entrepreneurs pitch their ideas to a panel of venture capitalists.",
    "location": { "lat": "13.0827", "lng": "80.2707", "location": "Venture Tower" },
    "date": "2026-05-05",
    "time": "18:30:00",
    "duration": "4hr",
    "category": "business",
    "tags": "startup,pitch,networking",
    "organizer": "Seed Capital",
    "contact": "9123456789",
    "email": "hello@seedcap.com",
    "ticketcount": 150,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "250.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 10,
    "title": "Yoga in the Park",
    "description": "A rejuvenating morning session of Hatha yoga and guided meditation to start your weekend right.",
    "location": { "lat": "22.5726", "lng": "88.3639", "location": "Central Green Park" },
    "date": "2026-01-25",
    "time": "06:30:00",
    "duration": "1.5hr",
    "category": "health",
    "tags": "yoga,wellness,fitness",
    "organizer": "Zen Life",
    "contact": "8899001122",
    "email": "zen@life.com",
    "ticketcount": 100,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "weekly",
    "user": null
  },
  {
    "id": 11,
    "title": "Retro Gaming Expo",
    "description": "Play classic arcade games and consoles from the 80s and 90s. Compete in our Pac-Man tournament!",
    "location": { "lat": "17.3850", "lng": "78.4867", "location": "Gamer's Paradise" },
    "date": "2026-07-12",
    "time": "10:00:00",
    "duration": "8hr",
    "category": "gaming",
    "tags": "retro,gaming,fun",
    "organizer": "Level Up Inc",
    "contact": "7766554433",
    "email": "play@levelup.com",
    "ticketcount": 300,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "350.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 12,
    "title": "Marathon 2026",
    "description": "Run for a cause! Choose between 5K, 10K, or the full 42K marathon route through the city scenic spots.",
    "location": { "lat": "19.0760", "lng": "72.8777", "location": "Marine Drive Start" },
    "date": "2026-11-08",
    "time": "05:00:00",
    "duration": "7hr",
    "category": "sports",
    "tags": "running,marathon,charity",
    "organizer": "City Runners",
    "contact": "9000011111",
    "email": "info@cityrunners.com",
    "ticketcount": 5000,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "750.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 13,
    "title": "Wine & Cheese Pairing",
    "description": "An elegant evening of tasting premium wines paired with artisan cheeses.",
    "location": { "lat": "18.5204", "lng": "73.8567", "location": "The Vineyard Lounge" },
    "date": "2026-09-19",
    "time": "20:00:00",
    "duration": "3hr",
    "category": "lifestyle",
    "tags": "wine,cheese,luxury",
    "organizer": "Savor Moments",
    "contact": "8123456780",
    "email": "savor@lifestyle.com",
    "ticketcount": 40,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "2500.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 14,
    "title": "Photography Masterclass",
    "description": "Learn lighting and composition techniques from professional wildlife photographer Rahul Singh.",
    "location": { "lat": "26.9124", "lng": "75.7873", "location": "City Cultural Center" },
    "date": "2026-03-22",
    "time": "10:30:00",
    "duration": "5hr",
    "category": "workshop",
    "tags": "photography,learning,skills",
    "organizer": "Rahul Singh",
    "contact": "9898989898",
    "email": "rahul@photo.com",
    "ticketcount": 50,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "1800.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 15,
    "title": "Rock Fest 2026",
    "description": "High energy rock performances featuring local bands and a headlining tribute to Queen.",
    "location": { "lat": "15.3173", "lng": "75.7139", "location": "Stadium Grounds" },
    "date": "2026-08-30",
    "time": "18:00:00",
    "duration": "6hr",
    "category": "music",
    "tags": "rock,concert,live",
    "organizer": "Rockstar Events",
    "contact": "7766112233",
    "email": "admin@rockstar.com",
    "ticketcount": 2000,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "899.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 16,
    "title": "Kids Adventure Carnival",
    "description": "A day of magic shows, bouncy castles, face painting, and educational games for children.",
    "location": { "lat": "17.5555", "lng": "45.6666", "location": "Halyal Road Mall" },
    "date": "2026-11-14",
    "time": "10:00:00",
    "duration": "8hr",
    "category": "family",
    "tags": "kids,fun,carnival",
    "organizer": "Joy Makers",
    "contact": "8901234567",
    "email": "joy@kids.com",
    "ticketcount": 400,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "150.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 17,
    "title": "Tech & Coffee Morning",
    "description": "Casual networking for developers and designers over the best coffee in town.",
    "location": { "lat": "12.9716", "lng": "77.5946", "location": "Bean There Cafe" },
    "date": "2026-01-15",
    "time": "08:00:00",
    "duration": "2hr",
    "category": "networking",
    "tags": "tech,coffee,devs",
    "organizer": "Code & Brew",
    "contact": "9911223344",
    "email": "hello@codebrew.com",
    "ticketcount": 30,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "daily",
    "user": null
  },
  {
    "id": 18,
    "title": "Stargazing Expedition",
    "description": "Travel to the city outskirts for a night of astronomy and telescopic views of Saturn's rings.",
    "location": { "lat": "18.9220", "lng": "73.2350", "location": "Lonavala Heights" },
    "date": "2026-03-20",
    "time": "22:00:00",
    "duration": "5hr",
    "category": "educational",
    "tags": "stars,astronomy,nature",
    "organizer": "Star Gaze Club",
    "contact": "9090909090",
    "email": "sky@stargaze.com",
    "ticketcount": 60,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "550.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 19,
    "title": "Cybersecurity Webinar",
    "description": "Protect your digital identity. Join this online session on the latest security threats.",
    "location": { "lat": "0.0000", "lng": "0.0000", "location": "Online / Zoom" },
    "date": "2026-04-01",
    "time": "19:00:00",
    "duration": "2hr",
    "category": "webinar",
    "tags": "cyber,security,online",
    "organizer": "SecureNet",
    "contact": "7788990011",
    "email": "webinar@securenet.com",
    "ticketcount": 1000,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "https://zoom.us/register",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 20,
    "title": "Comedy Open Mic",
    "description": "A night of laughter featuring budding comedians and a special secret headliner.",
    "location": { "lat": "19.0760", "lng": "72.8777", "location": "The Laugh Club" },
    "date": "2026-02-28",
    "time": "20:30:00",
    "duration": "3hr",
    "category": "entertainment",
    "tags": "comedy,standup,fun",
    "organizer": "Joke Master",
    "contact": "9812345678",
    "email": "jokes@club.com",
    "ticketcount": 120,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "199.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "weekly",
    "user": null
  },
  {
    "id": 21,
    "title": "E-Sports Championship",
    "description": "Witness the ultimate showdown in competitive FPS and MOBA games. Prize pool: $50,000.",
    "location": { "lat": "12.9716", "lng": "77.5946", "location": "Digital Arena" },
    "date": "2026-10-10",
    "time": "10:00:00",
    "duration": "12hr",
    "category": "gaming",
    "tags": "esports,tournament,pro",
    "organizer": "Pro League",
    "contact": "7700112233",
    "email": "contact@proleague.com",
    "ticketcount": 800,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "999.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 22,
    "title": "Mindfulness Retreat",
    "description": "A weekend getaway to find inner peace through meditation and silent walks.",
    "location": { "lat": "31.2089", "lng": "77.1734", "location": "Himalayan Sanctuary" },
    "date": "2026-05-12",
    "time": "08:00:00",
    "duration": "48hr",
    "category": "wellness",
    "tags": "meditation,peace,retreat",
    "organizer": "Soul Care",
    "contact": "8811223344",
    "email": "relax@soulcare.com",
    "ticketcount": 20,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "5000.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 23,
    "title": "Book Launch: 2050 Vision",
    "description": "Author Sarah Jenkins discusses her latest sci-fi novel and the future of humanity.",
    "location": { "lat": "28.6139", "lng": "77.2090", "location": "City Library" },
    "date": "2026-08-05",
    "time": "17:00:00",
    "duration": "2hr",
    "category": "literature",
    "tags": "books,author,scifi",
    "organizer": "Metro Reads",
    "contact": "9900990099",
    "email": "sarah@books.com",
    "ticketcount": 100,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 24,
    "title": "Pet Adoption Day",
    "description": "Find your new best friend! Meet adorable dogs and cats looking for their forever homes.",
    "location": { "lat": "13.0827", "lng": "80.2707", "location": "Shelter Grounds" },
    "date": "2026-09-01",
    "time": "11:00:00",
    "duration": "6hr",
    "category": "community",
    "tags": "pets,adoption,charity",
    "organizer": "Happy Tails",
    "contact": "8877665544",
    "email": "adopt@happytails.org",
    "ticketcount": 500,
    "is_active": true,
    "ticketoptions": [],
    "isFree": true,
    "ticketPrice": "0.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "monthly",
    "user": null
  },
  {
    "id": 25,
    "title": "Modern Architecture Tour",
    "description": "A walking tour of the city most innovative and sustainable buildings.",
    "location": { "lat": "19.0760", "lng": "72.8777", "location": "Metro Plaza" },
    "date": "2026-06-15",
    "time": "16:00:00",
    "duration": "3hr",
    "category": "tours",
    "tags": "architecture,design,walking",
    "organizer": "Urban Guides",
    "contact": "9123450987",
    "email": "tours@urban.com",
    "ticketcount": 15,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "600.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "weekly",
    "user": null
  },
  {
    "id": 26,
    "title": "DIY Gardening Workshop",
    "description": "Learn how to start your own organic balcony garden from scratch.",
    "location": { "lat": "12.9716", "lng": "77.5946", "location": "The Green Leaf Nursery" },
    "date": "2026-04-22",
    "time": "09:30:00",
    "duration": "4hr",
    "category": "hobbies",
    "tags": "garden,green,diy",
    "organizer": "Eco Living",
    "contact": "8800112233",
    "email": "info@ecoliving.com",
    "ticketcount": 40,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "300.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  },
  {
    "id": 27,
    "title": "Film Maker's Gala",
    "description": "Screening of award-winning indie short films followed by a Q&A with the directors.",
    "location": { "lat": "19.0760", "lng": "72.8777", "location": "Cinema Hall A" },
    "date": "2026-12-05",
    "time": "18:00:00",
    "duration": "5hr",
    "category": "film",
    "tags": "cinema,filmmaking,indie",
    "organizer": "Screen Arts",
    "contact": "9998887770",
    "email": "gala@screenarts.com",
    "ticketcount": 250,
    "is_active": true,
    "ticketoptions": [],
    "isFree": false,
    "ticketPrice": "450.00",
    "imageUrl": "https://res.cloudinary.com/dvwggnqnw/image/upload/v1749563401/event_Banner_1_1_kojcox.png",
    "registrationUrl": "",
    "recurrence": "none",
    "user": null
  }
]
this.categories = this.getUniqueCategories(this.events)
this.applyFilter('All');
        console.log(this.events)
        this.isLoading = false
      }, error => {
        this.isLoading = false
      })
  }

  getUniqueCategories(events: any[]): string[] {
  // Extract categories, filter out nulls/undefined, and remove duplicates
  return [...new Set(events.map(event => event.category))].sort();
}

applyFilter(filterType: string) {
    this.currentFilter = filterType;

    if (filterType === 'All') {
      this.filteredEvents = this.events;
    } 
    else if (filterType === 'Upcoming') {
      const today = new Date();
      const tenDaysFromNow = new Date();
      tenDaysFromNow.setDate(today.getDate() + 10);

      this.filteredEvents = this.events.filter((event:any) => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= tenDaysFromNow;
      });
    } 
    else {
      // Filter by specific category
      this.filteredEvents = this.events.filter((e:any) => e.category === filterType);
    }
  }

  openHelp(){
    this.navCtrl.navigateForward('/layout/support')
  }

  openBookings(){
    this.navCtrl.navigateForward('/layout/example/history')
  }

  createOrder(){
    let params = {
      "token": "",
      "service_name": "",
    "category": "",
    "service_image": "",
    "provider_id": "",
    "provider_name": "",
    "address": null,
    "status": null,
    "price": null,
    "payment": null
    }
    this.eventsService.createOrder(params).subscribe((res)=>{

    })
  }

  openEventDetails(details:any){
    this.isModalOpen = true
    this.eventDetails = details
    console.log(details.title)
  }

  back(){
this.navCtrl.navigateBack('/layout/example/home')
  }

  bookNow(item:any){
    this.isModalOpen = false
    const order = {
    data: item,
    value: 'event'
  };
    setTimeout(()=>{
      this.navCtrl.navigateForward('/layout/order-details', {
    state: { order }
  });
    })
  }


async openItemModal(item: any) {
  // 1. Lock scroll
  document.body.classList.add('modal-open');

  const modal = await this.modalCtrl.create({
    component: EventDialogComponent,
    componentProps: { item },
    backdropDismiss: true,
    cssClass: 'bottom-sheet-modal',
    // Adding breakpoints even at 1 allows Ionic to use the "Sheet" engine 
    // which is better at blocking background touch events
    initialBreakpoint: 1,
    breakpoints: [0, 1]
  });

  modal.onDidDismiss().then((res) => {
    // 2. Unlock scroll
    document.body.classList.remove('modal-open');
    
    if (res.data?.dismissed) {
      console.log('Modal returned:', res.data.data);
    }
  });

  await modal.present();
}
  
  }

