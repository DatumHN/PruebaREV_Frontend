import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TailwindToastService, ToastMessage } from './tailwind-toast.service';

@Component({
  selector: 'app-tailwind-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tw-fixed tw-top-24 tw-right-4 tw-z-[9999] tw-space-y-3">
      @for (toast of toasts; track toast.id) {
        <div
          class="tw-max-w-md tw-w-full tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-lg tw-pointer-events-auto tw-transform tw-transition-all tw-duration-300 tw-ease-in-out tw-overflow-hidden"
          role="alert"
          tabindex="-1"
          [attr.aria-labelledby]="'toast-label-' + toast.id"
          [style.animation]="'slideInRight 0.3s ease-out'"
        >
          <div class="tw-flex tw-p-4">
            <!-- Icon Container -->
            <div class="tw-shrink-0">
              <!-- Success Icon -->
              @if (toast.severity === 'success') {
                <svg
                  class="tw-shrink-0 tw-size-4 tw-text-teal-500 tw-mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"
                  ></path>
                </svg>
              }
              <!-- Error Icon -->
              @if (toast.severity === 'error') {
                <svg
                  class="tw-shrink-0 tw-size-4 tw-text-red-500 tw-mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"
                  ></path>
                </svg>
              }
              <!-- Warning Icon -->
              @if (toast.severity === 'warn') {
                <svg
                  class="tw-shrink-0 tw-size-4 tw-text-yellow-500 tw-mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                  ></path>
                </svg>
              }
              <!-- Info Icon -->
              @if (toast.severity === 'info') {
                <svg
                  class="tw-shrink-0 tw-size-4 tw-text-blue-500 tw-mt-0.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
                  ></path>
                </svg>
              }
            </div>

            <!-- Content -->
            <div class="tw-ms-3 tw-flex-1">
              <p
                [attr.id]="'toast-label-' + toast.id"
                class="tw-text-sm tw-font-medium tw-text-gray-700"
              >
                {{ toast.summary }}
              </p>
              @if (toast.detail) {
                <p
                  class="tw-mt-1 tw-text-sm tw-text-gray-500 tw-leading-relaxed"
                >
                  {{ toast.detail }}
                </p>
              }
            </div>

            <!-- Close Button -->
            <div class="tw-ms-3 tw-flex-shrink-0">
              <button
                type="button"
                (click)="removeToast(toast.id)"
                class="tw-inline-flex tw-rounded-lg tw-p-1.5 tw-text-gray-500 hover:tw-bg-gray-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-gray-200 tw-transition-colors"
                [attr.aria-label]="'Cerrar notificación: ' + toast.summary"
              >
                <span class="tw-sr-only">Cerrar</span>
                <svg
                  class="tw-shrink-0 tw-size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m18 6-12 12"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress bar for auto-dismiss -->
          @if (toast.life && toast.life > 0) {
            <div class="tw-h-0.5 tw-bg-gray-100">
              <div
                [class]="getProgressBarClasses(toast.severity)"
                class="tw-h-full tw-animate-toast-progress tw-transition-all"
                [style.animation-duration]="toast.life + 'ms'"
              ></div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes toast-progress {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }

      .tw-animate-toast-progress {
        animation: toast-progress linear forwards;
      }
    `,
  ],
})
export class TailwindToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();
  private toastService = inject(TailwindToastService);

  ngOnInit() {
    this.subscription.add(
      this.toastService.toasts$.subscribe((toasts) => {
        this.toasts = toasts;
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  getProgressBarClasses(severity: string): string {
    switch (severity) {
      case 'success':
        return 'tw-bg-teal-500';
      case 'error':
        return 'tw-bg-red-500';
      case 'warn':
        return 'tw-bg-yellow-500';
      case 'info':
        return 'tw-bg-blue-500';
      default:
        return 'tw-bg-gray-400';
    }
  }
}
