import { Injectable, inject, signal, effect, OnDestroy } from '@angular/core';
import { AuthService, AuthStateService } from '@revfa/auth-shared';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionManagerService implements OnDestroy {
  private authService = inject(AuthService);
  private authState = inject(AuthStateService);
  private router = inject(Router);

  private _showExtensionModal = signal(false);
  private _modalAlreadyShown = signal(false);
  private sessionCheckInterval: number | undefined;
  private modalTimeoutId: number | undefined;

  // Public signals
  readonly showExtensionModal = this._showExtensionModal.asReadonly();

  private readonly CHECK_INTERVAL = 5 * 1000; // Check every 5 seconds

  constructor() {
    // Effect to monitor authentication state
    effect(() => {
      const isAuthenticated = this.authState.isAuthenticated();

      if (isAuthenticated) {
        this.startSessionMonitoring();
      } else {
        this.stopSessionMonitoring();
        this.resetModalState();
      }
    });
  }

  /**
   * Starts monitoring the session for expiration
   */
  private startSessionMonitoring(): void {
    this.stopSessionMonitoring();

    this.sessionCheckInterval = window.setInterval(() => {
      this.checkSessionStatus();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stops monitoring the session
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = undefined;
    }
    this.clearModalTimeout();
  }

  /**
   * Checks session status using auth-shared methods
   */
  private checkSessionStatus(): void {
    // Skip if user is not authenticated
    if (!this.authState.isAuthenticated()) {
      return;
    }

    // Check if token is expired (should not happen due to auto-refresh, but just in case)
    if (this.authService.isTokenExpired()) {
      this.handleSessionExpired();
      return;
    }

    // Check if token is close to expiration (2 minutes) and modal not shown yet
    if (
      this.authService.isTokenCloseToExpiration() &&
      !this._modalAlreadyShown()
    ) {
      this.showSessionExtensionModal();
    }
  }

  /**
   * Shows the session extension modal
   */
  private showSessionExtensionModal(): void {
    this._showExtensionModal.set(true);
    this._modalAlreadyShown.set(true);

    // Calculate actual time remaining for the modal countdown
    const timeRemaining = this.getTimeRemainingSeconds();

    // Set timeout to auto-logout when time runs out
    this.modalTimeoutId = window.setTimeout(() => {
      this.handleSessionExpired();
    }, timeRemaining * 1000);
  }

  /**
   * Handles session extension request
   */
  async handleExtendSession(): Promise<void> {
    try {
      await this.authState.refreshToken().toPromise();
      this.hideExtensionModal();
      this.resetModalState(); // Allow modal to be shown again for next session
    } catch (error) {
      console.error('Failed to extend session:', error);
      // If refresh fails, we'll logout
      this.handleSessionExpired();
      throw error;
    }
  }

  /**
   * Handles logout request from modal
   */
  async handleLogoutRequest(): Promise<void> {
    this.hideExtensionModal();
    try {
      await this.authState.logout();
    } catch (error) {
      // Even if server logout fails, redirect to landing
      console.warn('Logout failed, but redirecting to landing:', error);
      this.router.navigate(['/landing']);
    }
  }

  /**
   * Handles session expiration - immediate logout
   */
  private handleSessionExpired(): void {
    this.hideExtensionModal();
    this.authState.quickLogout(); // Immediate local logout
  }

  /**
   * Hides the session extension modal
   */
  private hideExtensionModal(): void {
    this._showExtensionModal.set(false);
    this.clearModalTimeout();
  }

  /**
   * Resets modal state to allow showing it again
   */
  private resetModalState(): void {
    this._modalAlreadyShown.set(false);
  }

  /**
   * Handles modal close event
   */
  handleModalClose(): void {
    this._showExtensionModal.set(false);
  }

  /**
   * Clears the modal timeout
   */
  private clearModalTimeout(): void {
    if (this.modalTimeoutId) {
      clearTimeout(this.modalTimeoutId);
      this.modalTimeoutId = undefined;
    }
  }

  /**
   * Gets time remaining until session expiration in seconds
   * Uses the session data from auth service
   */
  getTimeRemainingSeconds(): number {
    const session = this.authService.getCurrentSession();

    if (!session || !session.expiresAt) {
      return 0;
    }

    return Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
  }

  /**
   * Manually triggers the session extension modal (for testing/debugging)
   */
  triggerExtensionModal(): void {
    if (this.authState.isAuthenticated()) {
      this._modalAlreadyShown.set(false); // Reset flag to allow showing
      this.showSessionExtensionModal();
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  ngOnDestroy(): void {
    this.stopSessionMonitoring();
  }
}
