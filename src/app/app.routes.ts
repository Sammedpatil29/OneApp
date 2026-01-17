import { Routes } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'login',
    loadComponent: () =>import('./pages/login/login.page').then(m => m.LoginPage)
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
            path: 'support',
            loadComponent: () =>
              import('./pages/support/support.page').then(m => m.SupportPage),
          },
      {
    path: 'map',
    loadComponent: () => import('./pages/map/map.page').then( m => m.MapPage)
  },
  {
    path: 'address-list',
    loadComponent: () => import('./pages/address-list/address-list.page').then( m => m.AddressListPage)
  },
      {
    path: 'profile-details',
    loadComponent: () => import('./pages/profile-details/profile-details.page').then( m => m.ProfileDetailsPage)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events/events.page').then( m => m.EventsPage)
  },
  {
    path: 'grocery',
    loadComponent: () => import('./grocery/grocery.page').then( m => m.GroceryPage)
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment/payment.page').then( m => m.PaymentPage)
  },
  {
    path: 'order-details',
    loadComponent: () => import('./pages/order-details/order-details.page').then( m => m.OrderDetailsPage)
  },
  {
    path: 'track-order',
    loadComponent: () => import('./pages/track-order/track-order.page').then( m => m.TrackOrderPage)
  },
  {
    path: 'grocery-order-details',
    loadComponent: () => import('./pages/grocery-order-details/grocery-order-details.page').then( m => m.GroceryOrderDetailsPage)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'grocery-item-details',
    loadComponent: () => import('./pages/grocery-item-details/grocery-item-details.page').then( m => m.GroceryItemDetailsPage)
  },
  {
    path: 'grocery-by-category',
    loadComponent: () => import('./grocery-by-category/grocery-by-category.page').then( m => m.GroceryByCategoryPage)
  },
  {
    path: 'grocery-special/:route',
    loadComponent: () => import('./pages/grocery-special/grocery-special.page').then( m => m.GrocerySpecialPage)
  },
   {
    path: 'ride',
    loadComponent: () => import('./pages/ride/ride.page').then( m => m.RidePage)
  },
  {
    path: 'ride-selection-page',
    loadComponent: () => import('./pages/ride-selection-page/ride-selection-page.page').then( m => m.RideSelectionPagePage)
  },
      {
        path: '',
        redirectTo: 'example/home',
        pathMatch: 'full',
      },
    ],
  },
  

  

 
];
