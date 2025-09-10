import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-tailwind-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <select
      [formControl]="$any(formControl)"
      [formlyAttributes]="field"
      [class]="getSelectClasses()"
      [disabled]="props.disabled || false"
    >
      <option value="" disabled>
        {{ props.placeholder || 'Seleccione una opción' }}
      </option>
      @for (option of props.options || []; track option.value) {
        <option [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
})
export class TailwindSelectComponent extends FieldType {
  getSelectClasses(): string {
    let baseClasses =
      'tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md tw-bg-white tw-transition-colors focus:tw-outline-none focus:tw-ring-2';

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
