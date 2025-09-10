import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const hasValidToken =
      authService.getAccessToken() && !authService.isTokenExpired();

    if (hasValidToken) {
      return true;
    }
  } catch (error) {
    console.error('AuthGuard: Error al validar token', error);
  }

  router.navigate(['/landing'], { queryParams: { returnUrl: state.url } });

  return false;
};
