import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyDatepickerModule } from '@ngx-formly/primeng/datepicker';

// --- PrimeNG ---
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// --- Módulos y Servicios locales ---
import { FormlyConfigModule } from '../registry-form/formly-config.module';
// --- SERVICIO API ---
import { Api } from '../../services/api/api';
import { AuthStateService } from '@revfa/auth-shared';

/* --- Interfaces --- */
interface StepConfig {
  id: string;
  header: string;
  formlyFields?: FormlyFieldConfig[];
}

interface Campo {
  id: number;
  nombre?: string;
  tipo?: string;
  obligatorio?: string;
  ancho?: string;
  ayuda?: string;
  ejemplo?: string;
  busqueda?: 'S' | 'N';
  mascara?: string;
  validCompleja?: string;
  lonMinima?: number;
  lonMaxima?: number;
  valoresPosibles?: string;
  catalogos?: {
    id: number;
    nombre: string;
    activo: string;
    valoresCatalogos: Array<{
      id: number;
      valor: string;
    }>;
  };
  detalleSolicitud?: { id: number; valor: any }[]; // Actualizado para incluir el ID
}

@Component({
  selector: 'app-registry-approve',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FormlyConfigModule,
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    StepperModule,
    ButtonModule,
    CardModule,
    ToastModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './registry-approve.html',
  styleUrls: ['./registry-approve.css'],
})
export class RegistryApprove implements OnInit, OnDestroy {
  // --- Inyección de Dependencias ---
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private api = inject(Api);
  private authState = inject(AuthStateService);
  private destroy$ = new Subject<void>();

  // --- Propiedades del Componente ---
  solicitudId: string | null = null;
  idtipodoc: string | null = null;
  isLoading = true;
  isSubmitting = false;
  noDataMessage: string | null = null;
  rolUsuario = '';

  // --- Propiedades de Formly y Stepper ---
  activeStepIndex = 0;
  mainForm = new FormGroup({});
  mainModel: any = {};
  stepsConfig: StepConfig[] = [];
  // ✅ SOLUCIÓN: Mapa para almacenar los metadatos originales de cada campo.
  private fieldMetadataMap = new Map<string, any>();

  private mapUserRoleToDisplayRole(): string {
    const userRoles = this.authState.user()?.roles || [];
    if (userRoles.includes('revfa-registrador')) {
      return 'Registrador';
    }
    if (userRoles.includes('revfa-verificador')) {
      return 'Verificador';
    }
    return '';
  }

  ngOnInit(): void {
    this.rolUsuario = this.mapUserRoleToDisplayRole();
    this.solicitudId = this.route.snapshot.paramMap.get('id');
    this.idtipodoc = this.route.snapshot.paramMap.get('idtipodoc');
    if (this.solicitudId && this.idtipodoc) {
      this.loadAndBuildForm();
    } else {
      this.isLoading = false;
      this.noDataMessage =
        'Error: No se ha proporcionado un ID de solicitud válido en la URL.';
      console.error(this.noDataMessage);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAndBuildForm(): void {
    if (!this.solicitudId && !this.idtipodoc) {
      this.isLoading = false;
      this.noDataMessage = 'ID de solicitud no es válido.';
      return;
    }

    this.api
      .getApproveFormById(this.idtipodoc!, this.solicitudId!, this.rolUsuario)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.isLoading = false;
          this.noDataMessage =
            'Error al cargar los datos de la solicitud desde el servidor.';
          console.error(this.noDataMessage, err);
          return of([]);
        }),
      )
      .subscribe((data) => {
        if (data && data.length > 0) {
          this.buildStepsFromData(data);
        } else {
          this.noDataMessage =
            'No se encontró una definición de formulario para esta solicitud.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  private buildStepsFromData(data: any[]): void {
    this.stepsConfig = data.map((section: any) => {
      const stepId = section.id.toString();
      const step: StepConfig = {
        id: stepId,
        header: section.nombre,
        formlyFields: [],
      };

      this.mainModel[stepId] = {};

      if (section.camposSecciones?.length > 0) {
        const directFields = this.buildFieldGroups(
          section.camposSecciones,
          stepId,
        );
        step.formlyFields?.push(...directFields);
      }

      if (section.subSecciones?.length > 0) {
        section.subSecciones.forEach((subSection: any) => {
          step.formlyFields?.push({
            template: `<h4 class="text-xl font-semibold mb-4 mt-6 border-b pb-2 text-gray-700">${subSection.nombre}</h4>`,
          });
          if (subSection.camposSecciones?.length > 0) {
            const subSectionFields = this.buildFieldGroups(
              subSection.camposSecciones,
              stepId,
            );
            step.formlyFields?.push(...subSectionFields);
          }
        });
      }
      return step;
    });

    this.stepsConfig.push({ id: 'approval_actions', header: 'Acciones' });

    this.stepsConfig.forEach((step) => {
      if (step.formlyFields?.length) {
        this.mainForm.addControl(step.id, new FormGroup({}));
      }
    });
  }

  private buildFieldGroups(campos: any[], stepId: string): FormlyFieldConfig[] {
    if (!campos || campos.length === 0) {
      return [];
    }

    const rows: FormlyFieldConfig[] = [];
    let currentRowFields: FormlyFieldConfig[] = [];
    let currentRowWidth = 0;
    const MAX_ROW_WIDTH = 12;

    const getColumnWidth = (ancho: string): number => {
      switch (ancho) {
        case '25%':
          return 3;
        case '33%':
          return 4;
        case '50%':
          return 6;
        case '66%':
          return 8;
        case '75%':
          return 9;
        case '100%':
          return 12;
        default:
          return 12;
      }
    };

    campos.forEach((cs) => {
      const fieldWidth = getColumnWidth(cs.campo.ancho || '100%');

      if (
        currentRowWidth + fieldWidth > MAX_ROW_WIDTH &&
        currentRowFields.length > 0
      ) {
        rows.push({
          fieldGroupClassName: 'tw-grid tw-grid-cols-12 tw-gap-x-6 tw-mb-4',
          fieldGroup: currentRowFields,
        });
        currentRowFields = [];
        currentRowWidth = 0;
      }

      currentRowFields.push(this.createFieldConfig(cs, stepId));
      currentRowWidth += fieldWidth;
    });

    if (currentRowFields.length > 0) {
      rows.push({
        fieldGroupClassName: 'tw-grid tw-grid-cols-12 tw-gap-x-6 tw-mb-4',
        fieldGroup: currentRowFields,
      });
    }

    return rows;
  }

  private createFieldConfig(
    campoSeccion: any,
    stepId: string,
  ): FormlyFieldConfig {
    const campo: Campo = campoSeccion.campo;
    const key = `${campoSeccion.id}_${campo.id}`;

    // ✅ SOLUCIÓN: Guardamos el objeto 'campo' completo para tener acceso a sus metadatos después.
    this.fieldMetadataMap.set(key, campo);

    const initialValue =
      campo.detalleSolicitud && campo.detalleSolicitud.length > 0
        ? campo.detalleSolicitud[0].valor
        : null;

    this.mainModel[stepId][key] = initialValue;

    const config: FormlyFieldConfig = {
      key: key,
      type: this.determinarTipoCampo(campo),
      wrappers: ['tooltip-wrapper'],
      className: this.mapAnchoToColumnClass(campo.ancho || '100%'),
      props: {
        label: campo.nombre ?? '',
        placeholder: `Ingrese ${campo.nombre?.toLowerCase() ?? ''}`,
        required: campo.obligatorio === 'S',
        ayuda: campo.ayuda ?? '',
        ejemplo: campo.ejemplo ?? '',
        ...(campo.lonMinima &&
          campo.lonMinima > 0 && { minLength: campo.lonMinima }),
        ...(campo.lonMaxima &&
          campo.lonMaxima > 0 && { maxLength: campo.lonMaxima }),
        // Propiedades para InputMask - solo agregar si la máscara es válida
        ...(campo.mascara &&
          typeof campo.mascara === 'string' &&
          campo.mascara.trim() !== '' && {
            mask: campo.mascara,
          }),
        // Propiedades para validación regex
        ...(campo.validCompleja && { pattern: campo.validCompleja }),
      },
      expressionProperties: {
        'props.disabled': () => {
          const permissions = campoSeccion.rolesPermisos;
          if (
            !this.rolUsuario ||
            !Array.isArray(permissions) ||
            permissions.length === 0
          ) {
            return true;
          }
          const rolePermission = permissions.find(
            (p: any) => p.nombreRol === this.rolUsuario,
          );
          if (!rolePermission) {
            return true;
          }
          return rolePermission.permiso !== 'E';
        },
      },
      validators: this.buildValidators(campo),
      validation: {
        messages: {
          required: 'Este campo es obligatorio.',
          ...(campo.lonMinima &&
            campo.lonMinima > 0 && {
              minLength: `Debe tener al menos ${campo.lonMinima} caracteres.`,
            }),
          ...(campo.lonMaxima &&
            campo.lonMaxima > 0 && {
              maxLength: `No puede exceder ${campo.lonMaxima} caracteres.`,
            }),
          ...(campo.validCompleja && {
            pattern: `El formato ingresado no es válido.`,
          }),
        },
      },
    };

    // Configurar opciones para campos select basados en catalogos o valoresPosibles
    if (config.type === 'select') {
      if (!config.props) config.props = {};

      // Prioridad 1: Usar catalogos.valoresCatalogos si existe
      if (
        campo.catalogos &&
        Array.isArray(campo.catalogos.valoresCatalogos) &&
        campo.catalogos.valoresCatalogos.length > 0
      ) {
        config.props.options = campo.catalogos.valoresCatalogos.map(
          (catalogoItem: { id: number; valor: string }) => ({
            value: catalogoItem.id,
            label: catalogoItem.valor,
          }),
        );
      }
      // Prioridad 2 (Fallback): Usar la lógica anterior si `valoresPosibles` existe.
      else if (campo.valoresPosibles) {
        config.props.options =
          campo.valoresPosibles?.split(',').map((v: string) => ({
            value: v.trim(),
            label: v.trim(),
          })) || [];
      }
      // Por defecto: Dejar las opciones como un array vacío si no hay fuente de datos.
      else {
        config.props.options = [];
      }
    }

    if (config.type === 'datepicker') {
      if (!config.props) config.props = {};
      config.props['showIcon'] = true;
      config.props['dateFormat'] = 'dd/mm/yy';
      config.props['readonlyInput'] = false; // Permitir entrada manual para mejorar usabilidad
      config.props['showButtonBar'] = true;
      config.props['todayButtonStyleClass'] =
        'p-button-outlined p-button-secondary';
      config.props['clearButtonStyleClass'] =
        'p-button-outlined p-button-secondary';
      config.props['styleClass'] = 'w-full';
      config.props['dataType'] = 'date'; // Asegurar que devuelva objetos Date
      config.props['keepInvalid'] = false; // No mantener valores inválidos

      // ⚠️ VALIDACIÓN TEMPORALMENTE DESHABILITADA
      // No agregar validadores personalizados para datepicker
    }

    return config;
  }

  private mapAnchoToColumnClass(ancho: string): string {
    switch (ancho) {
      case '25%':
        return 'tw-col-span-12 md:tw-col-span-3';
      case '33%':
        return 'tw-col-span-12 md:tw-col-span-4';
      case '50%':
        return 'tw-col-span-12 md:tw-col-span-6';
      case '66%':
        return 'tw-col-span-12 md:tw-col-span-8';
      case '75%':
        return 'tw-col-span-12 md:tw-col-span-9';
      case '100%':
        return 'tw-col-span-12';
      default:
        return 'tw-col-span-12';
    }
  }

  private buildValidators(campo: Campo): any {
    const validators: any = {};

    // Validador de campo obligatorio
    if (campo.obligatorio === 'S') {
      validators.required = {
        expression: (c: any) => {
          if (!c.value) return false;

          // Para campos de texto, verificar que no sea solo espacios en blanco
          if (typeof c.value === 'string') {
            return c.value.trim().length > 0;
          }

          // ⚠️ VALIDACIÓN DE FECHAS TEMPORALMENTE DESHABILITADA
          // Para campos de fecha, aceptar cualquier valor por ahora
          if (c.value instanceof Date) {
            return true; // Aceptar cualquier fecha por ahora
          }

          // Para valores que pueden ser convertidos a fecha (strings de fecha)
          if (typeof c.value === 'string' && c.value.trim() !== '') {
            return true; // Aceptar cualquier string por ahora
          }

          // Para otros tipos de datos (números, objetos, etc.)
          return true;
        },
        message: `Este campo es obligatorio.`,
      };
    }

    // Validador de longitud mínima
    if (campo.lonMinima && campo.lonMinima > 0) {
      validators.minLength = {
        expression: (c: any) => !c.value || c.value.length >= campo.lonMinima!,
        message: `Debe tener al menos ${campo.lonMinima} caracteres.`,
      };
    }

    // Validador de longitud máxima
    if (campo.lonMaxima && campo.lonMaxima > 0) {
      validators.maxLength = {
        expression: (c: any) => !c.value || c.value.length <= campo.lonMaxima!,
        message: `No puede exceder ${campo.lonMaxima} caracteres.`,
      };
    }

    // Validador de expresión regular
    if (campo.validCompleja && campo.validCompleja.trim() !== '') {
      validators.pattern = {
        expression: (c: any) => {
          if (!c.value) return true; // Si no hay valor, la validación pasa
          try {
            const regex = new RegExp(campo.validCompleja!);
            return regex.test(c.value);
          } catch (error) {
            console.error(
              'Error en regex pattern:',
              campo.validCompleja,
              error,
            );
            return true; // Si el regex es inválido, pasar la validación
          }
        },
        message: `El formato ingresado no es válido.`,
      };
    }

    return validators;
  }

  private determinarTipoCampo(campo: Campo): string {
    // Si hay máscara definida y no es null/vacía, usar inputmask independientemente del tipo
    if (
      campo.mascara &&
      typeof campo.mascara === 'string' &&
      campo.mascara.trim() !== ''
    ) {
      return 'inputmask';
    }

    const mapeoTipos: { [key: string]: string } = {
      text: 'input',
      textarea: 'textarea',
      number: 'input',
      date: 'datepicker',
      time: 'input',
      select: 'select',
      dropdown: 'select',
      checkbox: 'checkbox',
      radio: 'radio',
    };

    const tipo = campo.tipo?.toLowerCase() || 'input';
    return mapeoTipos[tipo] || 'input';
  }

  getStepFormGroup(stepId: string): FormGroup {
    return this.mainForm.get(stepId) as FormGroup;
  }

  nextStep(): void {
    const step = this.stepsConfig[this.activeStepIndex];
    if (step.formlyFields && step.formlyFields.length > 0) {
      const formGroup = this.getStepFormGroup(step.id);
      if (formGroup.invalid) {
        formGroup.markAllAsTouched();

        // Buscar campos obligatorios que estén vacíos para mostrar mensaje específico
        const emptyRequiredFields = this.findEmptyRequiredFields(
          step,
          formGroup,
        );
        if (emptyRequiredFields.length > 0) {
          const fieldNames = emptyRequiredFields.join(', ');
          this.messageService.add({
            severity: 'warn',
            summary: 'Campos obligatorios',
            detail: `Los siguientes campos son obligatorios: ${fieldNames}`,
            life: 5000,
          });
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Formulario inválido',
            detail: 'Por favor, corrija los errores antes de continuar.',
            life: 5000,
          });
        }
        return;
      }
    }
    if (this.activeStepIndex < this.stepsConfig.length - 1) {
      this.activeStepIndex++;
    }
  }

  prevStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
    }
  }

  private findEmptyRequiredFields(
    step: StepConfig,
    formGroup: FormGroup,
  ): string[] {
    const emptyRequiredFields: string[] = [];

    if (!step.formlyFields) return emptyRequiredFields;

    // Función recursiva para buscar campos en formularios anidados
    const searchFields = (fields: FormlyFieldConfig[]) => {
      fields.forEach((field) => {
        // Si el campo tiene fieldGroup (es un grupo), buscar recursivamente
        if (field.fieldGroup) {
          searchFields(field.fieldGroup);
        }
        // Si es un campo individual
        else if (field.key) {
          const control = formGroup.get(field.key as string);
          // ⚠️ EXCLUIR DATEPICKERS DE LA VALIDACIÓN
          if (
            control &&
            field.props?.required &&
            control.invalid &&
            field.type !== 'datepicker'
          ) {
            const fieldName = field.props?.label || (field.key as string);
            emptyRequiredFields.push(fieldName);
          }
        }
      });
    };

    searchFields(step.formlyFields);
    return emptyRequiredFields;
  }

  submitDecision(status: 'Aprobado' | 'Rechazado'): void {
    if (!this.solicitudId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay un ID de solicitud para procesar.',
      });
      return;
    }

    if (status === 'Aprobado' && this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();

      // Buscar campos obligatorios que estén vacíos en todos los pasos
      const allEmptyRequiredFields: string[] = [];
      this.stepsConfig.forEach((step) => {
        if (step.formlyFields && step.formlyFields.length > 0) {
          const formGroup = this.getStepFormGroup(step.id);
          const emptyFields = this.findEmptyRequiredFields(step, formGroup);
          allEmptyRequiredFields.push(...emptyFields);
        }
      });

      if (allEmptyRequiredFields.length > 0) {
        const fieldNames = allEmptyRequiredFields.join(', ');
        this.messageService.add({
          severity: 'warn',
          summary: 'Campos obligatorios',
          detail: `Los siguientes campos son obligatorios para aprobar: ${fieldNames}`,
          life: 7000,
        });
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Formulario Inválido',
          detail:
            'Hay campos inválidos. Por favor, revise los datos antes de aprobar.',
          life: 5000,
        });
      }
      return;
    }

    this.isSubmitting = true;

    let payload: any = {
      id: this.solicitudId,
      tipoDocumento: { id: this.idtipodoc },
      //fechaSolicitud: '25-08-2025',
      //correlativo: REF-NAC-001-2025
      estado: status,
    };

    if (status === 'Aprobado') {
      const detallesSolicitudes = Object.keys(this.mainModel).flatMap(
        (stepId) =>
          Object.keys(this.mainModel[stepId]).map((compositeKey) => {
            const [idSeccion, campoId] = compositeKey.split('_');

            const originalCampo = this.fieldMetadataMap.get(compositeKey);

            const detalleId = originalCampo?.detalleSolicitud?.[0]?.id ?? null;

            return {
              id: detalleId,
              valor: this.mainModel[stepId][compositeKey] || '',
              campos: { id: parseInt(campoId, 10) },
              campoSeccion: parseInt(idSeccion, 10),
            };
          }),
      );

      payload = {
        ...payload,
        detallesSolicitudes: detallesSolicitudes,
      };
    }

    this.api
      .updateRequestStatus(status, this.solicitudId, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `La solicitud ha sido ${status} correctamente.`,
          });

          setTimeout(() => {
            this.router.navigate(['/inicio/approve-table']);
          }, 2000);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error de Envío',
            detail: 'No se pudo actualizar el estado de la solicitud.',
          });
          console.error('Error al actualizar estado:', err);
        },
      });
  }
}
