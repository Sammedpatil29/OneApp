import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { App } from '@capacitor/app'
import { information } from 'ionicons/icons';

@Component({
  selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButton, IonContent, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class PreloginPage implements OnInit {
info: any;

  constructor(private router: Router) { }

  ngOnInit() {
    const info = App.getInfo()
    console.log(info)
  }

  Login(){
    this.router.navigate(['/navbar']);
  }

}
