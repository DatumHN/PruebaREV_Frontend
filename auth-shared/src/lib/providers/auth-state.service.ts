import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User, UserSession, AuthRequest } from '../models';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state management
  private _isAuthenticated = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);
  private _isLoggingOut = signal<boolean>(false);
  private _user = signal<User | null>(null);
  private _session = signal<UserSession | null>(null);
  private _error = signal<string | null>(null);
  private _logoutError = signal<string | null>(null);

  // Public read-only signals
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isLoggingOut = this._isLoggingOut.asReadonly();
  public readonly user = this._user.asReadonly();
  public readonly session = this._session.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly logoutError = this._logoutError.asReadonly();

  // Computed signals
  public readonly userRoles = computed(() => this.user()?.roles || []);
  public readonly isLoggedIn = computed(
    () => this.isAuthenticated() && !!this.user(),
  );

  constructor() {
    // Sync with auth service state
    this.syncWithAuthService();

    // Effect to handle navigation on authentication state changes
    effect(() => {
      const authStatus = this.isAuthenticated();
      const currentUser = this.user();

      if (authStatus && currentUser && currentUser.username) {
        // User authenticated successfully
      } else if (authStatus && (!currentUser || !currentUser.username)) {
        console.warn(
          'Authentication state inconsistent - authenticated but missing user data',
        );
      }
    });
  }

  async login(credentials: AuthRequest): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      await firstValueFrom(this.authService.login(credentials));

      // Navigation will be handled by the component after successful login
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      this._isLoggingOut.set(true);
      this._logoutError.set(null);

      await firstValueFrom(this.authService.logout());

      // Navigate to landing page after successful logout
      this.router.navigate(['/landing']);
    } catch (error) {
      this._logoutError.set(
        error instanceof Error ? error.message : 'Logout failed',
      );

      // Even if server logout fails, we might still want to redirect for security
      // This is a UX decision - we can clear local state and redirect anyway
      this.authService.quickLogout();
      this.router.navigate(['/landing']);

      throw error;
    } finally {
      this._isLoggingOut.set(false);
    }
  }

  quickLogout(): void {
    // Immediate logout without server call
    this.authService.quickLogout();
    this._isAuthenticated.set(false);
    this._user.set(null);
    this._session.set(null);
    this._error.set(null);
    this._logoutError.set(null);
    this._isLoading.set(false);
    this._isLoggingOut.set(false);

    this.router.navigate(['/landing']);
  }

  clearError(): void {
    this._error.set(null);
    this.authService.clearError();
  }

  clearLogoutError(): void {
    this._logoutError.set(null);
    this.authService.clearLogoutError();
  }

  refreshToken(): Observable<unknown> {
    return this.authService.refreshToken();
  }

  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  isTokenExpired(): boolean {
    return this.authService.isTokenExpired();
  }

  private syncWithAuthService(): void {
    // Subscribe to auth service observables and update signals
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      this._isAuthenticated.set(isAuthenticated);
    });

    this.authService.isLoading$.subscribe((isLoading) => {
      this._isLoading.set(isLoading);
    });

    this.authService.isLoggingOut$.subscribe((isLoggingOut) => {
      this._isLoggingOut.set(isLoggingOut);
    });

    this.authService.user$.subscribe((user) => {
      this._user.set(user);
    });

    this.authService.session$.subscribe((session) => {
      this._session.set(session);
    });

    this.authService.error$.subscribe((error) => {
      this._error.set(error);
    });

    this.authService.logoutError$.subscribe((logoutError) => {
      this._logoutError.set(logoutError);
    });
  }
}
