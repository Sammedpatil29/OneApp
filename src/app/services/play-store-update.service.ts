import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { BehaviorSubject } from 'rxjs';
import { AppUpdate, AppUpdateAvailability, AppUpdateInfo } from '@capawesome/capacitor-app-update';

export const PLAY_STORE_PACKAGE_NAME = 'io.ionic.oneapp';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=io.ionic.oneapp';
export const PLAY_STORE_MARKET_URI = 'market://details?id=io.ionic.oneapp';

export interface PlayStoreUpdateState {
  isChecking: boolean;
  isMandatoryUpdateRequired: boolean;
  availableVersionName?: string;
  currentVersionName?: string;
  updateInfo?: AppUpdateInfo | null;
}

@Injectable({
  providedIn: 'root'
})
export class PlayStoreUpdateService {
  private _state = new BehaviorSubject<PlayStoreUpdateState>({
    isChecking: false,
    isMandatoryUpdateRequired: false,
    availableVersionName: '',
    currentVersionName: '',
    updateInfo: null
  });

  readonly state$ = this._state.asObservable();

  get isMandatoryUpdateRequired(): boolean {
    return this._state.value.isMandatoryUpdateRequired;
  }

  constructor() {}

  /**
   * Initializes update check on app launch & sets up resume listener
   */
  async initialize(): Promise<void> {
    await this.checkForPlayStoreUpdate();

    try {
      App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          console.log('🔄 [PlayStoreUpdate] App resumed, re-verifying update status...');
          await this.checkForPlayStoreUpdate();
        }
      });
    } catch (err) {
      console.warn('⚠️ [PlayStoreUpdate] Could not bind appStateChange listener:', err);
    }
  }

  /**
   * Checks for Google Play Store updates using the official Google Play In-App Updates API.
   */
  async checkForPlayStoreUpdate(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('ℹ️ [PlayStoreUpdate] Not on native Android, skipping Play Store update check.');
      return false;
    }

    this._state.next({
      ...this._state.value,
      isChecking: true
    });

    try {
      console.log('🔍 [PlayStoreUpdate] Checking Google Play Store update info...');
      const info = await AppUpdate.getAppUpdateInfo();
      console.log('📦 [PlayStoreUpdate] Update info received:', JSON.stringify(info));

      const isUpdateAvailable =
        info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE ||
        info.updateAvailability === AppUpdateAvailability.UPDATE_IN_PROGRESS;

      if (isUpdateAvailable) {
        console.log(`🚀 [PlayStoreUpdate] New version available on Google Play! Current: ${info.currentVersionName}, Available: ${info.availableVersionName}`);

        if (info.immediateUpdateAllowed || Capacitor.getPlatform() === 'android') {
          try {
            console.log('📲 [PlayStoreUpdate] Triggering performImmediateUpdate() via Google Play UI...');
            const result = await AppUpdate.performImmediateUpdate();
            console.log('📲 [PlayStoreUpdate] performImmediateUpdate result:', JSON.stringify(result));
          } catch (updateErr) {
            console.warn('⚠️ [PlayStoreUpdate] performImmediateUpdate failed or cancelled, activating mandatory dialog:', updateErr);
          }
        }

        this._state.next({
          isChecking: false,
          isMandatoryUpdateRequired: true,
          availableVersionName: info.availableVersionName || 'Latest',
          currentVersionName: info.currentVersionName || '',
          updateInfo: info
        });

        return true;
      } else {
        console.log('✅ [PlayStoreUpdate] App is up to date on Google Play Store.');
        this._state.next({
          isChecking: false,
          isMandatoryUpdateRequired: false,
          availableVersionName: info.availableVersionName,
          currentVersionName: info.currentVersionName,
          updateInfo: info
        });
        return false;
      }
    } catch (err) {
      console.warn('❌ [PlayStoreUpdate] Error checking Play Store updates:', err);
      this._state.next({
        ...this._state.value,
        isChecking: false
      });
      return false;
    }
  }

  /**
   * Opens Google Play Store directly to the app's listing page.
   */
  async redirectToPlayStore(): Promise<void> {
    try {
      await AppUpdate.openAppStore({
        androidPackageName: PLAY_STORE_PACKAGE_NAME
      });
    } catch (err) {
      console.warn('⚠️ [PlayStoreUpdate] openAppStore failed, opening market / web link directly:', err);
      try {
        window.open(PLAY_STORE_MARKET_URI, '_system');
      } catch (marketErr) {
        window.open(PLAY_STORE_URL, '_system');
      }
    }
  }
}
