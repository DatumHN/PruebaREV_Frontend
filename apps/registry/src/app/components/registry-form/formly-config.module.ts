import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { TooltipModule } from 'primeng/tooltip'; // ✅ 1. Importa el TooltipModule de PrimeNG

// Importa tus componentes personalizados
import { FormlyFieldInputGroupComponent } from './formly-field-input-group.component';
import { TooltipWrapperComponent } from './tooltip-wrapper.component'; // ✅ 2. Importa el nuevo wrapper

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyPrimeNGModule,
    TooltipModule, // ✅ 3. Añádelo a los imports
    // Importa los componentes standalone
    FormlyFieldInputGroupComponent,
    TooltipWrapperComponent,
    FormlyModule.forRoot({
      types: [
        {
          name: 'input-group',
          component: FormlyFieldInputGroupComponent,
          wrappers: ['form-field'],
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
