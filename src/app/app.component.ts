import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit{
  constructor() {}

  ngOnInit() {
    this.lockOrientation();
  }

   async lockOrientation() {
    await ScreenOrientation.lock({ orientation: 'portrait-primary' });
  }
}
