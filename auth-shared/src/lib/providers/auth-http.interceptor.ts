import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authHttpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);

  // Skip authentication for login and refresh endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (!token) {
    return next(req);
  }

  // Check if token is expired and needs refresh
  if (authService.isTokenExpired()) {
    return authService.refreshToken().pipe(
      switchMap(() => {
        const newToken = authService.getAccessToken();
        const authReq = newToken
          ? req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            })
          : req;

        return next(authReq);
      }),
      catchError(() => {
        // If refresh fails, let the request continue without token
        // The auth service will handle logout
        return next(req);
      }),
    );
  }

  // Add token to request
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq).pipe(
    catchError((error) => {
      // Handle 401 unauthorized errors
      if (error.status === 401) {
        // Try to refresh token
        if (!authService.isTokenExpired()) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              const newToken = authService.getAccessToken();
              const retryReq = newToken
                ? req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  })
                : req;

              return next(retryReq);
            }),
            catchError(() => throwError(() => error)),
          );
        }
      }

      return throwError(() => error);
    }),
  );
};
