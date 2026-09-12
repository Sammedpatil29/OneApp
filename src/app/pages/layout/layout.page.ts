import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  compass,
  compassOutline,
  home,
  homeOutline,
  receipt,
  receiptOutline,
  bagHandle,
  bagHandleOutline,
  gift,
  giftOutline,
  chatbubbleEllipses,
  chatbubbleEllipsesOutline,
  headset,
  headsetOutline,
  person,
  personOutline
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';
import { AlertModalComponent } from 'src/app/components/alert-modal/alert-modal.component';
import { AppDialogService } from 'src/app/services/app-dialog.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterModule,
    AlertModalComponent,
    AsyncPipe
  ]
})
export class LayoutPage implements OnInit {
  public dialogService = inject(AppDialogService);
  private router = inject(Router);

  currentRoute: string = '/layout/home';

  // Global dialog stream
  readonly dialogState$ = this.dialogService.state$;

  // Primary bottom tabs - Always show navbar when on any of these 5 tabs
  readonly mainTabRoutes: string[] = [
    '/layout/home',
    '/layout/history',
    '/layout/referral',
    '/layout/support',
    '/layout/profile'
  ];

  get showBottomBar(): boolean {
    return this.mainTabRoutes.some(tab => 
      this.currentRoute === tab || this.currentRoute.startsWith(tab + '/')
    );
  }

  constructor() {
    addIcons({
      compass,
      compassOutline,
      home,
      homeOutline,
      receipt,
      receiptOutline,
      bagHandle,
      bagHandleOutline,
      gift,
      giftOutline,
      chatbubbleEllipses,
      chatbubbleEllipsesOutline,
      headset,
      headsetOutline,
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

  navigateTab(route: string) {
    this.router.navigate([route]);
  }

  isTabActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }
}
