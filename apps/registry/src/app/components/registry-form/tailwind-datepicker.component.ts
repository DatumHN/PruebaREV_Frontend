import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-tailwind-datepicker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="tw-relative">
      <input
        type="date"
        [formControl]="$any(formControl)"
        [formlyAttributes]="field"
        [class]="getInputClasses()"
        [disabled]="props.disabled || false"
        [readonly]="props.readonly || false"
      />
      <div
        class="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-3 tw-flex tw-items-center tw-pointer-events-none"
      >
        <svg
          class="tw-w-5 tw-h-5 tw-text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
  `,
})
export class TailwindDatepickerComponent extends FieldType {
  getInputClasses(): string {
    let baseClasses =
      'tw-w-full tw-px-3 tw-py-2 tw-pr-10 tw-border tw-rounded-md tw-transition-colors focus:tw-outline-none focus:tw-ring-2';

    // Estados de validación
    if (this.formControl?.invalid && this.formControl?.touched) {
      baseClasses +=
        ' tw-border-red-500 focus:tw-ring-red-500 focus:tw-border-red-500';
    } else if (this.formControl?.valid && this.formControl?.touched) {
      baseClasses +=
        ' tw-border-rnpn-primary-500 focus:tw-ring-rnpn-primary-500 focus:tw-border-rnpn-primary-500';
    } else {
      baseClasses +=
        ' tw-border-gray-300 focus:tw-ring-rnpn-primary-500 focus:tw-border-rnpn-primary-500';
    }

    // Estado deshabilitado
    if (this.props?.disabled) {
      baseClasses += ' tw-bg-gray-100 tw-text-gray-500 tw-cursor-not-allowed';
    }

    // Clases adicionales del props
    if (this.props?.['class']) {
      baseClasses += ` ${this.props['class']}`;
    }

    return baseClasses;
  }
}
