import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-tailwind-checkbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="tw-flex tw-items-center">
      <input
        type="checkbox"
        [id]="field.key"
        [formControl]="$any(formControl)"
        [disabled]="props.disabled || false"
        class="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
      />
      <label
        [for]="field.key"
        class="tw-ml-3 tw-block tw-text-sm tw-font-medium tw-text-gray-700"
        [class.tw-text-gray-500]="props.disabled"
      >
        {{ props.label }}
      </label>
    </div>
  `,
})
export class TailwindCheckboxComponent extends FieldType {}
