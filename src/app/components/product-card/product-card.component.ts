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

  readonly backgroundColors = [
  // --- Warm Off-Whites (Rose, Peach, Cream) ---
  '#FFF5F5', // Very Pale Red
  '#FFF0F5', // Lavender Blush
  '#FFFAFA', // Snow
  '#FFF8E1', // Cosmic Latte
  '#FFF3E0', // Bleached Almond
  '#FFF5E5', // Warm Cream
  '#FFF9F0', // Floral White
  '#FAF0E6', // Linen

  // --- Cool Off-Whites (Ice, Mist, Sky) ---
  '#F0F8FF', // Alice Blue
  '#F5F9FF', // Whisper Blue
  '#E6F7FF', // Pale Sky
  '#F0FFFF', // Azure Mist
  '#E0FFFF', // Light Cyan (Very faint)
  '#F2FDFF', // Ice Water
  '#F5FFFA', // Mint Cream

  // --- Nature Off-Whites (Lime, Mint, Tea) ---
  '#F1F8E9', // Pale Green
  '#F0FFF0', // Honeydew
  '#F5FFF5', // White Smoke Green
  '#F9FBE7', // Lime Tint
  '#FFFFF0', // Ivory

  // --- Elegant Neutrals (Lavender, Grey) ---
  '#F3E5F5', // Pale Lavender
  '#F8F5FF', // Magnolia
  '#FAFAFA', // Alabaster (Very Light Grey)
  '#F5F5F5', // White Smoke
  '#F2F2F2'  // Concrete (Light)
];

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

  getRandomColor() {
    const randomIndex = Math.floor(Math.random() * this.backgroundColors.length);
    return this.backgroundColors[randomIndex];
  }
}