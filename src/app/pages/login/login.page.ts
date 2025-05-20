import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailValidator, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardTitle, IonInput, IonText, IonLabel, IonItem, IonImg, IonSpinner, IonToast } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonToast, IonSpinner, IonImg, IonItem, IonLabel, IonText, IonInput, IonCardTitle, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
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

  constructor(private navCtrl: NavController, private authService: AuthService, private router: Router) {
    addIcons({arrowBack});
   }

  ngOnInit() {
    this.authService.getUserId()
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

  veirifyUserOtp() {
  if (this.otp === this.enteredOtp) {
    console.log('OTP verified successfully');
    this.verifyOtp()
  } else {
    console.error('Invalid OTP');
  }
}

  verifyOtp() {
  this.isLoading = true;
  let params = {
    "phone": this.mobileNumber
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
    "username": this.mobileNumber,
    "email": this.email,
    "first_name": this.fullName,
    "last_name": "",
    "profile_image": "",
    "phone": this.mobileNumber,
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
      "phone": this.mobileNumber
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
