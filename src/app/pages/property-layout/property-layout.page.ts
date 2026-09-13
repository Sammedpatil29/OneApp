import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-property-layout',
  templateUrl: './property-layout.page.html',
  styleUrls: ['./property-layout.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, CommonModule]
})
export class PropertyLayoutPage {
  constructor() {}
}
