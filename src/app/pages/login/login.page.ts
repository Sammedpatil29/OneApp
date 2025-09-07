import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailValidator, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardTitle, IonInput, IonText, IonLabel, IonItem, IonImg, IonSpinner, IonToast, IonCardSubtitle, IonApp, IonCard, IonCardContent, IonCardHeader } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
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
    addIcons({ arrowBack });
  }

  ngOnInit() {
    this.authService.getUserId();
    this.listenToAuthState();
  }

  async sendVerification() {
    this.otpVerificationMessage = 'Resending Otp'
    FirebaseAuthentication.addListener('phoneCodeSent', (event) => {
      this.verificationId = event.verificationId;
      console.log('✅ Verification ID received:', this.verificationId);
    });

    FirebaseAuthentication.addListener('phoneVerificationFailed', (event) => {
      console.error('❌ Verification failed event:', event);
      this.isSendingOtp = false;
      console.log(
        '❌ OTP send failed. Reason: ' + (event?.message || 'Unknown error')
      );
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
      // console.error('❌ Failed to send OTP:', e);
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

  listenToAuthState() {
    FirebaseAuthentication.addListener('authStateChange', async (event) => {
      if (event.user) {
        this.user = event.user;
        console.log('✅ User signed in:', this.user);
      } else {
        this.user = null;
        console.log('ℹ️ User not signed in');
      }
    });
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
      this.isToastOpen = true;
      this.toastMessage = `✅ OTP verification successful!`;
      setTimeout(() => {
        this.isToastOpen = false;
      }, 3000);
      this.isLoading = false;
      this.otpVerificationMessage = '';
      this.checkUser(); // Proceed to your login/registration logic
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
      phone: `+91${this.phoneNumber}`,
    };
    this.authService.checkUser(params).subscribe(
      (res) => {
        // console.log(res);
        // this.users = res;
        console.log(res);
        // let isRegistered = this.users.some((item: any) => item.phone.includes(this.mobileNumber));
        // console.log(isRegistered);

        if (res == true) {
          this.createToken();
          this.authService.getUserId();
        } else {
          this.isToastOpen = true;
          this.toastMessage = `New User please register!`;
          setTimeout(() => {
            this.isToastOpen = false;
          }, 3000);
          this.isLoading = false;
          this.otpVerificationMessage = '';
          this.showRegisterForm = true;
        }
      },
      (error) => {
        // Handle error gracefully
        this.isLoading = false;
        this.otpVerificationMessage = '';
        console.error('Error fetching users:', error);
        // Optionally, display an error message to the user
        this.isToastOpen = true;
        this.toastMessage = `Failed to check user!`;
        setTimeout(() => {
          this.isToastOpen = false;
        }, 3000);
      }
    );
  }

  createNewUser() {
    let params = {
      username: `+91${this.phoneNumber}`,
      email: this.email,
      first_name: this.fullName,
      last_name: '',
      profile_image: '',
      phone: `+91${this.phoneNumber}`,
      is_active: true,
      is_verified: true,
    };
    this.isLoading = true;
    this.authService.postNewUser(params).subscribe(
      (res) => {
        this.createToken();
      },
      (error) => {
        // Handle error gracefully
        this.isLoading = false;
        console.error('Error fetching users:', error);
        // Optionally, display an error message to the user
        this.toastMessage = error;
        this.isToastOpen = true;
      }
    );
  }

  login() {
    if (
      this.fullName.length > 3 &&
      this.email.includes('@') &&
      this.email[-1] != '@'
    ) {
      this.createNewUser();
    } else {
      this.isToastOpen = false;
      this.toastMessage = 'Enter valid input';
      this.isToastOpen = true;
      setTimeout(() => {
        this.isToastOpen = false;
      }, 4000);
    }
  }
  response: any;

  createToken() {
    let params = {
      phone: `+91${this.phoneNumber}`,
    };
    this.authService.createToken(params).subscribe(
      (res) => {
        this.response = res;
        Preferences.set({
          key: 'auth-token',
          value: this.response.token,
        });
        this.authService.getUserId();
        console.log(Preferences.get({ key: 'auth-token' }));
        this.router.navigate(['/layout/example/home']);
        setTimeout(() => {
          this.router.navigate(['/layout/example/home']);
          this.isLoading = false;
        }, 500);
      },
      (error) => {
        this.isToastOpen = false;
        this.toastMessage = 'error creating token';
        this.isToastOpen = true;
        setTimeout(() => {
          this.isToastOpen = false;
        });
      }
    );
  }
}
