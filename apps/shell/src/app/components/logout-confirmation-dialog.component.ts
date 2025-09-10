import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LogOut, X, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-logout-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      *ngIf="isOpen"
      class="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-bg-black/50 tw-backdrop-blur-sm"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onCancel()"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div
        class="tw-bg-white tw-rounded-xl tw-shadow-2xl tw-p-6 tw-w-full tw-max-w-md tw-mx-4 tw-transform tw-transition-all tw-duration-200"
      >
        <!-- Header -->
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-4">
          <div class="tw-flex tw-items-center tw-gap-3">
            <div
              class="tw-w-10 tw-h-10 tw-bg-orange-100 tw-rounded-full tw-flex tw-items-center tw-justify-center"
            >
              <lucide-angular
                [img]="AlertTriangle"
                class="tw-w-5 tw-h-5 tw-text-orange-600"
              ></lucide-angular>
            </div>
            <h3
              id="logout-dialog-title"
              class="tw-text-lg tw-font-semibold tw-text-gray-900"
            >
              Confirmar cierre de sesión
            </h3>
          </div>
          <button
            (click)="onCancel()"
            (keydown.enter)="onCancel()"
            (keydown.space)="$event.preventDefault(); onCancel()"
            class="tw-p-1 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            title="Cerrar"
            tabindex="0"
          >
            <lucide-angular
              [img]="X"
              class="tw-w-5 tw-h-5 tw-text-gray-400"
            ></lucide-angular>
          </button>
        </div>

        <!-- Content -->
        <div class="tw-mb-6">
          <p class="tw-text-gray-600 tw-text-sm tw-leading-relaxed">
            ¿Está seguro de que desea cerrar sesión? Se cerrará su sesión actual
            y será redirigido a la página de inicio.
          </p>
          <div
            *ngIf="isLoggingOut"
            class="tw-mt-4 tw-p-3 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg"
          >
            <div
              class="tw-flex tw-items-center tw-gap-2 tw-text-blue-600 tw-text-sm"
            >
              <lucide-angular
                [img]="LogOut"
                class="tw-w-4 tw-h-4 tw-animate-spin"
              ></lucide-angular>
              <span>Cerrando sesión...</span>
            </div>
          </div>
          <div
            *ngIf="logoutError"
            class="tw-mt-4 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg"
          >
            <div class="tw-text-red-600 tw-text-sm">
              {{ logoutError }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="tw-flex tw-gap-3 tw-justify-end">
          <button
            (click)="onCancel()"
            [disabled]="isLoggingOut"
            (keydown.enter)="onCancel()"
            (keydown.space)="$event.preventDefault(); onCancel()"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-gray-100 hover:tw-bg-gray-200 tw-rounded-lg tw-transition-colors tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            tabindex="0"
          >
            Cancelar
          </button>
          <button
            (click)="confirmLogout()"
            [disabled]="isLoggingOut"
            (keydown.enter)="confirmLogout()"
            (keydown.space)="$event.preventDefault(); confirmLogout()"
            class="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-red-600 hover:tw-bg-red-700 tw-rounded-lg tw-transition-colors tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed tw-flex tw-items-center tw-gap-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-red-500"
            tabindex="0"
          >
            <lucide-angular
              [img]="LogOut"
              class="tw-w-4 tw-h-4"
              [class.tw-animate-spin]="isLoggingOut"
            ></lucide-angular>
            <span>
              {{ isLoggingOut ? 'Cerrando...' : 'Cerrar sesión' }}
            </span>
          </button>
        </div>

        <!-- Quick Logout Option -->
        <div class="tw-mt-4 tw-pt-4 tw-border-t tw-border-gray-100">
          <button
            (click)="confirmQuickLogout()"
            [disabled]="isLoggingOut"
            (keydown.enter)="confirmQuickLogout()"
            (keydown.space)="$event.preventDefault(); confirmQuickLogout()"
            class="tw-w-full tw-text-xs tw-text-gray-500 hover:tw-text-gray-700 tw-underline tw-transition-colors tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-500"
            tabindex="0"
            title="Cerrar sesión inmediatamente sin notificar al servidor"
          >
            ¿Problemas de conexión? Cerrar sesión rápida
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LogoutConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() isLoggingOut = false;
  @Input() logoutError: string | null = null;

  @Output() confirm = new EventEmitter<void>();
  @Output() quickLogout = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  AlertTriangle = AlertTriangle;
  LogOut = LogOut;
  X = X;

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  confirmLogout() {
    this.confirm.emit();
  }

  confirmQuickLogout() {
    this.quickLogout.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
