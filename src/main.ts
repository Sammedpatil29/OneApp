import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { IonicModule } from '@ionic/angular';
import { fadeAnimation } from './app/animations/fadeAnimation';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideHttpClient(), 
    provideRouter(routes, withPreloading(PreloadAllModules)),
      importProvidersFrom(
      IonicModule.forRoot() 
    ),
    provideIonicAngular({
      navAnimation: fadeAnimation // Sets this as the default for the whole app
    })
  ],
});
