import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-formly-field-input-group',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyPrimeNGModule,
    InputGroupModule,
    InputTextModule,
    ButtonModule,
  ],
  template: `
    <p-input-group styleClass="w-full">
      <input
        pInputText
        [formControl]="formControl"
        [formlyAttributes]="field"
        class="w-full"
      />
      <p-button
        label="Search"
        class="p-button-secondary"
        (click)="onSearch()"
      ></p-button>
    </p-input-group>
  `,
  styles: [
    `
      :host {
        width: 100%;
        display: block;
      }

      ::ng-deep p-input-group {
        width: 100%;
        display: flex;
      }

      ::ng-deep p-input-group .p-inputtext {
        flex: 1;
        width: auto;
      }
    `,
  ],
})
export class FormlyFieldInputGroupComponent extends FieldType<FieldTypeConfig> {
  onSearch() {
    if (this.props['onSearchClick']) {
      this.props['onSearchClick'](this.field);
    }
  }
}
