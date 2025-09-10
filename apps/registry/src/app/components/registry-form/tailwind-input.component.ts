import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { AdvancedMaskDirective, MaskOptions } from '@revfa/shared-mask';

@Component({
  selector: 'app-tailwind-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    AdvancedMaskDirective,
  ],
  template: `
    <input
      [type]="getInputType()"
      [formControl]="$any(formControl)"
      [formlyAttributes]="field"
      [placeholder]="props.placeholder || ''"
      [class]="getInputClasses()"
      [disabled]="props.disabled || false"
      [readonly]="props.readonly || false"
      [attr.minlength]="props.minLength || null"
      [attr.maxlength]="props.maxLength || null"
      [attr.pattern]="
        getInputType() === 'number' ? null : props.pattern || null
      "
      [libAdvancedMask]="getMaskValue()"
      [maskFormat]="getMaskFormat()"
      [maskOptions]="getMaskOptions()"
      (keydown)="onKeyDown($event)"
      autocomplete="off"
    />
  `,
})
export class TailwindInputComponent extends FieldType {
  getInputType(): string {
    // Check for explicit inputType first
    if (this.props?.['inputType']) {
      return this.props['inputType'];
    }

    // Check for type property
    if (this.props?.['type']) {
      return this.props['type'];
    }

    // Check field type from Formly configuration
    if (this.field?.type) {
      const fieldType =
        typeof this.field.type === 'string' ? this.field.type : '';
      switch (fieldType) {
        case 'number':
          return 'number';
        case 'email':
          return 'email';
        case 'password':
          return 'password';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        default:
          return 'text';
      }
    }

    return 'text';
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

  getMaskValue(): string {
    // For number fields, disable masking to avoid conflicts with keydown handler
    if (this.getInputType() === 'number') {
      return '';
    }

    // libAdvancedMask expects the regex pattern for validation
    const patternProp = this.props['pattern'];
    const maskProp = this.props['mask'];
    const fieldName =
      this.props['name'] || this.props['key'] || 'unknown-field';

    // Convert pattern to string for regex validation and clean it
    let regexValue: string =
      typeof patternProp === 'string'
        ? patternProp
        : patternProp
          ? patternProp.toString()
          : '';

    // Clean regex pattern - remove forward slash delimiters if present
    if (regexValue && regexValue.startsWith('/') && regexValue.endsWith('/')) {
      regexValue = regexValue.slice(1, -1);
    }

    console.log(
      `🔍 TailwindInputComponent - Getting mask config for field: ${fieldName}`,
      {
        regexFromProps: this.props['pattern'],
        maskFromProps: this.props['mask'],
        regexValue,
        maskFormat: maskProp,
        allProps: Object.keys(this.props).filter(
          (key) => key.includes('mask') || key.includes('pattern'),
        ),
      },
    );

    // Return regex pattern for libAdvancedMask directive validation
    return regexValue;
  }

  getMaskFormat(): string {
    // For number fields, disable mask format to avoid conflicts with keydown handler
    if (this.getInputType() === 'number') {
      return '';
    }

    // Return the mask format for display formatting (e.g., '99-99999999-9')
    // This comes from campo.mascara in the backend
    const maskFormat: string =
      typeof this.props['mask'] === 'string' ? this.props['mask'] : '';

    return maskFormat;
  }

  getMaskOptions(): MaskOptions {
    return {
      realTimeFormatting: true, // Enable real-time formatting for automatic formatting
      autoComplete: false,
      strictMode: false,
      showErrors: true,
      debounceTime: 0, // No debounce for immediate feedback, typing pause is handled by directive
    };
  }

  onKeyDown(event: KeyboardEvent): void {
    // For number fields, apply special key handling
    if (this.getInputType() === 'number') {
      // Allow: backspace, delete, tab, escape, enter, home, end, left, right
      const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        'Home',
        'End',
        'ArrowLeft',
        'ArrowRight',
      ];

      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      if (
        event.ctrlKey &&
        ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())
      ) {
        return; // Allow these combinations
      }

      // Allow allowed navigation keys
      if (allowedKeys.includes(event.key)) {
        return; // Allow these keys
      }

      // Block: dash/hyphen (-, en-dash, em-dash) to prevent negative numbers
      if (['-', '–', '—', 'Minus'].includes(event.key)) {
        event.preventDefault();
        return;
      }

      // Block: decimal point/comma (since we only allow integers)
      if (['.', ',', 'Period', 'Comma'].includes(event.key)) {
        event.preventDefault();
        return;
      }

      // Handle leading zeros - prevent multiple leading zeros
      const input = event.target as HTMLInputElement;
      const currentValue = input.value;
      const selectionStart = input.selectionStart || 0;

      // If trying to input '0' at the beginning and there's already a '0'
      if (
        event.key === '0' &&
        selectionStart === 0 &&
        currentValue.startsWith('0') &&
        currentValue.length > 0
      ) {
        event.preventDefault();
        return;
      }

      // If trying to input any digit after a leading '0', replace the '0'
      if (
        /^\d$/.test(event.key) &&
        currentValue === '0' &&
        selectionStart === 1
      ) {
        // This will be handled by the normal input flow, just clear the existing '0'
        input.value = '';
      }

      // Only allow digits (0-9)
      if (!/^\d$/.test(event.key)) {
        event.preventDefault();
        return;
      }
    }
  }
}
