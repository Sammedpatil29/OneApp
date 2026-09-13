import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  alertCircleOutline,
  warningOutline,
  informationCircleOutline,
  helpCircleOutline,
} from 'ionicons/icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.component.html',
  styleUrls: ['./alert-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class AlertModalComponent {
  @Input() isOpen: boolean = false;
  @Input() type: AlertType = 'info';
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'OK';
  @Input() cancelText: string = 'Cancel';
  @Input() showCancel: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      alertCircleOutline,
      warningOutline,
      informationCircleOutline,
      helpCircleOutline,
    });
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onBackdropClick() {
    if (this.showCancel) {
      this.onCancel();
    }
  }
}

