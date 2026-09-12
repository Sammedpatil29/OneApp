import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 1. Authentication
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'offline',
    loadComponent: () =>
      import('./offline/offline.page').then((m) => m.OfflinePage),
  },

  // 2. Master Layout Container (Protected by AuthGuard)
  {
    path: 'layout',
    loadComponent: () =>
      import('./pages/layout/layout.page').then((m) => m.LayoutPage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      // Primary Tabs
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/support/support.page').then((m) => m.SupportPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },

      // Single Location Capture Window for all services
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/map/map.page').then((m) => m.MapPage),
      },

      // Profile Container Sub-routes
      {
        path: 'profile-details',
        loadComponent: () =>
          import('./pages/profile-details/profile-details.page').then((m) => m.ProfileDetailsPage),
      },
      {
        path: 'address-list',
        loadComponent: () =>
          import('./pages/address-list/address-list.page').then((m) => m.AddressListPage),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'referral',
        loadComponent: () =>
          import('./pages/referral/referral.page').then((m) => m.ReferralPage),
      },

      // Rides Service Container
      {
        path: 'rides',
        children: [
          {
            path: '',
            redirectTo: 'search',
            pathMatch: 'full',
          },
          {
            path: 'search',
            loadComponent: () =>
              import('./pages/ride/ride.page').then((m) => m.RidePage),
          },
          {
            path: 'select',
            loadComponent: () =>
              import('./pages/ride-selection-page/ride-selection-page.page').then((m) => m.RideSelectionPagePage),
          },
          {
            path: 'tracking',
            loadComponent: () =>
              import('./pages/track-order/track-order.page').then((m) => m.TrackOrderPage),
          }
        ]
      },

      // Grocery Service Container
      {
        path: 'grocery',
        loadComponent: () =>
          import('./pages/grocery-layout/grocery-layout.page').then((m) => m.GroceryLayoutPage),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./grocery/grocery.page').then((m) => m.GroceryPage),
          },
          {
            path: 'search',
            loadComponent: () =>
              import('./pages/grocery-search/grocery-search.page').then((m) => m.GrocerySearchPage),
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('./grocery-by-category/grocery-by-category.page').then((m) => m.GroceryByCategoryPage),
          },
          {
            path: 'cart',
            loadComponent: () =>
              import('./pages/cart/cart.page').then((m) => m.CartPage),
          },
          {
            path: 'payment',
            loadComponent: () =>
              import('./pages/payment/payment.page').then((m) => m.PaymentPage),
          },
          {
            path: 'tracking/:id',
            loadComponent: () =>
              import('./pages/grocery-order-details/grocery-order-details.page').then((m) => m.GroceryOrderDetailsPage),
          },
          {
            path: 'item/:id',
            loadComponent: () =>
              import('./pages/grocery-item-details/grocery-item-details.page').then((m) => m.GroceryItemDetailsPage),
          },
          {
            path: 'special',
            loadComponent: () =>
              import('./pages/grocery-special/grocery-special.page').then((m) => m.GrocerySpecialPage),
          }
        ]
      },

      // Legacy Dineout & Property modules
      {
        path: 'dineout-layout',
        loadComponent: () =>
          import('./pages/dineout-layout/dineout-layout.page').then((m) => m.DineoutLayoutPage),
        children: [
          {
            path: 'dineout',
            loadComponent: () =>
              import('./pages/dineout/dineout.page').then((m) => m.DineoutPage),
          },
          {
            path: 'dineout-hotel-details/:id',
            loadComponent: () =>
              import('./pages/dineout-hotel-details/dineout-hotel-details.page').then((m) => m.DineoutHotelDetailsPage),
          },
          {
            path: 'dineout-select-time/:id',
            loadComponent: () =>
              import('./pages/dineout-select-time/dineout-select-time.page').then((m) => m.DineoutSelectTimePage),
          },
          {
            path: 'dineout-track/:id',
            loadComponent: () =>
              import('./pages/dineout-track/dineout-track.page').then((m) => m.DineoutTrackPage),
          },
          {
            path: 'dineout-paybill',
            loadComponent: () =>
              import('./pages/dineout-paybill/dineout-paybill.page').then((m) => m.dineoutPaybillPage),
          },
          {
            path: '',
            redirectTo: 'dineout',
            pathMatch: 'full',
          }
        ]
      },
      {
        path: 'property-layout',
        loadComponent: () =>
          import('./pages/property-layout/property-layout.page').then((m) => m.PropertyLayoutPage),
        children: [
          {
            path: 'property',
            loadComponent: () =>
              import('./pages/property/property.page').then((m) => m.PropertyPage),
          },
          {
            path: '',
            redirectTo: 'property',
            pathMatch: 'full',
          }
        ]
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.page').then((m) => m.EventsPage),
      },
      {
        path: 'order-details',
        loadComponent: () =>
          import('./pages/order-details/order-details.page').then((m) => m.OrderDetailsPage),
      },

      // Backward Compatibility Redirect Aliases
      { path: 'example/home', redirectTo: 'home', pathMatch: 'full' },
      { path: 'example/history', redirectTo: 'history', pathMatch: 'full' },
      { path: 'example/support', redirectTo: 'support', pathMatch: 'full' },
      { path: 'example/profile', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'ride', redirectTo: 'rides/search', pathMatch: 'full' },
      { path: 'ride-selection-page', redirectTo: 'rides/select', pathMatch: 'full' },
      { path: 'track-order', redirectTo: 'rides/tracking', pathMatch: 'full' },
      { path: 'grocery-layout', redirectTo: 'grocery', pathMatch: 'prefix' },
      { path: 'grocery-layout/cart', redirectTo: 'grocery/cart', pathMatch: 'full' },
      { path: 'grocery-layout/grocery-search', redirectTo: 'grocery/search', pathMatch: 'full' },
      { path: 'grocery-layout/grocery-by-category', redirectTo: 'grocery/categories', pathMatch: 'full' },
      { path: 'grocery-layout/grocery-order-details/:id', redirectTo: 'grocery/tracking/:id', pathMatch: 'full' },
      { path: 'grocery-layout/grocery-item-details/:id', redirectTo: 'grocery/item/:id', pathMatch: 'full' },
      { path: 'payment', redirectTo: 'grocery/payment', pathMatch: 'full' },
      { path: 'cart', redirectTo: 'grocery/cart', pathMatch: 'full' },
    ]
  },

  // Default Route
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.hasToken() ? 'layout/home' : 'login';
    },
  },
  {
    path: '**',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.hasToken() ? 'layout/home' : 'login';
    },
  }
];
