import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonTabButton, IonTabs, IonTab, IonTabBar, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSearchbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { library, playCircle, radio, search, person, home, homeOutline, time, helpCircle, homeSharp, searchOutline, timeOutline, helpCircleOutline } from 'ionicons/icons';
import { HomePage } from "../home/home.page";
import { HistoryComponent } from "../../components/history/history.component";
import { SearchComponent } from "../../components/search/search.component";
import { SupportComponent } from "../../components/support/support.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.page.html',
  styleUrls: ['./navbar.page.scss'],
  standalone: true,
  imports: [IonIcon, IonTabBar, IonTab, IonTabs, IonTabButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HomePage, HistoryComponent, SearchComponent, SupportComponent]
})
export class NavbarPage implements OnInit {
  constructor() {
    addIcons({home,search,helpCircleOutline,timeOutline,helpCircle,homeSharp,searchOutline,time,homeOutline,radio,library,person,playCircle});
   }

  ngOnInit() {
  }

}
