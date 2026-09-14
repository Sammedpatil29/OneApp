import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-footer',
  templateUrl: './property-footer.component.html',
  styleUrls: ['./property-footer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PropertyFooterComponent {
  /**
   * Logo image path in assets.
   * Default fallback uses favicon icon, can be easily updated by developer.
   */
  @Input() logoUrl: string = 'assets/brahmadev.webp';

  /** Company / Partner name */
  @Input() companyName: string = 'Brahmadev Constructions';

  /** Registered GST number */
  @Input() gstNumber: string = 'GSTIN: 29XXXXX0000X1ZX';

  /** Current year for copyright */
  currentYear: number = new Date().getFullYear();

  /**
   * Fallback handler if image asset fails to load
   */
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/favicon_io/apple-touch-icon.png';
    }
  }
}

