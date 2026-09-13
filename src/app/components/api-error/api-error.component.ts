import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, refreshOutline, warningOutline } from 'ionicons/icons';

@Component({
  selector: 'app-api-error',
  templateUrl: './api-error.component.html',
  styleUrls: ['./api-error.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class ApiErrorComponent {
  @Input() title: string = 'Unable to Load Data';
  @Input() description: string = 'We encountered an error while communicating with the server. Please try again.';
  @Input() retryText: string = 'Try Again';
  @Output() retry = new EventEmitter<void>();

  isRetrying: boolean = false;

  constructor() {
    addIcons({ alertCircleOutline, refreshOutline, warningOutline });
  }

  onRetry() {
    this.isRetrying = true;
    this.retry.emit();
    setTimeout(() => {
      this.isRetrying = false;
    }, 1200);
  }
}

