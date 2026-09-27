import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Network, ConnectionStatus } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { addIcons } from 'ionicons';
import {
  cloudOfflineOutline,
  wifiOutline,
  refreshOutline,
  checkmarkCircle,
  cellularOutline,
  airplaneOutline,
  alertCircleOutline,
  powerOutline
} from 'ionicons/icons';
import { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-offline',
  templateUrl: './offline.page.html',
  styleUrls: ['./offline.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner]
})
export class OfflinePage implements OnInit, OnDestroy {
  @Output() onlineRestored = new EventEmitter<void>();

  isChecking: boolean = false;
  isConnected: boolean = false;
  checkFailed: boolean = false;
  errorMessage: string = '';

  private networkListener: PluginListenerHandle | null = null;
  private resetTimeout: any = null;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({
      cloudOfflineOutline,
      wifiOutline,
      refreshOutline,
      checkmarkCircle,
      cellularOutline,
      airplaneOutline,
      alertCircleOutline,
      powerOutline
    });
  }

  async ngOnInit() {
    // 1. Listen for real-time network reconnection
    try {
      this.networkListener = await Network.addListener('networkStatusChange', (changeEvent: ConnectionStatus) => {
        if (changeEvent.connected) {
          this.handleOnlineRestoration();
        }
      });
    } catch (e) {
      console.warn('Network listener setup fallback:', e);
    }

    // 2. Also listen to browser online event as fallback
    window.addEventListener('online', this.handleOnlineRestoration.bind(this));

    // 3. Perform a passive quick check in case network came back before page loaded
    const initialStatus = await Network.getStatus().catch(() => ({ connected: false }));
    if (initialStatus.connected) {
      this.handleOnlineRestoration();
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
      this.networkListener = null;
    }
    window.removeEventListener('online', this.handleOnlineRestoration.bind(this));
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  /**
   * Active retry action triggered by user tapping the button
   */
  async retry() {
    if (this.isChecking || this.isConnected) return;

    this.isChecking = true;
    this.checkFailed = false;
    this.errorMessage = '';

    // Subtle tactile feedback
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    // 1. First check Capacitor network adapter
    const netStatus = await Network.getStatus().catch(() => ({ connected: false }));

    // 2. Add an artificial minimum delay of 700ms so user sees the check animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (netStatus.connected) {
      await this.handleOnlineRestoration();
    } else {
      this.isChecking = false;
      this.checkFailed = true;
      this.errorMessage = 'Still offline. Please check your data connection.';

      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch {}

      if (this.resetTimeout) {
        clearTimeout(this.resetTimeout);
      }
      this.resetTimeout = setTimeout(() => {
        this.checkFailed = false;
      }, 4000);
    }
  }

  /**
   * Reconnection handler with success animation and smooth transition to Home
   */
  private async handleOnlineRestoration() {
    if (this.isConnected) return;

    this.isConnected = true;
    this.isChecking = false;
    this.checkFailed = false;

    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {}

    this.onlineRestored.emit();

    // Wait 600ms for user to see the green success badge, then navigate to Home
    setTimeout(() => {
      this.navCtrl.navigateRoot('/layout/home', { animated: true, animationDirection: 'forward' });
    }, 700);
  }

  /**
   * Graceful exit option for users who don't want to wait
   */
  async exitApp() {
    try {
      await App.exitApp();
    } catch {
      this.navCtrl.navigateRoot('/layout/home');
    }
  }
}
