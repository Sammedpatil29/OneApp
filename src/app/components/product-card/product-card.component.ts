import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductCardComponent {

  @Input() product: any; // The product object
  @Input() qty: number = 0; // The live quantity from the parent

  // Events to send back to the parent page
  @Output() itemClicked = new EventEmitter<any>();
  @Output() increase = new EventEmitter<any>();
  @Output() decrease = new EventEmitter<any>();

  constructor() {
    addIcons({ timeOutline });
  }

  onCardClick() {
    this.itemClicked.emit(this.product);
  }

  onIncrease(event: Event) {
    event.stopPropagation();
    this.increase.emit(this.product.id);
  }

  onDecrease(event: Event) {
    event.stopPropagation();
    this.decrease.emit(this.product.id);
  }
}