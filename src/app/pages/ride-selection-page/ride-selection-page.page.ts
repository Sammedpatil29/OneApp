import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { RideSelectionComponent } from "src/app/components/ride-selection/ride-selection.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-ride-selection-page',
  templateUrl: './ride-selection-page.page.html',
  styleUrls: ['./ride-selection-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RideSelectionComponent]
})
export class RideSelectionPagePage implements OnInit {
tripData: any;
  constructor(private router: Router) { 
    const nav = this.router.getCurrentNavigation();
    this.tripData = nav?.extras?.state?.['data'] || null;

    console.log('Received trip data:', this.tripData);
  }

  ngOnInit() {
  }

}
