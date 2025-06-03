import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { addIcons } from 'ionicons';
import { heart,location, arrowBack, shareOutline, locationOutline, share } from 'ionicons/icons';


@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.page.html',
  styleUrls: ['./track-order.page.scss'],
  standalone: true,
  imports: [IonCard, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class TrackOrderPage implements OnInit {
orderDetails: any;
moreDetails: any;
eventDetails: any;
  constructor(private navCtrl: NavController, private router: Router) { 
    const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras?.state) {
    const data = navigation.extras.state['orderDetails'];
    this.orderDetails = data
    this.moreDetails = JSON.parse(this.orderDetails.details)
    this.eventDetails = this.moreDetails.eventDetails.data
    console.log(this.moreDetails)
    console.log('Received Data:', data);
    // Use data as needed
  }

  addIcons({arrowBack,shareOutline,locationOutline,heart,share, location});
  }

  ngOnInit() {
  }

  openInGoogleMaps() {
  const url = `https://www.google.com/maps?q=${this.eventDetails.location.latitude},${this.eventDetails.location.longitude}`;
  window.open(url, '_blank');
}

async captureTicket(): Promise<string | null> {
  const element = document.getElementById('ticket-card');
  if (!element) return null;

  const canvas = await html2canvas(element);
  const base64 = canvas.toDataURL('image/png').split(',')[1]; // Get base64 without header
  return base64;
}

async downloadTicket() {
  const base64 = await this.captureTicket();
  if (!base64) return;

  const fileName = `ticket_${new Date().getTime()}.png`;

  await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Documents
  });

  alert('Ticket downloaded to Documents folder.');
}

async shareTicket() {
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
}


  goBack(){
    this.navCtrl.navigateBack('/layout/example/home')
  }

}
