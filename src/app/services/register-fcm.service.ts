import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotification } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class RegisterFcmService {

  constructor() { }

  initPush() {
    // Request permission
    PushNotifications.requestPermissions().then(result => {
      if (result.receive === 'granted') {
        PushNotifications.register();
      } else {
        console.warn('Push permission not granted');
      }
    });

    // Get FCM token
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM Token:', token.value);
      localStorage.setItem('FcmToken', token.value)
      // 👉 Send token to your server
      // this.http.post('https://your-api.com/api/save-token', {
      //   userId: 'user-123', // or get it dynamically
      //   fcmToken: token.value,
      // }).subscribe(() => {
      //   console.log('Token saved to backend');
      // });
    });

    // Handle registration error
    PushNotifications.addListener('registrationError', error => {
      console.error('Registration error:', error);
    });

    // Notification received in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
      console.log('Notification received:', notification);
       alert(`${notification.title}\n${notification.body}`);
    });

    // Notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Notification action performed:', action.notification);
    });
  }

}
