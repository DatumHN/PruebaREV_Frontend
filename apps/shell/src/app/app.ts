import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SessionExtensionModalComponent } from './components/session-extension-modal.component';
import { SessionManagerService } from './services/session-manager.service';

@Component({
  imports: [RouterModule, SessionExtensionModalComponent],
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'shell';

  private sessionManager = inject(SessionManagerService);

  // Public signals for template
  readonly showExtensionModal = this.sessionManager.showExtensionModal;

  async onExtendSession(): Promise<void> {
    try {
      await this.sessionManager.handleExtendSession();
    } catch (error) {
      console.error('Error extending session:', error);
    }
  }

  async onLogoutRequested(): Promise<void> {
    try {
      await this.sessionManager.handleLogoutRequest();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  onModalClosed(): void {
    this.sessionManager.handleModalClose();
  }

  onSessionExpired(): void {
    // This is handled automatically by the session manager
    console.log('Session expired');
  }
}
