import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-tailwind-textarea',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <textarea
      [formControl]="$any(formControl)"
      [formlyAttributes]="field"
      [placeholder]="props.placeholder || ''"
      [class]="getTextareaClasses()"
      [disabled]="props.disabled || false"
      [readonly]="props.readonly || false"
      [rows]="props.rows || 3"
      [attr.minlength]="props.minLength || null"
      [attr.maxlength]="props.maxLength || null"
    ></textarea>
  `,
})
export class TailwindTextareaComponent extends FieldType {
  getTextareaClasses(): string {
    let baseClasses =
      'tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md tw-transition-colors focus:tw-outline-none focus:tw-ring-2 tw-resize-vertical';

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
