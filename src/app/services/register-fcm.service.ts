import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotification } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ProfileService } from './profile.service';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class RegisterFcmService {

  constructor(private profileService: ProfileService, private navCtrl: NavController) { }

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
      
    });

    // Handle registration error
    PushNotifications.addListener('registrationError', error => {
      console.error('Registration error:', error);
    });

    // Notification received in foreground
    PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotification) => {
      console.log('Notification received:', notification);
      
      // Create a channel (required for Android O+)
      await LocalNotifications.createChannel({
        id: 'pop_notifications',
        name: 'Pop Notifications',
        importance: 5,
        visibility: 1,
        vibration: true
      });

      // Schedule a Local Notification to show in the system tray
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || '',
            body: notification.body || '',
            id: Math.floor(Math.random() * 1000000000), // Use a safe 32-bit integer
            extra: notification.data, // Pass data payload to local notification
            channelId: 'pop_notifications',
          }
        ]
      });
    });

    // Local Notification tapped (Foreground)
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      this.handleNotification(notification.notification.extra);
    });

    // Notification tapped
    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Notification action performed:', action.notification);
      this.handleNotification(action.notification.data);
    });
  }

  private handleNotification(data: any) {
    if (data && data.orderId) {
      this.navCtrl.navigateRoot('/layout/track-order', {
        state: {
          orderId: data.orderId
        }
      });
    }
  }

}
