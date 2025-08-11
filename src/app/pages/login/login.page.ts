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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonCardHeader,NgOtpInputModule, IonCardContent, IonCard, IonApp, IonCardSubtitle, IonToast, IonSpinner, IonImg, IonItem, IonLabel, IonText, IonInput, IonCardTitle, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

   phoneNumber = '';
  verificationCode = '';
  verificationId: string = '';
  codeSent = false;
  user: any = null;

  otpSent: boolean = false
  mobileNumber = ''
  otp = ''
  enteredOtp = ''
  users: any;
  showRegisterForm: boolean = false
  fullName = ''
  email = ''
  isLoading: boolean = false
  toastMessage = ''
  isToastOpen: boolean = false

  otpConfig = {
  length: 6,
  inputStyles: {
    width: '45px',
    height: '50px',
    'font-size': '18px',
    'margin': '0 6px',
    'border-radius': '8px',
    'border': '1px solid black',
  }
};

  constructor(private navCtrl: NavController, private authService: AuthService, private router: Router) {
    addIcons({arrowBack});
    
   }

  ngOnInit() {
    this.authService.getUserId()
    this.listenToAuthState();
  }
  

 async sendVerification() {
  FirebaseAuthentication.addListener('phoneCodeSent', event => {
      this.verificationId = event.verificationId;
      console.log('verificationID: ', this.verificationId)
    });
    try {
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: `+91${this.phoneNumber}`
      });
      // On Android, verificationId is stored internally, no need to keep manually
      this.otpSent = true
      console.log('SMS code sent');
    } catch (e) {
      console.error('Failed to send code', e);
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
      const result = await FirebaseAuthentication.confirmVerificationCode({
        verificationId: this.verificationId,
        verificationCode: this.verificationCode,
      });
      console.log(result)
      this.checkUser()
      console.log(`Authentication successful!\nUID: ${result.user}`);
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Invalid code or verification failed.');
    }
  }

  onOtpChange(value: string) {
  this.verificationCode = value;
  if(this.verificationCode.length == 6){
    this.verifyOTP()
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

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  goBack(){
    if(!this.otpSent){
      this.navCtrl.back();
    } else {
      this.otpSent = false
    }
  }

  sendOtp(){
    if(this.mobileNumber.length < 10){
      this.isToastOpen = false
        this.toastMessage = 'enter valid mobile number';
        this.isToastOpen = true
        setTimeout(()=>{
this.isToastOpen = false
        },4000)
    } else {
      this.sendOtpToUser()
        this.otpSent = true
    }
  }

  checkUser() {
  this.isLoading = true;
  let params = {
    "phone": `+91${this.phoneNumber}`
  }
  this.authService.checkUser(params).subscribe(
    (res) => {
      // console.log(res);
      // this.users = res;
console.log(res)
      // let isRegistered = this.users.some((item: any) => item.phone.includes(this.mobileNumber));
      // console.log(isRegistered);

      if (res == true) {
        this.createToken()
        this.authService.getUserId()
      } else {
        alert('new user')
        this.isLoading = false;
        this.showRegisterForm = true;
      }
    },
    (error) => {
      // Handle error gracefully
      this.isLoading = false;
      console.error('Error fetching users:', error);
      // Optionally, display an error message to the user
      alert('Failed to verify OTP. Please try again later.');
    }
  );
}

createNewUser(){
  let params = {
    "username": `+91${this.phoneNumber}`,
    "email": this.email,
    "first_name": this.fullName,
    "last_name": "",
    "profile_image": "",
    "phone": `+91${this.phoneNumber}`,
    "is_active": true,
    "is_verified": true
}
this.isLoading = true
  this.authService.postNewUser(params).subscribe(res => {
    this.createToken()
  },
    (error) => {
      // Handle error gracefully
      this.isLoading = false;
      console.error('Error fetching users:', error);
      // Optionally, display an error message to the user
      this.toastMessage = error
      this.isToastOpen = true
    })
}

  login(){
    if(this.fullName.length > 3 && this.email.includes('@') && this.email[-1] != '@') {
        this.createNewUser()
    } else {
      this.isToastOpen = false
      this.toastMessage = 'Enter valid input'
      this.isToastOpen = true
      setTimeout(()=> {
        this.isToastOpen = false
      }, 4000)
    }
    
  }
response: any;

  createToken(){
    let params = {
      "phone": `+91${this.phoneNumber}`
    }
    this.authService.createToken(params).subscribe(res => {
this.response = res
      Preferences.set({
  key: 'auth-token',
  value: this.response.token
})
this.authService.getUserId()
console.log(Preferences.get({key: 'auth-token'}))
this.router.navigate(['/layout/example/home'])
setTimeout(()=> {
  this.router.navigate(['/layout/example/home'])
  this.isLoading = false
},3000)
    }, (error) => {
      this.isToastOpen = false
      this.toastMessage = 'error creating token'
      this.isToastOpen = true
      setTimeout(()=> {
        this.isToastOpen = false
      })
    })
  }

  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 6-digit OTP
  }

  sendOtpToUser() {
    if (this.mobileNumber.length === 10) {
      this.otp = '1234'
      this.authService.sendOtp(this.mobileNumber, this.otp).subscribe(
        (response) => {
          console.log('OTP sent successfully', response);
        },
        (error) => {
          console.error('Error sending OTP', error);
        }
      );
    } else {
      console.error('Invalid mobile number');
    }
  }

}
