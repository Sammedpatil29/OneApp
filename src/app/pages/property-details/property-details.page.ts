import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  IonContent,
  IonIcon,
  IonModal
} from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  shareSocialOutline,
  heartOutline,
  heart,
  location,
  checkmarkCircle,
  callOutline,
  logoWhatsapp,
  bedOutline,
  waterOutline,
  carOutline,
  compassOutline,
  expandOutline,
  sparkles,
  shieldCheckmarkOutline,
  navigateOutline,
  businessOutline,
  calendarOutline,
  shieldOutline,
  cameraOutline,
  chatbubbleEllipsesOutline,
  chevronBackOutline,
  chevronForwardOutline,
  openOutline,
  documentTextOutline,
  alertCircleOutline,
  timeOutline,
  chevronDownOutline,
  chevronUpOutline,
  leafOutline,
  lockClosedOutline,
  videocamOutline,
  playCircle,
  closeOutline,
  play,
  pause
} from 'ionicons/icons';
import { PropertyItem, PropertyDocumentCheck, DUMMY_PROPERTIES } from 'src/app/models/property.model';
import { PropertyService } from 'src/app/services/property.service';
import { PropertyFooterComponent } from 'src/app/components/property-footer/property-footer.component';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.page.html',
  styleUrls: ['./property-details.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonModal,
    CommonModule,
    FormsModule,
    PropertyFooterComponent
  ]
})
export class PropertyDetailsPage implements OnInit {
  property: PropertyItem | null = null;
  activeImageIndex: number = 0;
  isFavorite: boolean = false;
  isDocsExpanded: boolean = false;
  isVideoModalOpen: boolean = false;
  isVideoReel: boolean = false;
  isPlaying: boolean = true;
  showPlayPauseIndicator: boolean = false;
  private playPauseIndicatorTimeout: any = null;
  embedVideoUrl: SafeResourceUrl | null = null;

  // Swipe gesture tracking
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private touchStartY: number = 0;
  private touchEndY: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private propertyService: PropertyService,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({arrowBackOutline,shareSocialOutline,chevronBackOutline,chevronForwardOutline,cameraOutline,checkmarkCircle,location,openOutline,leafOutline,bedOutline,waterOutline,expandOutline,compassOutline,businessOutline,carOutline,calendarOutline,shieldCheckmarkOutline,alertCircleOutline,callOutline,logoWhatsapp,heartOutline,heart,sparkles,navigateOutline,shieldOutline,chatbubbleEllipsesOutline,documentTextOutline,timeOutline,chevronDownOutline,chevronUpOutline,lockClosedOutline,videocamOutline,playCircle,closeOutline,play,pause});
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const propId = params.get('id');
      if (propId) {
        this.loadProperty(propId);
      }
    });
  }

  private loadProperty(id: string) {
    this.propertyService.getPropertyById(id).subscribe({
      next: (found) => {
        if (found) {
          this.property = found;
          this.isFavorite = !!found.isFavorite;
        } else {
          this.property = DUMMY_PROPERTIES[0];
          this.isFavorite = !!this.property.isFavorite;
        }
      },
      error: () => {
        const found = DUMMY_PROPERTIES.find((p) => p.id === id);
        this.property = found || DUMMY_PROPERTIES[0];
        this.isFavorite = !!this.property.isFavorite;
      }
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/layout/property');
  }

  setImageIndex(idx: number) {
    this.activeImageIndex = idx;
  }

  // Swipe event handlers
  onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length > 0) {
      this.touchEndX = event.changedTouches[0].clientX;
      this.touchEndY = event.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }
  }

  private handleSwipeGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    // Trigger only if horizontal swipe dominates and exceeds 35px threshold
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next image
        this.nextImage();
      } else {
        // Swiped Right -> Prev image
        this.prevImage();
      }
    }
  }

  nextImage() {
    if (!this.property || this.property.images.length <= 1) return;
    this.activeImageIndex = (this.activeImageIndex + 1) % this.property.images.length;
  }

  prevImage() {
    if (!this.property || this.property.images.length <= 1) return;
    this.activeImageIndex =
      (this.activeImageIndex - 1 + this.property.images.length) % this.property.images.length;
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    if (this.property) {
      this.property.isFavorite = this.isFavorite;
    }
  }

  async shareProperty() {
    if (!this.property) return;
    try {
      await Share.share({
        title: this.property.title,
        text: `Check out this property on Pintu: ${this.property.title} in ${this.property.locality} for ${this.property.priceDisplay}!\n\nDownload Pintu: https://tinyurl.com/5d4mrdpn`,
        url: 'https://tinyurl.com/5d4mrdpn',
        dialogTitle: 'Share Property'
      });
    } catch {
      this.openWhatsApp();
    }
  }

  callSeller() {
    if (!this.property || this.property.status === 'sold') return;
    window.open(`tel:${this.property.seller.phone.replace(/[^0-9+]/g, '')}`, '_system');
  }

  openWhatsApp() {
    if (!this.property || this.property.status === 'sold') return;
    const text = encodeURIComponent(
      `Hello ${this.property.seller.name}, I am interested in your property on Pintu:\n"${this.property.title}" (${this.property.priceDisplay})\nLocality: ${this.property.locality}.\nPlease share more details and arrange a site visit.`
    );
    window.open(`https://wa.me/${this.property.seller.whatsapp}?text=${text}`, '_system');
  }

  openMapLocation() {
    if (!this.property) return;
    // Open Google Maps outside the app as requested (using exact GPS coords if available)
    const query = (this.property.coordinates?.lat && this.property.coordinates?.lng)
      ? `${this.property.coordinates.lat},${this.property.coordinates.lng}`
      : encodeURIComponent(`${this.property.title}, ${this.property.locality}, ${this.property.city}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(mapsUrl, '_system');
  }

  openVideoModal() {
    const targetUrl = this.property?.videoUrl || this.property?.youtubeUrl;
    if (!targetUrl) return;

    this.isPlaying = true;
    this.showPlayPauseIndicator = false;

    const rawUrl = targetUrl.toLowerCase();
    // Detect vertical format if link contains shorts, reel, vertical, or 9:16
    this.isVideoReel =
      rawUrl.includes('/shorts/') ||
      rawUrl.includes('shorts') ||
      rawUrl.includes('/reel/') ||
      rawUrl.includes('/reels/') ||
      rawUrl.includes('tiktok.com') ||
      rawUrl.includes('vertical') ||
      rawUrl.includes('9:16') ||
      rawUrl.includes('9-16');

    const videoId = this.extractYouTubeId(targetUrl);
    if (videoId) {
      // controls=0: removes YouTube bottom controls bar
      // modestbranding=1, iv_load_policy=3, fs=0, disablekb=1: cleans up overlays
      // enablejsapi=1: enables screen tap to play/pause
      const embed = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1`;
      this.embedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
    } else {
      this.embedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
    }
    this.isVideoModalOpen = true;
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.showPlayPauseIndicator = true;
    if (this.playPauseIndicatorTimeout) {
      clearTimeout(this.playPauseIndicatorTimeout);
    }
    this.playPauseIndicatorTimeout = setTimeout(() => {
      this.showPlayPauseIndicator = false;
    }, 600);

    const iframe = document.querySelector('.property-video-modal iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const action = this.isPlaying ? 'playVideo' : 'pauseVideo';
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: action, args: [] }), '*');
    }
  }

  toggleVideoAspect() {
    this.isVideoReel = !this.isVideoReel;
  }

  closeVideoModal() {
    this.isVideoModalOpen = false;
    this.embedVideoUrl = null;
    this.showPlayPauseIndicator = false;
    if (this.playPauseIndicatorTimeout) {
      clearTimeout(this.playPauseIndicatorTimeout);
      this.playPauseIndicatorTimeout = null;
    }
  }

  private extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const cleanUrl = url.trim();
    // Regular expression matching standard, embed, short, and shorts YouTube links
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = cleanUrl.match(regExp);
    if (match && match[1]) {
      return match[1];
    }
    // If user entered only 11 characters ID directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    return null;
  }

  get propertyLegalChecks(): PropertyDocumentCheck[] {
    if (this.property?.legalChecks && this.property.legalChecks.length > 0) {
      return this.property.legalChecks;
    }

    if (this.property?.category === 'rent_house') {
      return [
        {
          title: 'Registered Rental Agreement',
          category: 'Rental Agreement',
          status: 'clear',
          statusLabel: 'Draft Ready',
          details: 'Standard 11-month bilingual rental agreement ready for execution.'
        },
        {
          title: 'Owner ID & Tenancy NOC',
          category: 'Ownership Verification',
          status: 'clear',
          statusLabel: 'Verified',
          details: 'Verified owner identity card, electricity bill, and tenancy permission.'
        },
        {
          title: 'Police Tenant Verification Form',
          category: 'Safety & Verification',
          status: 'clear',
          statusLabel: 'Available',
          details: 'Assistance with local police verification form and record keeping.'
        }
      ];
    }

    const isUnderConstruction = this.property?.possessionStatus === 'Under Construction' || this.property?.possessionStatus === 'Under Development';
    const isLandOrPlot = this.property?.category === 'buy_land' || this.property?.category === 'buy_plot';

    return [
      {
        title: 'Title Deed & Ownership Proof',
        category: 'Ownership Verification',
        status: 'clear',
        statusLabel: 'Clear Title',
        details: 'Registered Sale Deed with unbroken chain of title records.'
      },
      {
        title: isLandOrPlot ? '7/12 RTC & Mutation Extract' : 'Khata Certificate & Extract',
        category: 'Revenue & Land Records',
        status: 'clear',
        statusLabel: isLandOrPlot ? 'Clear RTC' : 'A-Khata Verified',
        details: isLandOrPlot
          ? 'Clear RTC in seller name with updated mutation register copy.'
          : 'Town Municipal Council (TMC) A-Khata with updated tax assessment.'
      },
      {
        title: 'Encumbrance Certificate (EC)',
        category: 'Encumbrance Verification',
        status: 'clear',
        statusLabel: 'Clear (15 Years)',
        details: '15-Year Nil Encumbrance Certificate verified free of any bank/legal dues.'
      },
      {
        title: isLandOrPlot ? 'DC Conversion (NA Order)' : 'Sanctioned Building Plan',
        category: 'Government Approvals',
        status: 'clear',
        statusLabel: 'Approved',
        details: isLandOrPlot
          ? 'Deputy Commissioner (DC) approved Non-Agricultural residential order.'
          : 'TMC & Town Planning authority approved residential layout plan.'
      },
      {
        title: 'Property Tax Receipts',
        category: 'Tax Compliance',
        status: 'clear',
        statusLabel: 'Paid (2025-26)',
        details: 'All municipal property taxes paid up to current financial year.'
      },
      {
        title: isLandOrPlot ? 'Boundary Survey & Sketch' : 'Occupancy Certificate (OC)',
        category: 'Possession & Compliance',
        status: isUnderConstruction ? 'pending' : 'clear',
        statusLabel: isUnderConstruction ? 'Under Process' : (isLandOrPlot ? 'Demarcated' : 'OC Issued'),
        details: isUnderConstruction
          ? 'Occupancy Certificate applied with TMC, site inspection in progress.'
          : (isLandOrPlot ? 'ADLR digital survey sketch & stone demarcation verified.' : 'TMC issued Occupancy Certificate verified.')
      },
      {
        title: 'Bank Loan Eligibility',
        category: 'Finance Clearance',
        status: 'clear',
        statusLabel: 'Pre-Approved',
        details: 'Pre-approved for fast home/plot loans by SBI, HDFC & Canara Bank.'
      }
    ];
  }

  get clearChecksCount(): number {
    return this.propertyLegalChecks.filter((c) => c.status === 'clear').length;
  }

  get displayedLegalChecks(): PropertyDocumentCheck[] {
    return this.isDocsExpanded
      ? this.propertyLegalChecks
      : this.propertyLegalChecks.slice(0, 3);
  }

  toggleDocsExpanded() {
    this.isDocsExpanded = !this.isDocsExpanded;
  }

  async bookCallback() {
    if (!this.property || this.property.status === 'sold') return;
    const toast = await this.toastController.create({
      message: `Callback requested! ${this.property.seller.name} will call you back shortly.`,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }
}
