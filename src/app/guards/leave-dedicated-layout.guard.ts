import { inject } from '@angular/core';
import { CanDeactivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppDialogService } from '../services/app-dialog.service';

interface DedicatedLayoutConfig {
  name: string;
  urlPrefixes: string[];
  landingPaths: string[]; // Only show confirmation when leaving FROM these exact paths
}

const DEDICATED_LAYOUTS: DedicatedLayoutConfig[] = [
  {
    name: 'Pharmacy & Lab Tests',
    urlPrefixes: [
      '/layout/pharmacy',
      '/layout/medicine-details',
      '/layout/lab-test-details',
      '/layout/pharmacy-search',
      '/layout/pharmacy-cart',
      '/layout/address-list',
      '/layout/map'
    ],
    landingPaths: ['/layout/pharmacy']
  },
  {
    name: 'Properties',
    urlPrefixes: [
      '/layout/property',
      '/layout/property-layout',
      '/layout/property-details',
      '/layout/address-list',
      '/layout/map'
    ],
    landingPaths: ['/layout/property']
  },
  {
    name: 'Dineout',
    urlPrefixes: [
      '/layout/dineout',
      '/layout/dineout-layout',
      '/layout/address-list',
      '/layout/map'
    ],
    landingPaths: ['/layout/dineout-layout/dineout', '/layout/dineout-layout']
  },
  {
    name: 'Local Events',
    urlPrefixes: [
      '/layout/events',
      '/layout/address-list',
      '/layout/map'
    ],
    landingPaths: ['/layout/events']
  },
  {
    name: 'Book a Ride',
    urlPrefixes: [
      '/layout/rides',
      '/layout/ride',
      '/layout/ride-selection-page',
      '/layout/track-order',
      '/layout/ongoing-ride',
      '/layout/address-list',
      '/layout/map'
    ],
    landingPaths: ['/layout/rides', '/layout/rides/search']
  }
];

let isConfirmingExit = false;

/**
 * Guard that prompts the user with a confirmation dialog when they attempt
 * to leave a dedicated service layout from its LANDING PAGE to return to Home.
 * Navigation within the service (cart, details, search, map, address picker, etc.) is always allowed.
 * Opening any item, screen, or sub-service inside or outside never triggers exit confirmation.
 */
export const leaveDedicatedLayoutGuard: CanDeactivateFn<any> = async (
  component,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState?: RouterStateSnapshot
) => {
  const dialogService = inject(AppDialogService);

  // If no target state, allow
  if (!nextState || !nextState.url) {
    return true;
  }

  const currentUrl = currentState.url;
  const nextUrl = nextState.url;

  // Check if destination is actually Home
  // If user is opening anything else (internal service page, sub-page, details, location, map, cart, search, etc.), allow immediately without confirmation!
  const cleanNextUrl = nextUrl.split('?')[0].split('#')[0].replace(/\/$/, '');
  const isNavigatingToHome =
    cleanNextUrl === '/layout/home' ||
    cleanNextUrl === '/home' ||
    cleanNextUrl === '/layout' ||
    cleanNextUrl === '';

  if (!isNavigatingToHome) {
    return true;
  }

  // Find which dedicated layout we are currently in
  const layout = DEDICATED_LAYOUTS.find((l) =>
    l.urlPrefixes.some((prefix) => currentUrl.startsWith(prefix))
  );

  // If not in any dedicated layout, allow navigation
  if (!layout) {
    return true;
  }

  // Check if destination is still within the same dedicated layout
  const isStaying = layout.urlPrefixes.some((prefix) => nextUrl.startsWith(prefix));
  if (isStaying) {
    return true;
  }

  // ONLY show confirmation when leaving FROM the landing page
  // If user is on a sub-page (cart, details, search), let them leave freely
  const isOnLandingPage = layout.landingPaths.some((lp) => {
    // Exact match or match with trailing slash
    const cleanUrl = currentUrl.split('?')[0].replace(/\/$/, '');
    const cleanLp = lp.replace(/\/$/, '');
    return cleanUrl === cleanLp;
  });

  if (!isOnLandingPage) {
    return true;
  }

  // Prevent multiple dialogs if already confirming or alert modal is open
  if (isConfirmingExit || dialogService.isAlertOpen) {
    return false;
  }

  isConfirmingExit = true;
  try {
    const confirmed = await dialogService.showConfirm({
      title: `Leave ${layout.name}?`,
      message: `Are you sure you want to leave ${layout.name} and return to Home?`,
      confirmText: 'Leave',
      cancelText: 'Stay'
    });
    return confirmed;
  } catch {
    return false;
  } finally {
    isConfirmingExit = false;
  }
};
