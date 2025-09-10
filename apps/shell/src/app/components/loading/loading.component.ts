import { Component, OnInit, OnDestroy } from '@angular/core';
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
        class="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="relative">
            <lucide-angular
              [img]="Loader2"
              class="w-8 h-8 text-blue-600 animate-spin"
            ></lucide-angular>
          </div>
          <div class="text-sm text-gray-600">Cargando microfrontend...</div>
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

  constructor(private loadingService: LoadingService) {
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
