import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailValidator, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardTitle, IonInput, IonText, IonLabel, IonItem, IonImg, IonSpinner, IonToast, IonCardSubtitle, IonApp, IonCard, IonCardContent, IonCardHeader } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, chevronBack, timeOutline, personOutline, mailOutline, arrowForward } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { NgOtpInputModule } from 'ng-otp-input';
import { timer } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
    NgOtpInputModule,
    IonCardContent,
    IonCard,
    IonApp,
    IonCardSubtitle,
    IonToast,
    IonSpinner,
    IonImg,
    IonItem,
    IonLabel,
    IonText,
    IonInput,
    IonCardTitle,
    IonIcon,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class LoginPage implements OnInit {
  phoneNumber = '';
  verificationCode = '';
  verificationId: string = '';
  codeSent = false;
  user: any = null;

  otpSent: boolean = false;
  
  // FIX: Initialize as true immediately to show loader while checking storage
  verifyingToken: boolean = true; 
  
  mobileNumber = '';
  otp = '';
  enteredOtp = '';
  users: any;
  showRegisterForm: boolean = false;
  fullName = '';
  email = '';
  isLoading: boolean = false;
  toastMessage = '';
  isToastOpen: boolean = false;
  isSendingOtp: boolean = false;
  intervalId: any;
  intervalIdforCount: any;
  otpVerificationMessage: string = '';
  timer = 45
  tokenDecoded: any;
  token: any;

  otpConfig = {
    length: 6,
    inputStyles: {
      width: '45px',
      height: '50px',
      'font-size': '18px',
      margin: '0 6px',
      'border-radius': '8px',
      border: '1px solid black',
    },
  };

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({arrowBack,timeOutline,personOutline,mailOutline,arrowForward,chevronBack});
  }

  async ngOnInit() {
    this.verifyingToken = true;
    // FIX: Removed the 2000ms setTimeout. This was causing the slow startup.
    this.token = await this.authService.getToken();
    console.log(this.token);
    
    if (this.token) {
      this.verifyToken();
    } else {
      // No token found, stop loading and show login screen immediately
      this.verifyingToken = false;
    }
  }

  async verifyToken() {
    if (this.token) {
      this.verifyingToken = true;
      this.authService.verifyToken(this.token).subscribe(
        (res: any) => {
          console.log(res);
          if (res.valid == true) {
            // Token is valid, go to home. 
            // verifyingToken stays true so user doesn't see login screen flash before nav.
            this.navCtrl.navigateRoot('/layout/example/home');
          } else {
            // Token invalid, show login
            this.verifyingToken = false;
          }
        },
        (error) => {
          // Error checking token, show login
          console.error('Token verification failed', error);
          this.verifyingToken = false;
        }
      );
    } else {
       this.verifyingToken = false;
    }
  }

  async sendVerification() {
    this.otpVerificationMessage = 'Verify Otp'
    FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
      this.verificationId = event.verificationId;
      console.log('✅ Verification ID received:', this.verificationId);
    });

    FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
      console.error('❌ Verification failed event:', event);
      this.isSendingOtp = false;
      this.isToastOpen = true;
      this.toastMessage = `❌ OTP send failed. Reason: ${
        event?.message || 'Unknown error'
      }`;
      setTimeout(() => {
        this.isToastOpen = false;
      }, 3000);
      clearInterval(this.intervalId);
    });

    try {
      this.isSendingOtp = true;
      this.verificationId = '';
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: `+91${this.phoneNumber}`,
      });
      console.log('✅ SMS code sent:', result);
      this.intervalId = setInterval(() => {
        console.log('interval running');
        if (this.verificationId != '') {
          this.otpSent = true;
          this.timer = 45
          this.intervalIdforCount = setInterval(()=> {
            if(this.timer != 0){
              this.timer = this.timer - 1
            } else {
              clearInterval(this.intervalIdforCount)
            }
          },1000)
          this.isSendingOtp = false;
          this.isToastOpen = true;
          this.toastMessage = `OTP sent successfully`;
          clearInterval(this.intervalId);
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
        }
      }, 100);
    } catch (e: any) {
      this.isSendingOtp = false;
      this.isToastOpen = true;
      this.toastMessage = `Failed to send Otp, ${e}`;
      clearInterval(this.intervalId);
      setTimeout(() => {
        this.isToastOpen = false;
      }, 3000);

      const code = e.code || e.message || 'unknown';

      switch (code) {
        case 'auth/invalid-verification-code':
          alert('🚫 The OTP you entered is incorrect. Please try again.');
          break;

        case 'auth/code-expired':
          alert('⌛ The OTP has expired. Please request a new one.');
          break;

        case 'auth/invalid-verification-id':
          alert(
            '⚠️ Invalid verification session. Please try restarting the login.'
          );
          break;

        case 'auth/missing-verification-code':
          alert('🔢 Please enter the OTP.');
          break;

        case 'auth/network-request-failed':
          alert('🌐 Network error. Please check your internet connection.');
          break;

        default:
          alert('❌ Verification failed. Please try again.');
          break;
      }
    }
  }

  async verifyOTP() {
    try {
      this.isLoading = true;
      this.otpVerificationMessage = 'Verifying Otp';
      const result = await FirebaseAuthentication.confirmVerificationCode({
        verificationId: this.verificationId,
        verificationCode: this.verificationCode,
      });

      console.log('✅ OTP verification successful!', result);
      this.isLoading = false;
      this.otpVerificationMessage = '';
      this.checkUser(); 
    } catch (error: any) {
      this.isLoading = false;
      this.otpVerificationMessage = '';
      console.error('❌ OTP verification failed:', error);

      const code = error.code || error.message || 'unknown';

      switch (code) {
        case 'auth/invalid-verification-code':
          this.isToastOpen = true;
          this.toastMessage = `🚫 The OTP you entered is incorrect. Please try again.`;
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
          break;

        case 'auth/code-expired':
          alert('⌛ The OTP has expired. Please request a new one.');
          break;

        case 'auth/invalid-verification-id':
          alert(
            '⚠️ Invalid verification session. Please try restarting the login.'
          );
          break;

        case 'auth/missing-verification-code':
          alert('🔢 Please enter the OTP.');
          break;

        case 'auth/network-request-failed':
          alert('🌐 Network error. Please check your internet connection.');
          break;

        default:
          this.isToastOpen = true;
          this.toastMessage = `❌ Verification failed. Please try again..`;
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
          break;
      }
    }
  }

  onOtpChange(value: string) {
    this.verificationCode = value;
    if (this.verificationCode.length == 6) {
      this.verifyOTP();
    }
  }

  async logout() {
    try {
      await FirebaseAuthentication.signOut();
      alert('User signed out.');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out.');
    }
  }

  goBack() {
    if (!this.otpSent) {
      this.navCtrl.back();
    } else {
      this.otpSent = false;
      clearInterval(this.intervalIdforCount)
    }
  }

  checkUser() {
    this.isLoading = true;
    this.otpVerificationMessage = 'Validating User';
    let params = {
      phone: `${this.phoneNumber}`,
    };
    this.authService.checkUser(params).subscribe(
      (res:any) => {
        console.log(res);

        if (res.isNewUser == true) {
          this.isToastOpen = true;
          this.toastMessage = `New User please register!`;
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
          this.isLoading = false;
          this.otpVerificationMessage = '';
          this.showRegisterForm = true
        } else {
          Preferences.set({
          key: 'auth-token',
          value: res.token,
        });
        console.log(Preferences.get({ key: 'auth-token' }));
        this.navCtrl.navigateRoot('/layout/example/home');
        }
      },
      (error) => {
        this.isLoading = false;
        this.otpVerificationMessage = '';
        console.error('Error fetching users:', error);
        this.isToastOpen = true;
        this.toastMessage = `Failed to check user!`;
        setTimeout(() => {
          this.isToastOpen = false;
        }, 3000);
      }
    );
  }

  register() {
    let params = {
      phone: `${this.phoneNumber}`,
      email: this.email,
      first_name: this.fullName,
      last_name: '',
      username: `${this.phoneNumber}`,
      is_active: true,
      is_verified: true,
    };
    this.isLoading = true;
    this.authService.register(params).subscribe(
      (res:any) => {
        if(res.success == true){
          Preferences.set({
          key: 'auth-token',
          value: res.token,
        });
        let values = {
          name: res.user.first_name,
          phone: res.user.phone,
          email: res.user.email
        }
        localStorage.setItem('userDetails', JSON.stringify(values))

        this.navCtrl.navigateRoot('/layout/example/home');
        this.isLoading = false;
        } else {
          this.isToastOpen = true
          this.toastMessage = `${res.message}`
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching users:', error);
        this.toastMessage = error;
        this.isToastOpen = true;
      }
    );
  }

}