import { Injectable } from '@angular/core';

declare var adsbygoogle: any;
@Injectable({
  providedIn: 'root'
})
export class AdmobService {

  constructor() { }

   initBannerAd(adUnitId: string) {
    if (typeof window !== 'undefined') {
      // This will initialize the banner ad
      console.log(adUnitId)
      const bannerAd = document.createElement('ins');
      bannerAd.className = 'adsbygoogle';
      bannerAd.style.display = 'block';
      bannerAd.setAttribute('data-ad-client', 'pub-3473476447894688'); // Replace with your AdMob Publisher ID
      bannerAd.setAttribute('data-ad-slot', adUnitId); // Ad Unit ID for Banner Ad

      // Append the banner ad to a container in your app
      document.getElementById('ad-container')?.appendChild(bannerAd);

      // Request Ad
      (window as any).adsbygoogle.push({});
    }
  }

  displayBannerAd(adUnitId: string) {
    this.initBannerAd(adUnitId);
  }
}
