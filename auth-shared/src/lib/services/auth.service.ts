import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Observable,
  throwError,
  BehaviorSubject,
  timer,
  Subscription,
} from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import {
  AuthRequest,
  AuthResponse,
  AuthSuccessResponse,
  isAuthSuccess,
  isAuthError,
  LogoutResponse,
  LogoutSuccessResponse,
  LogoutErrorResponse,
  isLogoutSuccess,
  isLogoutError,
  User,
  UserSession,
  AuthState,
  initialAuthState,
} from '../models';
import { AuthConfig, DEFAULT_AUTH_CONFIG } from '../config';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private config: AuthConfig = DEFAULT_AUTH_CONFIG;

  private authState$ = new BehaviorSubject<AuthState>(initialAuthState);
  private tokenRefreshTimer: Subscription | undefined;

  public readonly isAuthenticated$ = this.authState$.pipe(
    map((state) => state.isAuthenticated),
  );

  public readonly user$ = this.authState$.pipe(map((state) => state.user));

  public readonly isLoading$ = this.authState$.pipe(
    map((state) => state.isLoading),
  );

  public readonly error$ = this.authState$.pipe(map((state) => state.error));

  public readonly isLoggingOut$ = this.authState$.pipe(
    map((state) => state.isLoggingOut),
  );

  public readonly logoutError$ = this.authState$.pipe(
    map((state) => state.logoutError),
  );

  public readonly session$ = this.authState$.pipe(
    map((state) => state.session),
  );

  constructor() {
    // Use setTimeout to ensure storage is fully available after page load
    setTimeout(() => {
      this.initializeFromStorage();
    }, 0);
  }

  login(credentials: AuthRequest): Observable<AuthSuccessResponse> {
    this.updateAuthState({ isLoading: true, error: null });

    const loginUrl = `${this.config.apiUrl}${this.config.loginEndpoint}`;

    return this.http.post<AuthResponse>(loginUrl, credentials).pipe(
      map((response) => {
        if (isAuthSuccess(response)) {
          return response;
        } else if (isAuthError(response)) {
          throw new Error(response.message);
        } else {
          throw new Error('Invalid response format');
        }
      }),
      tap((response) => {
        this.handleLoginSuccess(response, credentials);
      }),
      catchError((error) => {
        return this.handleAuthError(error);
      }),
    );
  }

  logout(): Observable<LogoutSuccessResponse> {
    return this.logoutFromServer().pipe(
      catchError((error) => {
        // Even if server logout fails, we still clear local state
        console.warn('Server logout failed, but clearing local state:', error);
        this.clearLocalState();
        // Return a successful logout response for UX consistency
        return throwError(() => error);
      }),
      tap(() => this.clearLocalState()),
    );
  }

  logoutFromServer(): Observable<LogoutSuccessResponse> {
    const accessToken = this.tokenStorage.getAccessToken();

    if (!accessToken) {
      // No token to logout with, just clear local state
      this.clearLocalState();
      return throwError(() => new Error('No access token available'));
    }

    this.updateAuthState({ isLoggingOut: true, logoutError: null });

    const logoutUrl = `${this.config.apiUrl}${this.config.logoutEndpoint}`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    return this.http.post<LogoutResponse>(logoutUrl, {}, { headers }).pipe(
      map((response: LogoutResponse) => {
        if (isLogoutSuccess(response)) {
          return response;
        }
        if (isLogoutError(response)) {
          const errorResponse = response as LogoutErrorResponse;
          throw new Error(errorResponse.message);
        }
        throw new Error('Invalid logout response format');
      }),
      tap(() => {
        this.updateAuthState({
          isLoggingOut: false,
          logoutError: null,
        });
      }),
      catchError((error) => this.handleLogoutError(error)),
    );
  }

  quickLogout(): void {
    // Immediate local logout without server call
    this.clearLocalState();
  }

  private clearLocalState(): void {
    this.clearTokenRefreshTimer();
    this.tokenStorage.clearAll();
    this.updateAuthState({
      ...initialAuthState,
      isLoggingOut: false,
    });
  }

  refreshToken(): Observable<AuthSuccessResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshUrl = `${this.config.apiUrl}${this.config.refreshEndpoint}`;

    return this.http
      .post<AuthResponse>(refreshUrl, { refresh_token: refreshToken })
      .pipe(
        map((response) => {
          if (isAuthSuccess(response)) {
            return response;
          } else if (isAuthError(response)) {
            throw new Error(response.message);
          } else {
            throw new Error('Invalid response format');
          }
        }),
        tap((response) => this.handleRefreshSuccess(response)),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        }),
      );
  }

  isTokenExpired(): boolean {
    const session = this.tokenStorage.getSessionData() as UserSession | null;

    if (!session || !session.expiresAt) {
      return true;
    }

    // Validate session structure
    if (typeof session.expiresAt !== 'number' || isNaN(session.expiresAt)) {
      console.error('AuthService: Invalid expiresAt value:', session.expiresAt);
      return true;
    }

    const now = Date.now();
    const expiresAt = session.expiresAt;
    const bufferTime = this.config.tokenRefreshBuffer * 60 * 1000; // Convert to milliseconds
    const effectiveExpirationTime = expiresAt - bufferTime;
    const isExpired = now >= effectiveExpirationTime;

    return isExpired;
  }

  isTokenCloseToExpiration(): boolean {
    const session = this.tokenStorage.getSessionData() as UserSession | null;

    if (!session || !session.expiresAt) {
      return false;
    }

    const now = Date.now();
    const expiresAt = session.expiresAt;
    const closeToExpirationThreshold = 2 * 60 * 1000; // 2 minutes
    const timeUntilExpiration = expiresAt - now;
    const isCloseToExpiration =
      timeUntilExpiration <= closeToExpirationThreshold &&
      timeUntilExpiration > 0;

    return isCloseToExpiration;
  }

  getCurrentUser(): User | null {
    return this.authState$.value.user;
  }

  getCurrentSession(): UserSession | null {
    return this.authState$.value.session;
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  clearError(): void {
    this.updateAuthState({ error: null });
  }

  clearLogoutError(): void {
    this.updateAuthState({ logoutError: null });
  }

  private initializeFromStorage(): void {
    const userData = this.tokenStorage.getUserData() as User | null;
    const sessionData =
      this.tokenStorage.getSessionData() as UserSession | null;
    const accessToken = this.tokenStorage.getAccessToken();

    if (userData && sessionData && accessToken) {
      const tokenExpired = this.isTokenExpired();
      const tokenCloseToExpiration = this.isTokenCloseToExpiration();

      if (!tokenExpired) {
        this.updateAuthState({
          isAuthenticated: true,
          user: userData,
          session: sessionData,
        });
        this.setupTokenRefresh(sessionData.expiresAt);
      } else if (tokenCloseToExpiration) {
        // Attempt to refresh the token
        this.refreshToken().subscribe({
          next: () => {
            // Re-check after refresh
            const refreshedSession =
              this.tokenStorage.getSessionData() as UserSession | null;
            const refreshedUser =
              this.tokenStorage.getUserData() as User | null;
            if (refreshedSession && refreshedUser && !this.isTokenExpired()) {
              this.updateAuthState({
                isAuthenticated: true,
                user: refreshedUser,
                session: refreshedSession,
              });
              this.setupTokenRefresh(refreshedSession.expiresAt);
            } else {
              this.tokenStorage.clearAll();
            }
          },
          error: (error) => {
            console.error(
              'AuthService: Token refresh failed during initialization:',
              error,
            );
            this.tokenStorage.clearAll();
          },
        });
      } else {
        this.tokenStorage.clearAll();
      }
    } else {
      this.tokenStorage.clearAll();
    }
  }

  private handleLoginSuccess(
    response: AuthSuccessResponse,
    credentials: AuthRequest,
  ): void {
    // Validate token response
    this.validateTokenResponse(response);

    const now = Date.now();
    const expiresAt = now + response.expires_in * 1000;

    const user: User = {
      username: credentials.username,
      roles: response.roles,
      realm: response.realm,
      scope: response.scope,
    };

    const session: UserSession = {
      user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenType: response.token_type,
      expiresAt,
      isAuthenticated: true,
    };

    try {
      this.tokenStorage.setAccessToken(response.access_token);
      this.tokenStorage.setRefreshToken(response.refresh_token);
      this.tokenStorage.setUserData(user);
      this.tokenStorage.setSessionData(session);

      // Add a small delay to ensure storage operations are fully committed
      // This is especially important in Module Federation environments
      setTimeout(() => {
        this.updateAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          session,
          error: null,
        });
      }, 50); // Small delay to ensure storage operations are committed
    } catch (error) {
      console.error('AuthService: Error during storage operations:', error);
      // If storage fails, still update state but log the error
      this.updateAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        session,
        error: null,
      });
    }

    this.setupTokenRefresh(expiresAt);
  }

  private validateTokenResponse(response: AuthSuccessResponse): void {
    const issues: string[] = [];

    if (!response.access_token || response.access_token.trim() === '') {
      issues.push('Missing or empty access_token');
    }

    if (!response.refresh_token || response.refresh_token.trim() === '') {
      issues.push('Missing or empty refresh_token');
    }

    if (!response.expires_in || response.expires_in <= 0) {
      issues.push(`Invalid expires_in: ${response.expires_in}`);
    } else {
      const tokenLifetimeMinutes = response.expires_in / 60;

      if (tokenLifetimeMinutes < 3) {
        issues.push(
          `Token lifetime is very short: ${tokenLifetimeMinutes} minutes (consider increasing token lifetime in Keycloak)`,
        );
      }
    }

    if (!response.token_type || response.token_type.trim() === '') {
      issues.push('Missing or empty token_type');
    }

    if (issues.length > 0) {
      console.warn('AuthService: Token response validation issues:', issues);
    }
  }

  private handleRefreshSuccess(response: AuthSuccessResponse): void {
    // Validate token response
    this.validateTokenResponse(response);

    const now = Date.now();
    const expiresAt = now + response.expires_in * 1000;

    // Preserve existing user data from storage
    const existingUser = this.tokenStorage.getUserData() as User | null;

    const user: User = {
      username: existingUser?.username || '', // Preserve existing username
      roles: response.roles,
      realm: response.realm,
      scope: response.scope,
    };

    const session: UserSession = {
      user,
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      tokenType: response.token_type,
      expiresAt,
      isAuthenticated: true,
    };

    this.tokenStorage.setAccessToken(response.access_token);
    this.tokenStorage.setRefreshToken(response.refresh_token);
    this.tokenStorage.setUserData(user);
    this.tokenStorage.setSessionData(session);

    this.updateAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      session,
      error: null,
    });

    this.setupTokenRefresh(expiresAt);
  }

  private handleAuthError(error: unknown): Observable<never> {
    let errorMessage = 'Authentication failed';

    if (error instanceof HttpErrorResponse) {
      if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.updateAuthState({
      isLoading: false,
      error: errorMessage,
    });

    return throwError(() => new Error(errorMessage));
  }

  private handleLogoutError(error: unknown): Observable<never> {
    let errorMessage = 'Logout failed';

    if (error instanceof HttpErrorResponse) {
      if (error.error && typeof error.error === 'object') {
        if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        }
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    this.updateAuthState({
      isLoggingOut: false,
      logoutError: errorMessage,
    });

    return throwError(() => new Error(errorMessage));
  }

  private setupTokenRefresh(expiresAt: number): void {
    this.clearTokenRefreshTimer();

    const now = Date.now();
    const refreshTime = expiresAt - this.config.tokenRefreshBuffer * 60 * 1000;
    const timeUntilRefresh = refreshTime - now;

    if (timeUntilRefresh > 0) {
      this.tokenRefreshTimer = timer(timeUntilRefresh)
        .pipe(switchMap(() => this.refreshToken()))
        .subscribe({
          next: () => {
            // Token refreshed successfully
          },
          error: (error) => console.error('Token refresh failed:', error),
        });
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = undefined;
    }
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    const newState = {
      ...this.authState$.value,
      ...updates,
    };

    this.authState$.next(newState);
  }
}
