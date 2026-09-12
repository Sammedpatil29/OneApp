import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  IonSpinner,
  IonSkeletonText,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logoWhatsapp,
  callOutline,
  mailOutline,
  chevronForward,
  chevronDown,
  chevronUp,
  paperPlaneOutline,
  chatbubblesOutline,
  addCircleOutline,
  timeOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { SupportService } from 'src/app/services/support.service';
import { AppDialogService } from 'src/app/services/app-dialog.service';

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonSpinner,
    IonSkeletonText,
    IonIcon
  ]
})
export class SupportPage implements OnInit {
  activeTab: 'channels' | 'create' | 'tickets' = 'channels';
  expandedFaqId: number | null = 1;
  tickets: any[] = [];
  isLoadingTickets: boolean = false;
  isSubmitting: boolean = false;

  ticketForm = {
    category: 'Grocery Order Issue',
    title: '',
    description: ''
  };

  faqs: FaqItem[] = [
    {
      id: 1,
      category: 'Delivery Speed',
      question: 'How fast will my grocery order be delivered?',
      answer: 'All grocery and daily essentials orders are packed inside our neighborhood micro-fulfillment centers and delivered to your doorstep within 10 to 15 minutes.'
    },
    {
      id: 2,
      category: 'Rides & Commute',
      question: 'How do ride fares work and are there any surge charges?',
      answer: 'Pintu Daily Rides feature transparent, regulated fares based purely on distance and vehicle type. We do not charge surprise peak surge fees.'
    },
    {
      id: 3,
      category: 'Payments & Refunds',
      question: 'What is the refund timeline for cancelled items?',
      answer: 'Refunds for cancelled orders or damaged items are processed instantly to your Pintu wallet or returned to your original payment method (UPI within 2-4 hours, cards in 2-3 business days).'
    },
    {
      id: 4,
      category: 'Order Modifications',
      question: 'Can I change my delivery address after placing an order?',
      answer: 'If your order has not yet left the store, tap the live WhatsApp support button above and our 24/7 team will immediately update your delivery destination.'
    },
    {
      id: 5,
      category: 'Safety & Verification',
      question: 'Are Pintu delivery and ride partners background-checked?',
      answer: 'Yes, 100% of Pintu drivers and delivery partners are police-verified, government ID-checked, and vehicle fitness-approved before joining our platform.'
    }
  ];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private supportService: SupportService,
    private dialogService: AppDialogService
  ) {
    addIcons({
      logoWhatsapp,
      callOutline,
      mailOutline,
      chevronForward,
      chevronDown,
      chevronUp,
      paperPlaneOutline,
      chatbubblesOutline,
      addCircleOutline,
      timeOutline,
      arrowBackOutline
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  ngOnInit() {
    this.loadTickets();
  }

  openWhatsAppSupport() {
    const text = encodeURIComponent('Hi Pintu Customer Support, I need assistance with my account / order.');
    const whatsappUrl = `https://wa.me/918999335606?text=${text}`;
    window.open(whatsappUrl, '_system');
  }

  toggleFaq(id: number) {
    this.expandedFaqId = this.expandedFaqId === id ? null : id;
  }

  loadTickets() {
    this.isLoadingTickets = true;
    this.supportService.getTickets().subscribe({
      next: (res: any) => {
        this.tickets = res?.data || res || [];
        this.isLoadingTickets = false;
      },
      error: () => {
        this.isLoadingTickets = false;
      }
    });
  }

  submitTicket() {
    if (!this.ticketForm.title.trim() || !this.ticketForm.description.trim()) {
      return;
    }

    this.isSubmitting = true;
    const params = {
      category: this.ticketForm.category,
      title: this.ticketForm.title.trim(),
      description: this.ticketForm.description.trim()
    };

    this.supportService.createTicket(params).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialogService.showAlert(
          'Ticket Submitted',
          'Your support ticket has been received. Our team will resolve it within 1 hour.',
          'success',
          'Great, Thanks'
        );
        this.ticketForm = {
          category: 'Grocery Order Issue',
          title: '',
          description: ''
        };
        this.activeTab = 'tickets';
        this.loadTickets();
      },
      error: () => {
        this.isSubmitting = false;
        this.dialogService.showAlert(
          'Submission Error',
          'Unable to submit your ticket right now. Please message us on WhatsApp for instant assistance.',
          'error',
          'OK'
        );
      }
    });
  }

  isOpenTicket(ticket: any): boolean {
    if (!ticket) return false;
    const s = (ticket.status || '').toString().toLowerCase();
    return s.includes('open') || s.includes('active') || s.includes('pending');
  }
}
