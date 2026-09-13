import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { fileTrayOutline, searchOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-nodata',
  templateUrl: './nodata.component.html',
  styleUrls: ['./nodata.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NodataComponent {
  @Input() icon: string = 'file-tray-outline';
  @Input() title: string = 'No Data Found';
  @Input() description: string = 'There is nothing to display here yet.';
  @Input() actionText: string = '';

  @Output() action = new EventEmitter<void>();

  constructor() {
    addIcons({ fileTrayOutline, searchOutline, alertCircleOutline });
  }

  onAction() {
    this.action.emit();
  }
}
