import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  compass,
  compassOutline,
  home,
  homeOutline,
  receipt,
  receiptOutline,
  gift,
  giftOutline,
  chatbubbleEllipses,
  chatbubbleEllipsesOutline,
  person,
  personOutline
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NavbarComponent implements OnInit {
  currentRoute: string = '/layout/home';

  constructor(private router: Router) {
    addIcons({
      compass,
      compassOutline,
      home,
      homeOutline,
      receipt,
      receiptOutline,
      gift,
      giftOutline,
      chatbubbleEllipses,
      chatbubbleEllipsesOutline,
      person,
      personOutline
    });
  }

  ngOnInit() {
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
    });
  }

  goToTab(tab: string) {
    this.router.navigate([`/layout/${tab}`]);
  }

  isTabActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }
}
