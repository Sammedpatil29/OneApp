import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-pharmacy-layout',
  templateUrl: './pharmacy-layout.page.html',
  styleUrls: ['./pharmacy-layout.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, CommonModule, FormsModule]
})
export class PharmacyLayoutPage {
  constructor() {}
}

