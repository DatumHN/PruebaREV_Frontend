import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-field-input-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="tw-flex tw-w-full">
      <input
        type="text"
        [formControl]="$any(formControl)"
        [formlyAttributes]="field"
        [placeholder]="props.placeholder || ''"
        [class]="getInputClasses()"
        [disabled]="props.disabled || false"
        [readonly]="props.readonly || false"
      />
      <button
        type="button"
        [class]="getButtonClasses()"
        (click)="onSearch()"
        [disabled]="props.disabled || false"
      >
        <svg
          class="tw-w-4 tw-h-4 tw-mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        {{ props['searchLabel'] || 'Buscar' }}
      </button>
    </div>
  `,
})
export class FormlyFieldInputGroupComponent extends FieldType<FieldTypeConfig> {
  onSearch() {
    if (this.props['onSearchClick']) {
      this.props['onSearchClick'](this.field);
    }
  }

  getInputClasses(): string {
    let baseClasses =
      'tw-flex-1 tw-px-3 tw-py-2 tw-border tw-border-r-0 tw-rounded-l-md tw-transition-colors focus:tw-outline-none focus:tw-ring-2';

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

    return baseClasses;
  }

  getButtonClasses(): string {
    let baseClasses =
      'tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-border tw-border-blue-600 tw-rounded-r-md tw-font-medium tw-text-sm tw-flex tw-items-center tw-transition-colors hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500';

    // Estado deshabilitado
    if (this.props?.disabled) {
      baseClasses +=
        ' tw-bg-gray-400 tw-border-gray-400 tw-cursor-not-allowed hover:tw-bg-gray-400';
    }

    return baseClasses;
  }
}
