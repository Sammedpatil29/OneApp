import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar, IonSearchbar, IonAvatar } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, home, cube, bag, receiptOutline, person, personCircle, personCircleOutline, constructOutline, briefcaseOutline, buildOutline } from 'ionicons/icons';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/angular/standalone';
import { FooterComponent } from "../../components/footer/footer.component";
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonAvatar,  IonContent, CommonModule, FormsModule, IonContent, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, FooterComponent, IonTitle, IonToolbar, IonHeader]
})
export class HomePage implements OnInit {

  constructor(private router: Router) {
    addIcons({home,buildOutline,receiptOutline,personCircleOutline,briefcaseOutline,constructOutline,library,personCircle,person,search,bag,cube,radio,playCircle});
  }

  ngOnInit() {
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

}
