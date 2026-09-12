import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, flash, shieldCheckmark, lockClosed } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

  constructor() {
    addIcons({
      heart,
      flash,
      shieldCheckmark,
      lockClosed
    });
  }

  ngOnInit() {}
}
