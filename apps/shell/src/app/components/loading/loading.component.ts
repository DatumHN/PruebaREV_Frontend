import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { LoadingService } from '../../services/loading.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isLoading$ | async) {
      <div
        class="tw-fixed tw-inset-0 tw-bg-white tw-bg-opacity-75 tw-z-50 tw-flex tw-items-center tw-justify-center"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-space-y-4">
          <div class="tw-relative">
            <lucide-angular
              [img]="Loader2"
              class="tw-w-8 tw-h-8 tw-text-blue-600 tw-animate-spin"
            ></lucide-angular>
          </div>
          <div class="tw-text-sm tw-text-gray-600">
            Cargando microfrontend...
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .animate-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;
  readonly Loader2 = Loader2;
  private destroy$ = new Subject<void>();
  private loadingService = inject(LoadingService);

  constructor() {
    this.isLoading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    // Optional: Add timeout for extremely long loading states
    this.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      if (isLoading) {
        // Force hide loading after 10 seconds to prevent stuck loading states
        setTimeout(() => {
          this.loadingService.forceHide();
        }, 10000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
