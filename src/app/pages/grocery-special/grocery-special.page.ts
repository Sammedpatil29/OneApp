import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-grocery-special',
  templateUrl: './grocery-special.page.html',
  styleUrls: ['./grocery-special.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GrocerySpecialPage implements OnInit {

  categoryRoute:any;

  constructor(private router: ActivatedRoute) {
    this.categoryRoute = this.router.snapshot.paramMap.get('route');
    console.log()
   }

  ngOnInit() {
  }

}
