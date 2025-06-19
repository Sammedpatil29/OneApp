import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grocery-item-details',
  templateUrl: './grocery-item-details.page.html',
  styleUrls: ['./grocery-item-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class GroceryItemDetailsPage implements OnInit {
  data: any;
  constructor(private router: Router) {}

  ngOnInit() {
    this.data = this.router.getCurrentNavigation()?.extras.state?.['data'];
    console.log(this.data);
  }
}
