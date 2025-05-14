import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonRouterOutlet, IonText, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonRouterOutlet, IonApp, CommonModule, FormsModule]
})
export class LayoutPage implements OnInit {
  isDragging = false;
  offsetX = 0;
  offsetY = 0;

  ngOnInit() {
    const orderBubble = document.querySelector('.orderBubble') as HTMLElement;

    // Set the initial position (you can dynamically adjust this)
    orderBubble.style.left = '20px';  // Set initial left position
    orderBubble.style.top = '150px';
  }

  constructor() { }
  startDrag(event: MouseEvent | TouchEvent, element: HTMLElement) {
    // Check if the event is touch or mouse and get the appropriate coordinates
    if (event instanceof MouseEvent) {
      this.offsetX = event.clientX - element.getBoundingClientRect().left;
      this.offsetY = event.clientY - element.getBoundingClientRect().top;
    } else if (event instanceof TouchEvent) {
      this.offsetX = event.touches[0].clientX - element.getBoundingClientRect().left;
      this.offsetY = event.touches[0].clientY - element.getBoundingClientRect().top;
    }

    this.isDragging = true;

    // Bind mousemove and mouseup events to window
    window.addEventListener('mousemove', this.dragMove);
    window.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('touchmove', this.dragMove);
    window.addEventListener('touchend', this.stopDrag);
  }

  dragMove = (event: MouseEvent | TouchEvent) => {
    if (this.isDragging) {
      const element = document.querySelector('.orderBubble') as HTMLElement;

      if (event instanceof MouseEvent) {
        element.style.left = event.clientX - this.offsetX + 'px';
        element.style.top = event.clientY - this.offsetY + 'px';
      } else if (event instanceof TouchEvent) {
        element.style.left = event.touches[0].clientX - this.offsetX + 'px';
        element.style.top = event.touches[0].clientY - this.offsetY + 'px';
      }
    }
  };

  stopDrag = () => {
    this.isDragging = false;
    window.removeEventListener('mousemove', this.dragMove);
    window.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('touchmove', this.dragMove);
    window.removeEventListener('touchend', this.stopDrag);
  };

  

}
