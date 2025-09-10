import { inject } from '@angular/core';
import { CanMatchFn, Router, Route } from '@angular/router';
import { AuthStateService } from '../providers/auth-state.service';

export const roleGuard: CanMatchFn = (route: Route) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'];

  if (
    !expectedRoles ||
    !Array.isArray(expectedRoles) ||
    expectedRoles.length === 0
  ) {
    console.warn('Route is missing role data for RoleGuard');
    return true; // Allow access if no roles are specified on the route
  }

  if (authState.hasAnyRole(expectedRoles)) {
    return true;
  } else {
    // If user doesn't have the required role, redirect to the landing page
    router.navigate(['/landing']);
    return false;
  }
};
