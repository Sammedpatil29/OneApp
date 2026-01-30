import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ErrorComponent {

  @Input() title: string = 'Something went wrong';
  @Input() subtitle: string = 'We couldn\'t fetch the data. Please try again.';
  @Input() buttonText: string = 'Retry';
  
  // Event sent to parent when button is clicked
  @Output() reload = new EventEmitter<void>();

  constructor() {
    addIcons({ refreshOutline, alertCircleOutline });
  }

  onRetry() {
    this.reload.emit();
  }
}