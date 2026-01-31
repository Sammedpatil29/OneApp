import { Routes } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'offline',
    loadComponent: () =>
      import('./offline/offline.page').then((m) => m.OfflinePage),
  },
  {
    path: 'layout',
    loadComponent: () =>
      import('./pages/layout/layout.page').then((m) => m.LayoutPage),
    children: [
      {
        path: 'example',
        component: NavbarComponent,
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./pages/home/home.page').then((m) => m.HomePage),
          },
          {
            path: 'search',
            loadComponent: () =>
              import('./pages/search/search.page').then((m) => m.SearchPage),
          },
          {
            path: 'support',
            loadComponent: () =>
              import('./pages/support/support.page').then((m) => m.SupportPage),
          },
          {
            path: 'history',
            loadComponent: () =>
              import('./pages/history/history.page').then((m) => m.HistoryPage),
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
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.page').then((m) => m.CartPage),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./pages/support/support.page').then((m) => m.SupportPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./pages/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./pages/map/map.page').then((m) => m.MapPage),
      },
      {
        path: 'address-list',
        loadComponent: () =>
          import('./pages/address-list/address-list.page').then(
            (m) => m.AddressListPage,
          ),
      },
      {
        path: 'profile-details',
        loadComponent: () =>
          import('./pages/profile-details/profile-details.page').then(
            (m) => m.ProfileDetailsPage,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.page').then((m) => m.EventsPage),
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/payment/payment.page').then((m) => m.PaymentPage),
      },
      {
        path: 'order-details',
        loadComponent: () =>
          import('./pages/order-details/order-details.page').then(
            (m) => m.OrderDetailsPage,
          ),
      },
      {
        path: 'track-order',
        loadComponent: () =>
          import('./pages/track-order/track-order.page').then(
            (m) => m.TrackOrderPage,
          ),
      },

      {
        path: 'ride',
        loadComponent: () =>
          import('./pages/ride/ride.page').then((m) => m.RidePage),
      },
      {
        path: 'ride-selection-page',
        loadComponent: () =>
          import('./pages/ride-selection-page/ride-selection-page.page').then(
            (m) => m.RideSelectionPagePage,
          ),
      },
      {
        path: 'grocery-layout',
        loadComponent: () =>
          import('./pages/grocery-layout/grocery-layout.page').then(
            (m) => m.GroceryLayoutPage,
          ),
        children: [
          {
            path: 'grocery-order-details',
            loadComponent: () =>
              import('./pages/grocery-order-details/grocery-order-details.page').then(
                (m) => m.GroceryOrderDetailsPage,
              ),
          },
          {
            path: 'grocery-item-details/:id',
            loadComponent: () =>
              import('./pages/grocery-item-details/grocery-item-details.page').then(
                (m) => m.GroceryItemDetailsPage,
              ),
          },
          {
            path: 'grocery-by-category',
            loadComponent: () =>
              import('./grocery-by-category/grocery-by-category.page').then(
                (m) => m.GroceryByCategoryPage,
              ),
          },
          {
            path: 'grocery-special',
            loadComponent: () =>
              import('./pages/grocery-special/grocery-special.page').then(
                (m) => m.GrocerySpecialPage,
              ),
          },
          {
            path: 'grocery-search',
            loadComponent: () =>
              import('./pages/grocery-search/grocery-search.page').then(
                (m) => m.GrocerySearchPage,
              ),
          },
          {
            path: 'grocery',
            loadComponent: () =>
              import('./grocery/grocery.page').then((m) => m.GroceryPage),
          },
          {
            path: '',
            redirectTo: 'grocery',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'dineout-layout',
        loadComponent: () =>
          import('./pages/dineout-layout/dineout-layout.page').then(
            (m) => m.DineoutLayoutPage,
          ),
        children: [
          {
            path: 'dineout',
            loadComponent: () =>
              import('./pages/dineout/dineout.page').then((m) => m.DineoutPage),
          },
          {
            path: 'dineout-hotel-details/:id',
            loadComponent: () =>
              import('./pages/dineout-hotel-details/dineout-hotel-details.page').then(
                (m) => m.DineoutHotelDetailsPage,
              ),
          },
          {
            path: '',
            redirectTo: 'dineout',
            pathMatch: 'full',
          },
        ],
      },

      {
        path: '',
        redirectTo: 'example/home',
        pathMatch: 'full',
      },
    ],
  },
];
