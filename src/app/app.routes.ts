import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then( m => m.AboutPage)
  },
  {
    path: '',
    loadComponent: () => import('./pages/prelogin/prelogin.page').then( m => m.PreloginPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'navbar',
    loadComponent: () => import('./pages/navbar/navbar.page').then( m => m.NavbarPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
      },
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'layout',
    loadComponent: () => import('./pages/layout/layout.page').then( m => m.LayoutPage)
  }
];
