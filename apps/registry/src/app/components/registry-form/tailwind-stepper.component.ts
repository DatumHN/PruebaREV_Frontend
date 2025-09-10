import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepperStep {
  id: string;
  header: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tailwind-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tw-w-full tw-flex tw-flex-col">
      <!-- Step Headers -->
      <div class="tw-w-full tw-flex tw-justify-center tw-mb-8">
        <div class="tw-relative tw-max-w-4xl tw-w-full tw-px-8">
          <!-- Background connector line -->
          <div
            class="tw-absolute tw-top-5 tw-left-12 tw-right-12 tw-h-px tw-bg-gray-300"
          ></div>

          <!-- Steps grid container with equal distribution -->
          <div
            class="tw-grid tw-grid-cols-1 tw-gap-0 tw-relative tw-z-10"
            [style.grid-template-columns]="getGridColumns()"
          >
            @for (step of steps; track step.id; let i = $index) {
              <!-- Individual Step -->
              <div class="tw-flex tw-flex-col tw-items-center tw-relative">
                <!-- Step Circle and Label -->
                <div
                  class="tw-flex tw-flex-col tw-items-center tw-cursor-pointer"
                  [class.tw-cursor-not-allowed]="step.disabled"
                  [attr.tabindex]="step.disabled ? -1 : 0"
                  [attr.role]="'button'"
                  [attr.aria-label]="
                    'Go to step ' + (i + 1) + ': ' + step.header
                  "
                  [attr.aria-disabled]="step.disabled"
                  (click)="!step.disabled && onStepClick(i)"
                  (keydown)="onStepKeyDown($event, i)"
                >
                  <!-- Step Circle with background to cover line -->
                  <div class="tw-relative tw-bg-white tw-px-2">
                    <div
                      [class]="getStepCircleClasses(i)"
                      class="tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-rounded-full tw-font-semibold tw-text-sm tw-transition-all tw-duration-300"
                    >
                      @if (i < activeStepIndex) {
                        <!-- Completed Step -->
                        <svg
                          class="tw-w-5 tw-h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      } @else {
                        <!-- Step Number -->
                        {{ i + 1 }}
                      }
                    </div>
                  </div>

                  <!-- Step Label -->
                  <span
                    [class]="getStepLabelClasses(i)"
                    class="tw-mt-2 tw-text-sm tw-font-medium tw-text-center tw-leading-tight tw-transition-all tw-duration-300 tw-max-w-24 tw-px-1"
                  >
                    {{ step.header }}
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- Progress overlay lines for completed steps -->
          <div
            class="tw-absolute tw-top-5 tw-left-12 tw-right-12 tw-h-px tw-pointer-events-none"
          >
            @for (step of steps; track step.id; let i = $index) {
              @if (i < steps.length - 1 && i < activeStepIndex) {
                <div
                  class="tw-absolute tw-h-px tw-bg-rnpn-primary-500 tw-transition-all tw-duration-300"
                  [style.left.%]="getProgressLeft(i)"
                  [style.width.%]="getProgressWidth()"
                ></div>
              }
            }
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="tw-w-full">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class TailwindStepperComponent implements OnInit, OnChanges {
  @Input() activeStepIndex = 0;
  @Input() steps: StepperStep[] = [];
  @Input() linear = true;

  @Output() stepChange = new EventEmitter<number>();

  ngOnInit() {
    // Ensure activeStepIndex is within bounds
    this.validateActiveStepIndex();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeStepIndex'] || changes['steps']) {
      this.validateActiveStepIndex();
    }
  }

  private validateActiveStepIndex() {
    if (this.activeStepIndex >= this.steps.length) {
      this.activeStepIndex = Math.max(0, this.steps.length - 1);
    }
    if (this.activeStepIndex < 0) {
      this.activeStepIndex = 0;
    }
  }

  onStepClick(stepIndex: number) {
    if (this.linear) {
      // In linear mode, only allow going to previous steps or current step
      if (stepIndex <= this.activeStepIndex) {
        this.activeStepIndex = stepIndex;
        this.stepChange.emit(stepIndex);
      }
    } else {
      // Non-linear mode allows jumping to any step
      this.activeStepIndex = stepIndex;
      this.stepChange.emit(stepIndex);
    }
  }

  onStepKeyDown(event: KeyboardEvent, stepIndex: number) {
    // Handle Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onStepClick(stepIndex);
    }
  }

  getStepCircleClasses(stepIndex: number): string {
    const baseClasses = 'tw-border-2 tw-transition-all tw-duration-300';

    if (stepIndex < this.activeStepIndex) {
      // Completed step - use RNPN brand colors
      return `${baseClasses} tw-bg-rnpn-primary-500 tw-border-rnpn-primary-500 tw-text-white tw-shadow-md`;
    } else if (stepIndex === this.activeStepIndex) {
      // Active step - use RNPN brand colors with emphasis
      return `${baseClasses} tw-bg-rnpn-primary-500 tw-border-rnpn-primary-500 tw-text-white tw-shadow-lg tw-scale-110`;
    } else {
      // Future step
      const step = this.steps[stepIndex];
      if (step?.disabled) {
        return `${baseClasses} tw-bg-gray-100 tw-border-gray-300 tw-text-gray-400`;
      } else {
        return `${baseClasses} tw-bg-white tw-border-gray-300 tw-text-gray-700 hover:tw-border-rnpn-primary-400 hover:tw-text-rnpn-primary-500`;
      }
    }
  }

  getStepLabelClasses(stepIndex: number): string {
    if (stepIndex < this.activeStepIndex) {
      // Completed step - use RNPN brand colors
      return 'tw-text-rnpn-primary-600';
    } else if (stepIndex === this.activeStepIndex) {
      // Active step - use RNPN brand colors
      return 'tw-text-rnpn-primary-600 tw-font-semibold';
    } else {
      // Future step
      const step = this.steps[stepIndex];
      if (step?.disabled) {
        return 'tw-text-gray-400';
      } else {
        return 'tw-text-gray-600 hover:tw-text-rnpn-primary-600';
      }
    }
  }

  getGridColumns(): string {
    // Create equal column fractions for perfect spacing
    if (this.steps.length <= 1) return '1fr';

    return Array(this.steps.length).fill('1fr').join(' ');
  }

  getProgressLeft(stepIndex: number): number {
    // Calculate the left position of each progress segment as percentage
    if (this.steps.length <= 1) return 0;

    const segmentWidth = 100 / (this.steps.length - 1);
    return stepIndex * segmentWidth;
  }

  getProgressWidth(): number {
    // Calculate the width of each progress segment as percentage
    if (this.steps.length <= 1) return 0;

    return 100 / (this.steps.length - 1);
  }
}
