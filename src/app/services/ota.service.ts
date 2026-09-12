import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { ToastController } from '@ionic/angular/standalone';
import { OtaKit } from '@otakit/capacitor-updater';

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
  constructor(
    private toastCtrl: ToastController,
    private ngZone: NgZone
  ) {}

  /**
   * Initializes OtaKit on native device.
   * Flow: download silently → apply immediately → notify user after reload.
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

  // ─── Silent background check → download → apply ───────────────────

  private async setupOtaUpdates() {
    try {
      // Listen for background download completion
      await OtaKit.addListener('updateStaged', (event) => {
        console.log('📦 [OtaKit] Event updateStaged received:', event);
        this.silentApply(event.bundle?.version || '');
      });

      // Check if an update was already staged from a previous session
      const state = await OtaKit.getState();
      console.log('📊 [OtaKit] Current state:', JSON.stringify(state));
      if (state.staged) {
        console.log('📌 [OtaKit] Staged update waiting:', state.staged?.version);
        this.silentApply(state.staged?.version || '');
        return;
      }

      // Perform background check & download
      console.log('🔎 [OtaKit] Checking for updates on CDN...');
      const check = await OtaKit.check();
      console.log('🔎 [OtaKit] Check result:', JSON.stringify(check));

      if (check.kind === 'update_available') {
        console.log('🚀 [OtaKit] New update available:', check.latest?.version);
        const downloadRes = await OtaKit.download();
        console.log('📥 [OtaKit] Download result:', JSON.stringify(downloadRes));
        if (downloadRes.kind === 'staged') {
          this.silentApply(downloadRes.bundle?.version || check.latest?.version || '');
        }
      } else if (check.kind === 'already_staged') {
        console.log('📌 [OtaKit] Update already staged:', check.latest?.version);
        this.silentApply(check.latest?.version || '');
      } else {
        console.log('✅ [OtaKit] App is up to date.');
      }
    } catch (err) {
      console.warn('❌ [OtaKit] Update error:', err);
    }
  }

  // ─── Apply immediately without asking the user ─────────────────────

  private async silentApply(version: string) {
    try {
      console.log(`🔄 [OtaKit] Silently applying update ${version}...`);
      // Persist a flag so we can show a toast after the reload
      localStorage.setItem(OTA_UPDATED_KEY, version);
      await OtaKit.apply(); // This triggers an app reload
    } catch (e) {
      console.error('❌ [OtaKit] Failed to silently apply update:', e);
      localStorage.removeItem(OTA_UPDATED_KEY);
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
        localStorage.setItem(OTA_UPDATED_KEY, ver);
        await OtaKit.apply();
        return { success: true, message: 'Update applied! Reloading app...' };
      }

      const downloadRes = await OtaKit.download();
      if (downloadRes.kind === 'staged') {
        const ver = downloadRes.bundle?.version || '';
        localStorage.setItem(OTA_UPDATED_KEY, ver);
        await OtaKit.apply();
        return { success: true, message: 'Update applied! Reloading app...' };
      }
      return { success: false, message: `Download returned status: ${downloadRes.kind}` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to download and apply OTA bundle.' };
    }
  }
}
