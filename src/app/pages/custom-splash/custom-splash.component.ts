import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-splash',
  templateUrl: './custom-splash.component.html',
  styleUrls: ['./custom-splash.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CustomSplashComponent {
  constructor() { }
}

