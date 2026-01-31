import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-dineout-layout',
  templateUrl: './dineout-layout.page.html',
  styleUrls: ['./dineout-layout.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonApp, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterOutlet]
})
export class DineoutLayoutPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
