import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-formly-tooltip-wrapper',

  standalone: true,
  imports: [CommonModule, FormlyModule, TooltipModule],
  template: `
    <div class="mb-4 w-full">
      @if (props.label) {
        <label [for]="id" class="font-bold mb-2 block">
          {{ props.label }}
          @if (props.required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <div class="flex items-center w-full gap-2">
        <div class="flex-grow w-full min-w-0">
          <ng-container #fieldComponent></ng-container>
        </div>

        @if (props['ayuda']) {
          <i
            class="pi pi-info-circle text-blue-500 text-xl cursor-pointer flex-shrink-0"
            [pTooltip]="tooltipTemplate"
            [tooltipOptions]="{
              escape: false,
              tooltipStyleClass: 'custom-tooltip',
            }"
          >
          </i>
        }
      </div>
    </div>

    <ng-template #tooltipTemplate>
      <div class="p-2">
        @if (props['ejemplo']) {
          <div class="text-center font-bold mb-2">{{ props['ejemplo'] }}</div>
        }
        <div class="text-left">{{ props['ayuda'] }}</div>
      </div>
    </ng-template>
  `,
})
export class TooltipWrapperComponent extends FieldWrapper {}
