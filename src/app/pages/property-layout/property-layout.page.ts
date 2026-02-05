import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-property-layout',
  templateUrl: './property-layout.page.html',
  styleUrls: ['./property-layout.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonApp, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class PropertyLayoutPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
