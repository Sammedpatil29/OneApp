import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pharmacy-footer',
  templateUrl: './pharmacy-footer.component.html',
  styleUrls: ['./pharmacy-footer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PharmacyFooterComponent {
  /** Top label (e.g. 'Managed By', 'Fulfilled By', 'Accredited Lab Partner') */
  @Input() label: string = 'Managed By';

  /** Company / Partner name */
  @Input() companyName: string = 'MedPlus Pharmacy & Wellness';

  /** Subtitle / accreditation */
  @Input() subtitle: string = 'Licensed Chemist & Druggist • 100% Genuine Medicines';

  /** Address line */
  @Input() address: string = 'Main Road, Opp. Bus Stand, Athani - 591304';

  /** License / Registration info */
  @Input() licenseInfo: string = 'DL No: KA-BEL-2024-0987 • GSTIN: 29XXXXX0000X1ZX • Call: 8884950068';

  /** Logo image path */
  @Input() logoUrl: string = 'assets/favicon_io/apple-touch-icon.png';

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/favicon_io/favicon-32x32.png';
    }
  }
}

