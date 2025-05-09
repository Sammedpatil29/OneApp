import { Component, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, helpCircleOutline,timeOutline,helpCircle,homeSharp,searchOutline,time,homeOutline, home, person } from 'ionicons/icons';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports:[IonTabs, IonTabBar, IonTabButton, IonIcon]
})
export class NavbarComponent  implements OnInit {

  constructor() { 
    addIcons({ home,search,helpCircleOutline,timeOutline,helpCircle,homeSharp,searchOutline,time,homeOutline,radio,library,person,playCircle });
  }

  ngOnInit() {}

}
