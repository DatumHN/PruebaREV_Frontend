import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormlyModule } from '@ngx-formly/core';
import { TooltipModule } from 'primeng/tooltip'; // ✅ 1. Importa el TooltipModule de PrimeNG (temporary)

// Importa tus componentes personalizados
import { FormlyFieldInputGroupComponent } from './formly-field-input-group.component';
import { TooltipWrapperComponent } from './tooltip-wrapper.component'; // ✅ 2. Importa el nuevo wrapper
import { FormlyFieldInputMaskComponent } from './formly-field-inputmask.component';

// Importa los nuevos componentes Tailwind
import { TailwindInputComponent } from './tailwind-input.component';
import { TailwindSelectComponent } from './tailwind-select.component';
import { TailwindDatepickerComponent } from './tailwind-datepicker.component';
import { TailwindRadioComponent } from './tailwind-radio.component';
import { TailwindCheckboxComponent } from './tailwind-checkbox.component';
import { TailwindTextareaComponent } from './tailwind-textarea.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule, // ✅ 3. Añádelo a los imports (temporary - will be removed later)
    // Importa los componentes standalone
    FormlyFieldInputGroupComponent,
    TooltipWrapperComponent,
    FormlyFieldInputMaskComponent,
    // Importa los nuevos componentes Tailwind
    TailwindInputComponent,
    TailwindSelectComponent,
    TailwindDatepickerComponent,
    TailwindRadioComponent,
    TailwindCheckboxComponent,
    TailwindTextareaComponent,
    FormlyModule.forRoot({
      types: [
        // Custom components
        {
          name: 'input-group',
          component: FormlyFieldInputGroupComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'inputmask',
          component: FormlyFieldInputMaskComponent,
          wrappers: ['tooltip-wrapper'],
        },
        // New Tailwind components (replace PrimeNG defaults)
        {
          name: 'input',
          component: TailwindInputComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'select',
          component: TailwindSelectComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'datepicker',
          component: TailwindDatepickerComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'radio',
          component: TailwindRadioComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'checkbox',
          component: TailwindCheckboxComponent,
          wrappers: ['tooltip-wrapper'],
        },
        {
          name: 'textarea',
          component: TailwindTextareaComponent,
          wrappers: ['tooltip-wrapper'],
        },
      ],
      // ✅ 4. Registra el nuevo wrapper
      wrappers: [
        { name: 'tooltip-wrapper', component: TooltipWrapperComponent },
      ],
    }),
  ],
  exports: [FormlyModule],
})
export class FormlyConfigModule {}
