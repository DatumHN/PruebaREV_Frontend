import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { MaskDirective } from './mask.directive';

@Component({
  selector: 'app-formly-field-inputmask',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, MaskDirective],
  template: `
    <input
      type="text"
      [formControl]="$any(formControl)"
      [formlyAttributes]="field"
      [placeholder]="getMaskedPlaceholder()"
      [appMask]="props['mask'] || ''"
      [class]="getInputClasses()"
      [disabled]="props.disabled || false"
      [readonly]="props.readonly || false"
      autocomplete="off"
    />
  `,
})
export class FormlyFieldInputMaskComponent extends FieldType {
  getMaskedPlaceholder(): string {
    const mask = this.props?.['mask'];
    const originalPlaceholder = this.props?.placeholder || '';

    // Si hay máscara, mostrarla como ejemplo
    if (mask && typeof mask === 'string' && mask.trim() !== '') {
      return `${originalPlaceholder} (ej: ${mask})`;
    }

    return originalPlaceholder;
  }

  getInputClasses(): string {
    let baseClasses =
      'tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md tw-transition-colors focus:tw-outline-none focus:tw-ring-2';

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

    // Clases adicionales del props
    if (this.props?.['class']) {
      baseClasses += ` ${this.props['class']}`;
    }

    return baseClasses;
  }
}
