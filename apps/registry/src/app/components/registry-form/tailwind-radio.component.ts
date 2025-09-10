import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-tailwind-radio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div class="tw-space-y-2">
      @for (option of props.options || []; track option.value; let i = $index) {
        <div class="tw-flex tw-items-center">
          <input
            type="radio"
            [id]="field.key + '_' + i"
            [formControl]="$any(formControl)"
            [value]="option.value"
            [disabled]="props.disabled || false"
            class="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300"
          />
          <label
            [for]="field.key + '_' + i"
            class="tw-ml-3 tw-block tw-text-sm tw-font-medium tw-text-gray-700"
            [class.tw-text-gray-500]="props.disabled"
          >
            {{ option.label }}
          </label>
        </div>
      }
    </div>
  `,
})
export class TailwindRadioComponent extends FieldType {}
