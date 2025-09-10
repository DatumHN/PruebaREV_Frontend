import {
  Component,
  EventEmitter,
  Output,
  Input,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Clock,
  RefreshCw,
  LogOut,
  AlertTriangle,
  X,
} from 'lucide-angular';
import { SessionManagerService } from '../services/session-manager.service';
import { TimerService, TimerControl } from '../services/timer.service';

@Component({
  selector: 'app-session-extension-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (sessionManager.showExtensionModal()) {
      <div
        class="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-bg-black/60 tw-backdrop-blur-sm tw-animate-fade-in tw-p-4"
        (click)="onBackdropClick($event)"
        (keydown.escape)="onCancel()"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-extension-dialog-title"
      >
        <div
          class="tw-bg-surface-0 tw-rounded-2xl tw-shadow-rnpn-lg tw-p-6 sm:tw-p-8 tw-w-full tw-max-w-sm sm:tw-max-w-lg tw-transform tw-transition-all tw-duration-300 tw-animate-slide-up tw-font-museo-sans tw-border tw-border-surface-200"
        >
          <div class="tw-flex tw-items-center tw-justify-between tw-mb-6">
            <div class="tw-flex tw-items-center tw-gap-3 sm:tw-gap-4">
              <div
                class="tw-w-12 tw-h-12 sm:tw-w-14 sm:tw-h-14 tw-bg-rnpn-primary-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-md"
              >
                <lucide-angular
                  [img]="Clock"
                  class="tw-w-6 tw-h-6 sm:tw-w-7 sm:tw-h-7 tw-text-white"
                ></lucide-angular>
              </div>
              <div>
                <h3
                  id="session-extension-dialog-title"
                  class="tw-text-lg sm:tw-text-xl tw-font-bold tw-text-rnpn-primary-700 tw-mb-1"
                >
                  Sesión por expirar
                </h3>
                <p
                  class="tw-text-xs tw-text-surface-500 tw-font-medium tw-hidden sm:tw-block"
                >
                  Sistema de Registros Vitales y Familiares (REVFA)
                </p>
              </div>
            </div>
            <button
              (click)="onCancel()"
              class="tw-p-2 tw-rounded-full hover:tw-bg-surface-100 tw-transition-all tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-rnpn-primary-300 focus:tw-ring-offset-2"
              title="Cerrar"
              tabindex="0"
            >
              <lucide-angular
                [img]="X"
                class="tw-w-5 tw-h-5 tw-text-surface-400 hover:tw-text-surface-600"
              ></lucide-angular>
            </button>
          </div>

          <div class="tw-flex tw-flex-col tw-items-center tw-mb-8">
            <div
              class="tw-relative tw-flex tw-items-center tw-justify-center tw-mb-6"
            >
              <svg
                class="tw-w-32 tw-h-32 sm:tw-w-36 sm:tw-h-36 tw-transform tw--rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                  class="tw-text-surface-200"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  stroke-width="8"
                  fill="transparent"
                  stroke-linecap="round"
                  [style.stroke-dasharray]="2 * 3.14159 * 45"
                  [style.stroke-dashoffset]="getCircularDashOffset()"
                  [style.stroke]="getCircularProgressColor()"
                  class="tw-transition-all tw-duration-1000 tw-ease-out"
                />
              </svg>

              <div
                class="tw-absolute tw-flex tw-flex-col tw-items-center tw-justify-center"
              >
                <div
                  class="tw-text-2xl sm:tw-text-3xl tw-font-black tw-mb-1 tw-tracking-wide tw-transition-colors tw-duration-500"
                  [class]="getTimerTextColor()"
                >
                  {{ formatTime(timer?.timeRemaining() || 0) }}
                </div>
                <p
                  class="tw-text-xs tw-text-surface-500 tw-font-medium tw-text-center"
                >
                  restante
                </p>
              </div>
            </div>

            <div
              class="tw-p-4 tw-bg-gradient-to-r tw-from-rnpn-primary-50 tw-to-surface-50 tw-border tw-border-rnpn-primary-100 tw-rounded-xl tw-mb-6 tw-w-full"
            >
              <p
                class="tw-text-surface-700 tw-text-sm tw-text-center tw-leading-relaxed tw-font-medium"
              >
                Su sesión en el sistema REVFA está próxima a expirar por motivos
                de seguridad.
                <br class="tw-hidden sm:tw-block" />
                <strong class="tw-text-rnpn-primary-600"
                  >¿Desea extender su sesión?</strong
                >
              </p>
            </div>

            @if (isExtending()) {
              <div
                class="tw-p-4 tw-bg-gradient-to-r tw-from-rnpn-primary-50 tw-to-rnpn-primary-100 tw-border tw-border-rnpn-primary-200 tw-rounded-xl tw-animate-fade-in tw-w-full tw-mb-6"
              >
                <div
                  class="tw-flex tw-items-center tw-gap-3 tw-text-rnpn-primary-700 tw-text-sm tw-justify-center tw-font-medium"
                >
                  <lucide-angular
                    [img]="RefreshCw"
                    class="tw-w-5 tw-h-5 tw-animate-spin"
                  ></lucide-angular>
                  <span>Extendiendo sesión...</span>
                </div>
              </div>
            }

            @if (error()) {
              <div
                class="tw-p-4 tw-bg-gradient-to-r tw-from-red-50 tw-to-red-100 tw-border tw-border-red-200 tw-rounded-xl tw-animate-fade-in tw-w-full tw-mb-6"
              >
                <div
                  class="tw-text-red-700 tw-text-sm tw-text-center tw-font-medium"
                >
                  <lucide-angular
                    [img]="AlertTriangle"
                    class="tw-w-5 tw-h-5 tw-inline tw-mr-2"
                  ></lucide-angular>
                  {{ error() }}
                </div>
              </div>
            }
          </div>

          <div
            class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-justify-center"
          >
            <button
              (click)="onExtendSession()"
              [disabled]="isExtending() || (timer?.timeRemaining() || 0) <= 0"
              class="tw-btn-rnpn tw-px-6 tw-py-3 tw-text-sm tw-font-bold tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-md hover:tw-shadow-lg tw-transform hover:tw-scale-[1.02] tw-transition-all tw-min-w-0 sm:tw-flex-1 sm:tw-max-w-48"
              tabindex="0"
            >
              <lucide-angular
                [img]="RefreshCw"
                class="tw-w-4 tw-h-4"
                [class.tw-animate-spin]="isExtending()"
              ></lucide-angular>
              <span>
                {{ isExtending() ? 'Extendiendo...' : 'Extender sesión' }}
              </span>
            </button>

            <button
              (click)="onLogout()"
              [disabled]="isExtending()"
              class="tw-btn-rnpn-outline tw-px-6 tw-py-3 tw-text-sm tw-font-bold tw-rounded-xl tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-sm hover:tw-shadow-md tw-transform hover:tw-scale-[1.02] tw-transition-all tw-min-w-0 sm:tw-flex-1 sm:tw-max-w-40"
              tabindex="0"
            >
              <lucide-angular
                [img]="LogOut"
                class="tw-w-4 tw-h-4"
              ></lucide-angular>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SessionExtensionModalComponent implements OnDestroy {
  sessionManager = inject(SessionManagerService);
  private timerService = inject(TimerService);

  timer: TimerControl | null = null;

  private _isExtending = signal(false);
  private _error = signal<string | null>(null);

  readonly isExtending = this._isExtending.asReadonly();
  readonly error = this._error.asReadonly();

  getProgressPercentage(): number {
    return this.timer?.progress() || 0;
  }

  getTimeColorState(): string {
    const remaining = this.timer?.timeRemaining() || 0;
    if (remaining <= 30) return 'danger'; // red - últimos 30 segundos
    if (remaining <= 60) return 'warning'; // yellow - último minuto
    return 'safe'; // green - más de 1 minuto
  }

  getCircularProgressColor(): string {
    const state = this.getTimeColorState();
    switch (state) {
      case 'danger':
        return '#DC2626';
      case 'warning':
        return '#D97706';
      default:
        return 'var(--rnpn-primary-500)';
    }
  }

  getTimerTextColor(): string {
    const state = this.getTimeColorState();
    switch (state) {
      case 'danger':
        return 'tw-text-red-600';
      case 'warning':
        return 'tw-text-amber-600';
      default:
        return 'tw-text-rnpn-primary-600';
    }
  }

  getCircularDashOffset(): number {
    const percentage = this.getProgressPercentage();
    const circumference = 2 * Math.PI * 45; // radio de 45
    return circumference - (percentage / 100) * circumference;
  }

  // Event emitters
  @Output() sessionExtended = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();
  @Output() sessionExpired = new EventEmitter<void>();

  Clock = Clock;
  RefreshCw = RefreshCw;
  LogOut = LogOut;
  AlertTriangle = AlertTriangle;
  X = X;

  constructor() {
    effect(() => {
      const isModalOpen = this.sessionManager.showExtensionModal();

      if (isModalOpen && !this.timer) {
        const timeRemaining = this.sessionManager.getTimeRemainingSeconds();
        this.createTimer(timeRemaining);
      } else if (!isModalOpen && this.timer) {
        this.destroyTimer();
      }
    });
  }

  setExtending(extending: boolean): void {
    this._isExtending.set(extending);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onExtendSession(): void {
    this.sessionExtended.emit();
  }

  onLogout(): void {
    this.logoutRequested.emit();
  }

  onCancel(): void {
    this.modalClosed.emit();
  }

  private createTimer(seconds: number): void {
    this.timer = this.timerService.createTimer('session-modal', {
      initialSeconds: seconds,
      autoStart: true,
      onComplete: () => {
        this.sessionExpired.emit();
      },
    });
  }

  private destroyTimer(): void {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyTimer();
  }
}
