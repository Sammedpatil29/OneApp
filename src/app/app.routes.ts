import { Routes } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/prelogin/prelogin.page').then( m => m.PreloginPage)
  },
  {
    path: 'layout',
    loadComponent: () => import('./pages/layout/layout.page').then( m => m.LayoutPage),
    children: [
      {
        path: 'example',
        component: NavbarComponent,
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./pages/home/home.page').then(m => m.HomePage),
          },
          {
            path: 'search',
            loadComponent: () =>
              import('./pages/search/search.page').then(m => m.SearchPage),
          },
          {
            path: 'support',
            loadComponent: () =>
              import('./pages/support/support.page').then(m => m.SupportPage),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./pages/history/history.page').then(m => m.HistoryPage),
          },
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then(m => m.ProfilePage),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.page').then(m => m.AboutPage),
      },
      {
    path: 'profile-details',
    loadComponent: () => import('./pages/profile-details/profile-details.page').then( m => m.ProfileDetailsPage)
  },
      {
        path: '',
        redirectTo: 'example/home',
        pathMatch: 'full',
      },
    ],
  }
];
