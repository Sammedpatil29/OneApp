import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { ToastController } from '@ionic/angular/standalone';
import { OtaKit } from '@otakit/capacitor-updater';
import { BehaviorSubject, Observable } from 'rxjs';

export interface OtaDiagnosticResult {
  success: boolean;
  currentVersion: string;
  latestVersion?: string;
  isUpToDate: boolean;
  updateAvailable: boolean;
  manifestUrl: string;
  httpStatus?: number;
  responseBody?: any;
  error?: string;
  errorDetails?: string;
}

/** Key used to flag that an OTA update was just applied (survives reload) */
const OTA_UPDATED_KEY = 'ota_just_updated';

@Injectable({
  providedIn: 'root'
})
export class OtaService {
  // Observables for download progress bar on bottom navbar
  private isDownloadingSubject = new BehaviorSubject<boolean>(false);
  public readonly isDownloading$: Observable<boolean> = this.isDownloadingSubject.asObservable();

  private downloadProgressSubject = new BehaviorSubject<number>(0);
  public readonly downloadProgress$: Observable<number> = this.downloadProgressSubject.asObservable();

  private progressInterval: any = null;

  constructor(
    private toastCtrl: ToastController,
    private ngZone: NgZone
  ) {}

  /**
   * Initializes OtaKit on native device.
   * Flow: download silently → show progress bar on bottom navbar → apply and restart immediately → notify user after reload.
   */
  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('ℹ️ [OtaKit] Running in browser, skipping native OTA checks.');
      return;
    }

    try {
      await OtaKit.notifyAppReady();
      console.log('✅ [OtaKit] notifyAppReady sent');
    } catch (e) {
      console.warn('[OtaKit] notifyAppReady warning:', e);
    }

    // Show "App updated" toast if we just came back from an OTA apply
    this.showPostUpdateToast();

    // Start silent background OTA check & auto-apply
    this.setupOtaUpdates();
  }

  // ─── Silent background check → download with progress bar → restart app ──

  private async setupOtaUpdates() {
    try {
      // Listen for background download completion
      await OtaKit.addListener('updateStaged', async (event) => {
        console.log('📦 [OtaKit] Event updateStaged received:', event);
        await this.completeDownloadAndRestart(event.bundle?.version || '');
      });

      // Listen for updateAvailable event from background policy
      await OtaKit.addListener('updateAvailable', async (latest) => {
        console.log('🚀 [OtaKit] Event updateAvailable received:', latest);
        await this.startDownloadAndRestart(latest?.version);
      });

      // Listen for failure to reset progress bar cleanly
      await OtaKit.addListener('downloadFailed', (event) => {
        console.warn('❌ [OtaKit] Event downloadFailed received:', event);
        this.resetDownloadState();
      });

      // Check if an update was already staged from a previous session
      const state = await OtaKit.getState();
      console.log('📊 [OtaKit] Current state:', JSON.stringify(state));
      if (state.staged) {
        console.log('📌 [OtaKit] Staged update waiting:', state.staged?.version);
        await this.completeDownloadAndRestart(state.staged?.version || '');
        return;
      }

      // Perform background check & download
      console.log('🔎 [OtaKit] Checking for updates on CDN...');
      const check = await OtaKit.check();
      console.log('🔎 [OtaKit] Check result:', JSON.stringify(check));

      if (check.kind === 'update_available') {
        console.log('🚀 [OtaKit] New update available:', check.latest?.version);
        await this.startDownloadAndRestart(check.latest?.version);
      } else if (check.kind === 'already_staged') {
        console.log('📌 [OtaKit] Update already staged:', check.latest?.version);
        await this.completeDownloadAndRestart(check.latest?.version || '');
      } else {
        console.log('✅ [OtaKit] App is up to date.');
      }
    } catch (err) {
      console.warn('❌ [OtaKit] Update error:', err);
      this.resetDownloadState();
    }
  }

  /**
   * Starts downloading OTA bundle, displays progress bar on bottom navbar top border (2-3px),
   * and automatically restarts/applies the app once download completes.
   */
  async startDownloadAndRestart(version?: string): Promise<{ success: boolean; message: string }> {
    if (!Capacitor.isNativePlatform()) {
      console.log('ℹ️ [OtaKit] Skipping download on non-native platform.');
      return { success: false, message: 'OTA updates require physical device.' };
    }

    if (this.isDownloadingSubject.value) {
      console.log('⏳ [OtaKit] Download already in progress...');
      return { success: true, message: 'Download already in progress...' };
    }

    this.startProgressSimulation();

    try {
      console.log('📥 [OtaKit] Calling OtaKit.download()...');
      const downloadRes = await OtaKit.download();
      console.log('📥 [OtaKit] Download result:', JSON.stringify(downloadRes));

      if (downloadRes.kind === 'staged' || (downloadRes as any).kind === 'already_staged') {
        const targetVer = (downloadRes as any).bundle?.version || version || '';
        await this.completeDownloadAndRestart(targetVer);
        return { success: true, message: 'Update downloaded! Restarting app...' };
      } else {
        this.resetDownloadState();
        return { success: false, message: `Download returned status: ${downloadRes.kind}` };
      }
    } catch (err: any) {
      this.resetDownloadState();
      console.error('❌ [OtaKit] Error downloading OTA bundle:', err);
      return { success: false, message: err.message || 'Download failed' };
    }
  }

  private startProgressSimulation() {
    this.clearIntervalIfActive();
    this.ngZone.run(() => {
      this.isDownloadingSubject.next(true);
      this.downloadProgressSubject.next(10);
    });

    let current = 10;
    this.progressInterval = setInterval(() => {
      if (current < 92) {
        const step = Math.max(1, Math.floor((92 - current) / 6));
        current += step;
        this.ngZone.run(() => {
          this.downloadProgressSubject.next(current);
        });
      }
    }, 180);
  }

  private async completeDownloadAndRestart(version: string) {
    this.clearIntervalIfActive();
    this.ngZone.run(() => {
      this.isDownloadingSubject.next(true);
      this.downloadProgressSubject.next(100);
    });

    if (version) {
      localStorage.setItem(OTA_UPDATED_KEY, version);
    }

    // Brief delay to allow user to visually see progress bar reach 100%
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      console.log(`🔄 [OtaKit] Restarting app to apply update v${version}...`);
      await OtaKit.apply(); // Triggers reload/restart of the app with new bundle
    } catch (e) {
      console.error('❌ [OtaKit] Failed to restart and apply update:', e);
      this.resetDownloadState();
    }
  }

  private resetDownloadState() {
    this.clearIntervalIfActive();
    this.ngZone.run(() => {
      this.isDownloadingSubject.next(false);
      this.downloadProgressSubject.next(0);
    });
  }

  private clearIntervalIfActive() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // ─── Post-reload notification ──────────────────────────────────────

  private async showPostUpdateToast() {
    const version = localStorage.getItem(OTA_UPDATED_KEY);
    if (!version) return;

    // Clear the flag so we don't show the toast again
    localStorage.removeItem(OTA_UPDATED_KEY);

    try {
      const toast = await this.toastCtrl.create({
        message: `App updated${version ? ' to v' + version : ''} successfully! 🎉`,
        position: 'bottom',
        duration: 4000,
        color: 'success',
        cssClass: 'ota-success-toast',
      });
      await toast.present();
      console.log('✅ [OtaKit] Post-update toast shown for version', version);
    } catch (e) {
      console.error('Toast display error:', e);
    }
  }

  // ─── Manual Check & Diagnostics ───────────────────────────────────

  async getCurrentVersion(): Promise<string> {
    try {
      if (Capacitor.isNativePlatform()) {
        const state = await OtaKit.getState();
        if (state?.current?.version) {
          return state.current.version;
        }
        const appInfo = await App.getInfo();
        if (appInfo?.version) {
          return appInfo.version;
        }
      }
    } catch (e) {
      console.warn('[OtaService] Error getting version:', e);
    }
    return '0.0.16';
  }

  async checkUpdateDetails(): Promise<OtaDiagnosticResult> {
    const currentVersion = await this.getCurrentVersion();
    const manifestUrl = 'https://pintu-api.democompany.in.net/ota/manifests/io.ionic.oneapp/__base__/__default__/manifest.json';

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(manifestUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return {
          success: false,
          currentVersion,
          isUpToDate: false,
          updateAvailable: false,
          manifestUrl,
          httpStatus: res.status,
          error: `Server HTTP ${res.status} (${res.statusText || 'Error'})`,
          errorDetails: text || `Server at pintu-api.democompany.in.net returned status ${res.status}.`
        };
      }

      const manifest = await res.json();
      const latestVersion = manifest.version || '';
      const isUpToDate = Boolean(latestVersion && latestVersion === currentVersion);
      const updateAvailable = Boolean(latestVersion && latestVersion !== currentVersion);

      // If native, also trigger OtaKit.check()
      if (Capacitor.isNativePlatform()) {
        try {
          await OtaKit.check();
        } catch (e) {}
      }

      return {
        success: true,
        currentVersion,
        latestVersion,
        isUpToDate,
        updateAvailable,
        manifestUrl,
        httpStatus: res.status,
        responseBody: manifest
      };
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      return {
        success: false,
        currentVersion,
        isUpToDate: false,
        updateAvailable: false,
        manifestUrl,
        error: isAbort ? 'Request Timeout (> 9s)' : (err.name || 'Network Error'),
        errorDetails: err.message || String(err)
      };
    }
  }

  async applyUpdateNow(): Promise<{ success: boolean; message: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, message: 'OTA updates can only be downloaded on physical devices.' };
    }

    try {
      const state = await OtaKit.getState();
      if (state?.staged) {
        const ver = state.staged?.version || '';
        await this.completeDownloadAndRestart(ver);
        return { success: true, message: 'Update applied! Restarting app...' };
      }

      return await this.startDownloadAndRestart();
    } catch (e: any) {
      this.resetDownloadState();
      return { success: false, message: e.message || 'Failed to download and apply OTA bundle.' };
    }
  }
}
