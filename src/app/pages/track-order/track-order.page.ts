import { Component, OnInit, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonToast, IonSpinner } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import { heart,location, arrowBack, shareOutline, locationOutline, share } from 'ionicons/icons';
import { AdmobService } from 'src/app/services/admob.service';
@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonToast, IonCard, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TrackOrderPage implements OnInit {
  routeSource = ''
orderDetails: any;
moreDetails: any;
eventDetails: any;
isToastOpen: boolean = false
toastMessage = ''
qrData: string = '';
isSharing: boolean = false
isDownloading: boolean = false
qrUrl: string = "https://quickchart.io/qr?text=https://ionicframwork.com/&size=150"

  constructor(private navCtrl: NavController, private router: Router, private admobService: AdmobService) { 
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras?.state) {
    const data = navigation.extras.state['orderDetails'];
    this.routeSource = navigation.extras.state['from']
    this.orderDetails = data
    this.moreDetails = JSON.parse(this.orderDetails.details)
    this.eventDetails = this.moreDetails.eventDetails.data
    this.qrData = this.moreDetails.orderId
    this.qrUrl = `https://quickchart.io/qr?text=${this.qrData}/&size=150`
    console.log(this.moreDetails)
    console.log('Received Data:', data);
    // Use data as needed
  }

  addIcons({arrowBack,shareOutline,locationOutline,heart,share, location});
  }

  ngOnInit() {
    this.admobService.displayBannerAd('ca-app-pub-3940256099942544/6300978111');
  }

  openInGoogleMaps() {
  const url = `https://www.google.com/maps?q=${this.eventDetails.location.lat},${this.eventDetails.location.lng}`;
  window.open(url, '_blank');
}

async captureTicket(): Promise<string | null> {
  this.isSharing = true
  const element = document.getElementById('ticket-card');
  if (!element) return null;

  // Wait for all images to be loaded before capturing the element
  const images = element.getElementsByTagName('img');
  const imagePromises = Array.from(images).map(img => {
    return new Promise<void>((resolve, reject) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image loading failed'));
      }
    });
  });

  // Wait for all images to load
  await Promise.all(imagePromises);

  // Now, capture the content using html2canvas
  const canvas = await html2canvas(element, {
    useCORS: true,  // Enable CORS if images are from external sources
    logging: true,  // Enable logging for debugging purposes
  });
  const base64 = canvas.toDataURL('image/png').split(',')[1]; // Get base64 without header
  return base64;
}

async downloadTicket() {
  this.isSharing = true
  const base64 = await this.captureTicket();
  if (!base64) return;

  const fileName = `ticket_${new Date().getTime()}.png`;

  // Add the base64 header back to the data when saving
  const base64WithHeader = `data:image/png;base64,${base64}`;

  // Save the image using Filesystem API
  await Filesystem.writeFile({
    path: fileName,
    data: base64WithHeader,  // Save with header
    directory: Directory.Documents
  });
  this.isSharing = false

  this.isToastOpen = true;
  this.toastMessage = "Ticket Saved in Internal Storage";

  // Optionally open the saved image file (on mobile device)
  // You might need to use a file opener plugin to view the image on a mobile device
  // If you're working on a web app, you can open it in a new tab or show a download link.

  setTimeout(() => {
    this.isToastOpen = false;
  }, 3000);
}

async shareTicket() {
  this.isSharing = true
  const base64 = await this.captureTicket();
  if (!base64) return;

  const fileName = `ticket_${new Date().getTime()}.png`;

  const saved = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache
  });

  const uri = saved.uri;

  await Share.share({
    title: 'My Event Ticket',
    text: 'Check out my event ticket!',
    url: uri,
    dialogTitle: 'Share your ticket'
  });
  this.isSharing = false 
}


  goBack(){
    if(this.routeSource == 'order-details'){
        this.navCtrl.navigateBack('/layout/example/home')
    } else {
        this.navCtrl.back()
    }
  }

}
