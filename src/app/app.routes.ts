import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { authGuard, noAuthGuard } from './guards/auth.guard';
import { leaveDedicatedLayoutGuard } from './guards/leave-dedicated-layout.guard';

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
      {
        path: 'pintu-pocket',
        loadComponent: () =>
          import('./pages/pintu-pocket/pintu-pocket.page').then((m) => m.PintuPocketPage),
      },
      {
        path: 'wallet',
        redirectTo: 'pintu-pocket',
        pathMatch: 'full'
      },

      // Rides Service Container
      {
        path: 'rides',
        canDeactivate: [leaveDedicatedLayoutGuard],
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
        canDeactivate: [leaveDedicatedLayoutGuard],
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
        path: 'property',
        loadComponent: () =>
          import('./pages/property-layout/property-layout.page').then((m) => m.PropertyLayoutPage),
        canDeactivate: [leaveDedicatedLayoutGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/property/property.page').then((m) => m.PropertyPage),
          },
          {
            path: 'details/:id',
            loadComponent: () =>
              import('./pages/property-details/property-details.page').then((m) => m.PropertyDetailsPage),
          },
          {
            path: 'register',
            loadComponent: () =>
              import('./pages/property-register/property-register.page').then((m) => m.PropertyRegisterPage),
          }
        ]
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.page').then((m) => m.EventsPage),
        canDeactivate: [leaveDedicatedLayoutGuard],
      },
      {
        path: 'order-details',
        loadComponent: () =>
          import('./pages/order-details/order-details.page').then((m) => m.OrderDetailsPage),
      },

      // Pharmacy Details Views (Directly in main Layout outlet)
      {
        path: 'pharmacy/medicine/:id',
        loadComponent: () =>
          import('./pages/medicine-details/medicine-details.page').then((m) => m.MedicineDetailsPage),
      },
      {
        path: 'pharmacy/test/:id',
        loadComponent: () =>
          import('./pages/lab-test-details/lab-test-details.page').then((m) => m.LabTestDetailsPage),
      },
      {
        path: 'medicine-details/:id',
        loadComponent: () =>
          import('./pages/medicine-details/medicine-details.page').then((m) => m.MedicineDetailsPage),
      },
      {
        path: 'lab-test-details/:id',
        loadComponent: () =>
          import('./pages/lab-test-details/lab-test-details.page').then((m) => m.LabTestDetailsPage),
      },

      // Pharmacy & Lab Tests Service Container
      {
        path: 'pharmacy',
        loadComponent: () =>
          import('./pages/pharmacy-layout/pharmacy-layout.page').then((m) => m.PharmacyLayoutPage),
        canDeactivate: [leaveDedicatedLayoutGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/pharmacy/pharmacy.page').then((m) => m.PharmacyPage),
          },
          {
            path: 'search',
            loadComponent: () =>
              import('./pages/pharmacy-search/pharmacy-search.page').then((m) => m.PharmacySearchPage),
          },
          {
            path: 'cart',
            loadComponent: () =>
              import('./pages/pharmacy-cart/pharmacy-cart.page').then((m) => m.PharmacyCartPage),
          },
          {
            path: 'medicine/:id',
            loadComponent: () =>
              import('./pages/medicine-details/medicine-details.page').then((m) => m.MedicineDetailsPage),
          },
          {
            path: 'test/:id',
            loadComponent: () =>
              import('./pages/lab-test-details/lab-test-details.page').then((m) => m.LabTestDetailsPage),
          }
        ]
      },

      // Backward Compatibility Redirect Aliases
      { path: 'pharmacy-search', redirectTo: 'pharmacy/search', pathMatch: 'full' },
      { path: 'pharmacy-cart', redirectTo: 'pharmacy/cart', pathMatch: 'full' },
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
      { path: 'property-layout', redirectTo: 'property', pathMatch: 'prefix' },
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
