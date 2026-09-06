import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ToastController, AlertController } from '@ionic/angular/standalone';
import { OtaKit } from '@otakit/capacitor-updater';

@Injectable({
  providedIn: 'root'
})
export class OtaService {
  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private ngZone: NgZone
  ) {}

  /**
   * Initializes OtaKit on native device
   */
  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('ℹ️ [OtaKit] Running in browser, skipping native OTA checks.');
      return;
    }

    try {
      // 1. Notify OtaKit that the app started successfully (prevents automatic rollback)
      await OtaKit.notifyAppReady();
      console.log('✅ [OtaKit] notifyAppReady sent');
    } catch (e) {
      console.warn('[OtaKit] notifyAppReady warning:', e);
    }

    // 2. Setup silent background OTA update checks & staged listeners
    this.setupOtaUpdates();
  }

  private async setupOtaUpdates() {
    try {
      // 1. Listen for background download completion (staged)
      await OtaKit.addListener('updateStaged', (event) => {
        this.ngZone.run(() => {
          this.promptRelaunch(event.bundle?.version || '');
        });
      });

      // 2. Check if an update was already staged previously
      const state = await OtaKit.getState();
      if (state.staged) {
        this.ngZone.run(() => {
          this.promptRelaunch(state.staged?.version || '');
        });
        return;
      }

      // 3. Perform silent background check & download
      const check = await OtaKit.check();
      if (check.kind === 'update_available') {
        console.log('🚀 [OtaKit] New update available:', check.latest?.version);
        // Download silently in background
        await OtaKit.download();
      } else if (check.kind === 'already_staged') {
        this.ngZone.run(() => {
          this.promptRelaunch(check.latest?.version || '');
        });
      }
    } catch (err) {
      console.warn('[OtaKit] Silent update setup error:', err);
    }
  }

  private async promptRelaunch(version: string) {
    const toast = await this.toastCtrl.create({
      message: `Update ${version ? 'v' + version : ''} is ready! Restart to apply changes.`,
      position: 'bottom',
      duration: 10000,
      buttons: [
        {
          text: 'Restart',
          role: 'info',
          handler: async () => {
            try {
              await OtaKit.apply();
            } catch (e) {
              console.error('[OtaKit] Failed to apply update:', e);
            }
          }
        }
      ]
    });
    await toast.present();
  }
}
