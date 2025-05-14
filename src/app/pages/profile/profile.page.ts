import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonLabel, IonItem, IonIcon, IonButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonButtons, IonButton, IonIcon, IonItem, IonLabel, IonAvatar, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {


  constructor(private router: Router, private navCtrl: NavController) { 
          

  }

  ngOnInit() {
  }

  logOut(){
    this.router.navigate(['/'])
  }

  goBack() {
    this.navCtrl.back();
  }

  openDetails(option: any) {
  this.router.navigate(['/layout/about'], {
    state: { data: option }
  });
}

}
