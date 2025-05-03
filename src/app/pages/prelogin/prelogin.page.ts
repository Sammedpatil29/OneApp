import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prelogin',
  templateUrl: './prelogin.page.html',
  styleUrls: ['./prelogin.page.scss'],
  standalone: true,
  imports: [IonButton, IonContent, IonTitle, IonToolbar, IonHeader,  CommonModule, FormsModule]
})
export class PreloginPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  Login(){
    this.router.navigate(['/navbar']);
  }

}
