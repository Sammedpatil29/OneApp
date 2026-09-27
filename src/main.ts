import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { OtaKit } from '@otakit/capacitor-updater';

// 🚀 Confirm healthy bundle load to OtaKit IMMEDIATELY before angular bootstrap
if (Capacitor.isNativePlatform()) {
  OtaKit.notifyAppReady().then(() => {
    console.log('✅ [OtaKit] Immediate notifyAppReady confirmed in main.ts');
  }).catch((err) => {
    console.warn('[OtaKit] Early notifyAppReady warning:', err);
  });
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(), 
    provideRouter(routes, withPreloading(PreloadAllModules))
  ],
});

