import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  IonSpinner,
  IonToast
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  chevronBack,
  timeOutline,
  personOutline,
  mailOutline,
  mail,
  callOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  createOutline,
  keypadOutline,
  logoWhatsapp,
  giftOutline,
  gift,
  checkmarkCircle
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { ReferralService } from 'src/app/services/referral.service';
import { Router } from '@angular/router';
import { NgOtpInputModule } from 'ng-otp-input';
import { register } from 'swiper/element/bundle';

register();

export interface OnboardingSlide {
  badge: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  chips: string[];
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NgOtpInputModule,
    IonToast,
    IonSpinner,
    IonIcon,
    IonContent,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage implements OnInit, OnDestroy {
  // Step navigation: 'email' -> 'otp' -> 'register'
  step: 'email' | 'otp' | 'register' = 'email';

  // 65% Top Onboarding Showcase Slides
  onboardingSlides: OnboardingSlide[] = [
    {
      badge: '⚡ 10-15 MIN DELIVERY',
      badgeBg: 'rgba(250, 204, 21, 0.2)',
      badgeColor: '#fde047',
      title: 'Everyday Needs,',
      highlight: 'Delivered in Minutes',
      subtitle: 'Groceries, snacks, daily essentials & more delivered to your doorstep at lightning speed.',
      image: 'assets/icons/vecteezy_young-delivery-man-in-a-yellow-uniform-flying-to-deliver-an_55983285.png',
      chips: ['⚡ 10-15 Mins', '🛍️ 5,000+ Products', '🛵 Fast Delivery']
    },
    {
      badge: '🛵 RIDES & COMMUTE',
      badgeBg: 'rgba(168, 85, 247, 0.2)',
      badgeColor: '#d8b4fe',
      title: 'Fast & Affordable',
      highlight: 'Daily Rides & Taxis',
      subtitle: 'Instant bike taxis, autos & verified cabs with fair fares and zero surge shocks.',
      image: 'assets/icons/vecteezy_young-delivery-man-in-a-yellow-uniform-flying-to-deliver-an_55983285.png',
      chips: ['🛵 Bike Taxi', '🛺 Auto', '🚗 Cabs', '🛡️ Safe Rides']
    },
    {
      badge: '🥦 FRESH GROCERIES',
      badgeBg: 'rgba(52, 211, 153, 0.2)',
      badgeColor: '#6ee7b7',
      title: 'Farm Fresh Fruits &',
      highlight: 'Daily Vegetables',
      subtitle: 'Handpicked fresh vegetables and fruits delivered in clean hygienic packaging.',
      image: 'assets/icons/wired-lineal-526-paper-bag-vegetables-hover-pinch.webp',
      chips: ['🌿 100% Farm Fresh', '🏷️ Best Prices', '✨ Handpicked']
    }
  ];

  // Input models
  email: string = '';
  enteredOtp: string = '';
  fullName: string = '';
  phoneNumber: string = '';
  referralCode: string = '';

  // Referral verification state
  referralStatus: 'idle' | 'checking' | 'valid' | 'invalid' = 'idle';
  referralMessage: string = '';
  private referralCheckTimeout: any = null;

  // State flags
  verifyingToken: boolean = false;
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
  isLoading: boolean = false;

  // Countdown timer
  timer: number = 45;
  intervalIdforCount: any = null;

  // Toast feedback
  toastMessage: string = '';
  isToastOpen: boolean = false;
  otpVerificationMessage: string = '';

  otpConfig = {
    length: 6,
    inputStyles: {
      width: '44px',
      height: '50px',
      'font-size': '20px',
      'font-weight': '700',
      margin: '0 4px',
      'border-radius': '12px',
      border: '1.5px solid #cbd5e1',
      background: '#f8fafc',
      'text-align': 'center'
    },
  };

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private referralService: ReferralService,
    private router: Router
  ) {
    addIcons({
      arrowBack,
      chevronBack,
      timeOutline,
      personOutline,
      mailOutline,
      mail,
      callOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      lockClosedOutline,
      shieldCheckmarkOutline,
      createOutline,
      keypadOutline,
      logoWhatsapp,
      giftOutline,
      gift,
      checkmarkCircle
    });
  }

  async ngOnInit() {
    if (this.authService.hasToken()) {
      this.verifyingToken = true;
      this.navCtrl.navigateRoot('/layout/home');
      return;
    }
    this.verifyingToken = false;
  }

  ngOnDestroy() {
    if (this.intervalIdforCount) {
      clearInterval(this.intervalIdforCount);
    }
    if (this.referralCheckTimeout) {
      clearTimeout(this.referralCheckTimeout);
    }
  }

  onReferralCodeChange(val: string) {
    if (this.referralCheckTimeout) {
      clearTimeout(this.referralCheckTimeout);
    }

    const trimmed = (val || '').trim();
    if (!trimmed) {
      this.referralStatus = 'idle';
      this.referralMessage = '';
      return;
    }

    if (trimmed.length < 3) {
      this.referralStatus = 'idle';
      this.referralMessage = '';
      return;
    }

    this.referralStatus = 'checking';
    this.referralCheckTimeout = setTimeout(() => {
      this.validateReferralCode(trimmed);
    }, 450);
  }

  validateReferralCode(code: string) {
    this.referralService.validateReferralCode(code).subscribe({
      next: (res: any) => {
        if (res?.valid) {
          this.referralStatus = 'valid';
          this.referralMessage = res?.message || `Referral code applied from ${res.referrer_name}!`;
        } else {
          this.referralStatus = 'invalid';
          this.referralMessage = res?.message || 'Invalid code. You can continue without it.';
        }
      },
      error: () => {
        this.referralStatus = 'invalid';
        this.referralMessage = 'Could not verify code right now. You can continue without it.';
      }
    });
  }

  private showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
    setTimeout(() => {
      this.isToastOpen = false;
    }, 3000);
  }

  isValidEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  // ─── 1. Send OTP ──────────────────────────────────────────────────────────
  sendVerification() {
    if (!this.isValidEmail()) {
      this.showToast('Please enter a valid email address.');
      return;
    }

    this.isSendingOtp = true;
    this.authService.sendEmailOtp(this.email.trim().toLowerCase()).subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
        if (res?.success) {
          this.step = 'otp';
          this.enteredOtp = '';
          this.startTimer();
          const devHint = res.devOtp ? ` (Dev Code: ${res.devOtp})` : '';
          this.showToast(`Verification code sent to your email!${devHint}`);
        } else {
          this.showToast(res?.message || 'Failed to send verification code.');
        }
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        const msg = err?.error?.message || err?.message || 'Failed to send verification code. Please check your connection.';
        this.showToast(msg);
      }
    });
  }

  // ─── 2. Resend OTP ────────────────────────────────────────────────────────
  resendVerification() {
    if (this.timer > 0 || this.isSendingOtp) return;
    this.sendVerification();
  }

  private startTimer() {
    if (this.intervalIdforCount) {
      clearInterval(this.intervalIdforCount);
    }
    this.timer = 45;
    this.intervalIdforCount = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.intervalIdforCount);
      }
    }, 1000);
  }

  // ─── 3. Verify OTP ────────────────────────────────────────────────────────
  onOtpChange(otp: string) {
    this.enteredOtp = otp;
    if (otp && otp.length === 6) {
      this.verifyOtp();
    }
  }

  verifyOtp() {
    if (!this.enteredOtp || this.enteredOtp.length < 6) {
      this.showToast('Please enter the 6-digit verification code.');
      return;
    }

    this.isVerifyingOtp = true;
    this.otpVerificationMessage = 'Verifying your code...';

    this.authService.verifyEmailOtp(this.email.trim().toLowerCase(), this.enteredOtp).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;
        this.otpVerificationMessage = '';

        if (res?.success) {
          if (res.isNewUser) {
            // New user -> show registration step to capture name & phone
            this.step = 'register';
            this.showToast('Email verified! Please complete your profile.');
          } else if (res.token) {
            // Existing user -> log in immediately
            this.authService.saveSession(res.token, res.user);
            this.showToast('Welcome back!');
            this.navCtrl.navigateRoot('/layout/home');
          }
        } else {
          this.showToast(res?.message || 'Invalid verification code.');
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        this.otpVerificationMessage = '';
        const msg = err?.error?.message || err?.message || 'Verification failed. Please try again.';
        this.showToast(msg);
      }
    });
  }

  // ─── 4. Complete Registration (New User) ──────────────────────────────────
  register() {
    if (!this.fullName.trim()) {
      this.showToast('Please enter your full name.');
      return;
    }

    if (!this.phoneNumber || this.phoneNumber.trim().length < 10) {
      this.showToast('Please enter a valid 10-digit mobile number.');
      return;
    }

    this.isLoading = true;
    const cleanPhone = this.phoneNumber.replace(/\D/g, '').slice(-10);

    const params: any = {
      email: this.email.trim().toLowerCase(),
      username: this.email.trim().toLowerCase(),
      first_name: this.fullName.trim(),
      last_name: '',
      phone: cleanPhone,
      is_active: true,
      is_verified: true
    };

    // Pass referral code if provided and valid (or entered by user)
    const cleanReferral = this.referralCode ? this.referralCode.trim().toUpperCase() : '';
    if (cleanReferral && this.referralStatus !== 'invalid') {
      params.referral_code = cleanReferral;
    }

    this.authService.register(params).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.success && res?.token) {
          this.authService.saveSession(res.token, res.user);
          this.showToast('Profile created successfully! Welcome bonus credited.');
          this.navCtrl.navigateRoot('/layout/home');
        } else {
          this.showToast(res?.message || 'Registration failed. Please try again.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Registration error. Please check your details.';
        this.showToast(msg);
      }
    });
  }

  // ─── 5. Navigation & Support ──────────────────────────────────────────────
  goBack() {
    if (this.step === 'otp') {
      this.step = 'email';
      if (this.intervalIdforCount) {
        clearInterval(this.intervalIdforCount);
      }
    } else if (this.step === 'register') {
      this.step = 'email';
    } else {
      this.navCtrl.back();
    }
  }

  openWhatsAppSupport() {
    window.open('https://wa.me/919999999999', '_system');
  }

  openTerms() {
    this.router.navigate(['/layout/about'], {
      state: { data: 'terms' }
    });
  }

  openPrivacy() {
    this.router.navigate(['/layout/about'], {
      state: { data: 'privacy' }
    });
  }
}