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
      '/layout/pharmacy-cart'
    ],
    landingPaths: ['/layout/pharmacy']
  },
  {
    name: 'Properties',
    urlPrefixes: ['/layout/property', '/layout/property-layout'],
    landingPaths: ['/layout/property']
  },
  {
    name: 'Dineout',
    urlPrefixes: ['/layout/dineout', '/layout/dineout-layout'],
    landingPaths: ['/layout/dineout-layout/dineout', '/layout/dineout-layout']
  },
  {
    name: 'Local Events',
    urlPrefixes: ['/layout/events'],
    landingPaths: ['/layout/events']
  },
  {
    name: 'Book a Ride',
    urlPrefixes: ['/layout/rides', '/layout/ride', '/layout/ride-selection-page', '/layout/track-order'],
    landingPaths: ['/layout/rides', '/layout/rides/search']
  }
];

let isConfirmingExit = false;

/**
 * Guard that prompts the user with a confirmation dialog when they attempt
 * to leave a dedicated service layout from its LANDING PAGE only.
 * Navigation within the service (cart, details, search) is always allowed.
 * Navigation from sub-pages back to home is also allowed without confirmation.
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
