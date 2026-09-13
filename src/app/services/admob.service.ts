import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  BannerAdPluginEvents,
  AdMobBannerSize,
  AdMobError
} from '@capacitor-community/admob';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdmobConfig {
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  isTesting: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdmobService {
  // Official Google AdMob Test Ad Unit IDs (Safe for development & testing)
  // Android Test IDs: https://developers.google.com/admob/android/test-ads
  private readonly GOOGLE_TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
  private readonly GOOGLE_TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
  private readonly GOOGLE_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';

  private isInitialized = false;
  private isBannerVisible = false;
  private isBannerLoadedSubject = new BehaviorSubject<boolean>(false);
  public isBannerLoaded$ = this.isBannerLoadedSubject.asObservable();

  constructor() {
    // Proactively initialize on native platform
    if (Capacitor.isNativePlatform()) {
      this.initialize();
    }
  }

  /**
   * Check if running on Android/iOS native runtime
   */
  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize AdMob SDK and register banner lifecycle listeners
   */
  public async initialize(): Promise<void> {
    if (!this.isNative()) {
      console.log('ℹ️ [AdMob] Web platform detected - Native ads are disabled in browser mode.');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      const isTesting = (environment as any)?.admob?.isTesting ?? true;

      await AdMob.initialize({
        initializeForTesting: isTesting
      });

      this.isInitialized = true;
      console.log('✅ [AdMob] Google Mobile Ads SDK initialized successfully.');

      this.registerBannerListeners();
    } catch (error) {
      console.error('❌ [AdMob] Initialization failed:', error);
    }
  }

  /**
   * Register event listeners for Banner Ad
   */
  private registerBannerListeners(): void {
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      console.log('📢 [AdMob] Banner Ad Loaded');
      this.isBannerLoadedSubject.next(true);
    });

    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      console.warn('⚠️ [AdMob] Banner Ad Failed to Load:', error);
      this.isBannerLoadedSubject.next(false);
    });

    AdMob.addListener(BannerAdPluginEvents.Opened, () => {
      console.log('📢 [AdMob] Banner Ad Opened');
    });

    AdMob.addListener(BannerAdPluginEvents.Closed, () => {
      console.log('📢 [AdMob] Banner Ad Closed');
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      console.log('📢 [AdMob] Banner Ad Size Changed:', size);
    });
  }

  /**
   * Show a Banner Ad on the screen
   * @param customOptions Custom position, margin, adSize, etc.
   */
  public async showBanner(customOptions?: {
    position?: BannerAdPosition;
    margin?: number;
    adSize?: BannerAdSize;
  }): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const envConfig = (environment as any)?.admob;
    const adUnitId = envConfig?.bannerAdUnitId || this.GOOGLE_TEST_BANNER_ID;
    const isTesting = envConfig?.isTesting ?? true;

    // Default: Adaptive Banner positioned at bottom, with 60px margin to stay clear of the bottom tab bar
    const options: BannerAdOptions = {
      adId: adUnitId,
      adSize: customOptions?.adSize || BannerAdSize.ADAPTIVE_BANNER,
      position: customOptions?.position || BannerAdPosition.BOTTOM_CENTER,
      margin: customOptions?.margin !== undefined ? customOptions.margin : 60,
      isTesting: isTesting
    };

    try {
      await AdMob.showBanner(options);
      this.isBannerVisible = true;
      console.log('🎯 [AdMob] showBanner requested with adUnitId:', adUnitId);
    } catch (error) {
      console.error('❌ [AdMob] Failed to show banner:', error);
    }
  }

  /**
   * Hide the banner ad (keeps it in memory to resume quickly)
   */
  public async hideBanner(): Promise<void> {
    if (!this.isNative() || !this.isBannerVisible) {
      return;
    }

    try {
      await AdMob.hideBanner();
      this.isBannerVisible = false;
      console.log('🙈 [AdMob] Banner hidden');
    } catch (error) {
      console.warn('⚠️ [AdMob] Error hiding banner:', error);
    }
  }

  /**
   * Resume displaying a previously hidden banner ad
   */
  public async resumeBanner(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    try {
      await AdMob.resumeBanner();
      this.isBannerVisible = true;
      console.log('👁️ [AdMob] Banner resumed');
    } catch (error) {
      console.warn('⚠️ [AdMob] Error resuming banner:', error);
    }
  }

  /**
   * Destroy and remove the banner ad from the view hierarchy
   */
  public async removeBanner(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    try {
      await AdMob.removeBanner();
      this.isBannerVisible = false;
      this.isBannerLoadedSubject.next(false);
      console.log('🗑️ [AdMob] Banner removed');
    } catch (error) {
      console.warn('⚠️ [AdMob] Error removing banner:', error);
    }
  }

  /**
   * Show Interstitial Ad (for future full-screen ad opportunities)
   */
  public async showInterstitial(): Promise<void> {
    if (!this.isNative()) {
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const envConfig = (environment as any)?.admob;
    const adUnitId = envConfig?.interstitialAdUnitId || this.GOOGLE_TEST_INTERSTITIAL_ID;
    const isTesting = envConfig?.isTesting ?? true;

    try {
      await AdMob.prepareInterstitial({
        adId: adUnitId,
        isTesting: isTesting
      });
      await AdMob.showInterstitial();
      console.log('🎯 [AdMob] Interstitial ad shown');
    } catch (error) {
      console.error('❌ [AdMob] Failed to show interstitial:', error);
    }
  }

  /**
   * Show Rewarded Video Ad (e.g. for bonus wallet points / discounts)
   */
  public async showRewardVideo(): Promise<boolean> {
    if (!this.isNative()) {
      return false;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    const envConfig = (environment as any)?.admob;
    const adUnitId = envConfig?.rewardedAdUnitId || this.GOOGLE_TEST_REWARDED_ID;
    const isTesting = envConfig?.isTesting ?? true;

    try {
      await AdMob.prepareRewardVideoAd({
        adId: adUnitId,
        isTesting: isTesting
      });
      const rewardItem = await AdMob.showRewardVideoAd();
      console.log('🎁 [AdMob] User rewarded:', rewardItem);
      return true;
    } catch (error) {
      console.error('❌ [AdMob] Failed to show reward ad:', error);
      return false;
    }
  }

  /**
   * Compatibility methods for legacy banner ad requests (e.g. track-order page)
   */
  public displayBannerAd(adUnitId?: string): void {
    if (this.isNative()) {
      this.showBanner();
    }
  }

  public initBannerAd(adUnitId?: string): void {
    if (this.isNative()) {
      this.showBanner();
    }
  }
}
