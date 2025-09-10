import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
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
  private destroy$ = new Subject<void>();

  // --- Propiedades del Componente ---
  solicitudId: string | null = null;
  isLoading = true;
  isSubmitting = false;
  noDataMessage: string | null = null;
  rolUsuario = 'Registrador'; 

  // --- Propiedades de Formly y Stepper ---
  activeStepIndex = 0;
  mainForm = new FormGroup({});
  mainModel: any = {};
  stepsConfig: StepConfig[] = [];
  // ✅ SOLUCIÓN: Mapa para almacenar los metadatos originales de cada campo.
  private fieldMetadataMap = new Map<string, any>();


  ngOnInit(): void {
    this.solicitudId = this.route.snapshot.paramMap.get('id');
    if (this.solicitudId) {
      this.loadAndBuildForm();
    } else {
      this.isLoading = false;
      this.noDataMessage = 'Error: No se ha proporcionado un ID de solicitud válido en la URL.';
      console.error(this.noDataMessage);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAndBuildForm(): void {
    if (!this.solicitudId) {
      this.isLoading = false;
      this.noDataMessage = 'ID de solicitud no es válido.';
      return;
    }

    this.api.getApproveFormById(this.solicitudId, this.rolUsuario).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.isLoading = false;
        this.noDataMessage = 'Error al cargar los datos de la solicitud desde el servidor.';
        console.error(this.noDataMessage, err);
        return of([]); 
      })
    ).subscribe(data => {
      if (data && data.length > 0) {
        this.buildStepsFromData(data);
      } else {
        this.noDataMessage = 'No se encontró una definición de formulario para esta solicitud.';
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
        const directFields = this.buildFieldGroups(section.camposSecciones, stepId);
        step.formlyFields?.push(...directFields);
      }

      if (section.subSecciones?.length > 0) {
        section.subSecciones.forEach((subSection: any) => {
          step.formlyFields?.push({
            template: `<h4 class="text-xl font-semibold mb-4 mt-6 border-b pb-2 text-gray-700">${subSection.nombre}</h4>`,
          });
          if (subSection.camposSecciones?.length > 0) {
            const subSectionFields = this.buildFieldGroups(subSection.camposSecciones, stepId);
            step.formlyFields?.push(...subSectionFields);
          }
        });
      }
      return step;
    });

    this.stepsConfig.push({ id: 'approval_actions', header: 'Acciones' });

    this.stepsConfig.forEach(step => {
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
        case '25%': return 3;
        case '33%': return 4;
        case '50%': return 6;
        case '66%': return 8;
        case '75%': return 9;
        case '100%': return 12;
        default: return 12;
      }
    };

    campos.forEach((cs) => {
      const fieldWidth = getColumnWidth(cs.campo.ancho || '100%');

      if (currentRowWidth + fieldWidth > MAX_ROW_WIDTH && currentRowFields.length > 0) {
        rows.push({
          fieldGroupClassName: 'grid grid-cols-12 gap-x-6 mb-4',
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
        fieldGroupClassName: 'grid grid-cols-12 gap-x-6 mb-4',
        fieldGroup: currentRowFields,
      });
    }

    return rows;
  }

  private createFieldConfig(campoSeccion: any, stepId: string): FormlyFieldConfig {
    const campo: Campo = campoSeccion.campo;
    const key = `${campoSeccion.id}_${campo.id}`;

    // ✅ SOLUCIÓN: Guardamos el objeto 'campo' completo para tener acceso a sus metadatos después.
    this.fieldMetadataMap.set(key, campo);

    const initialValue = (campo.detalleSolicitud && campo.detalleSolicitud.length > 0)
      ? campo.detalleSolicitud[0].valor
      : null;

    this.mainModel[stepId][key] = initialValue;

    const config: FormlyFieldConfig = {
      key: key,
      type: this.mapFieldType(campo.tipo),
      className: this.mapAnchoToColumnClass(campo.ancho || '100%'),
      props: {
        label: campo.nombre ?? '',
        placeholder: campo.ejemplo ?? `Valor para ${campo.nombre?.toLowerCase()}`,
        required: campo.obligatorio === 'S',
        description: campo.ayuda ?? '',
      },
      expressionProperties: {
        'props.disabled': () => {
          const permissions = campoSeccion.rolesPermisos;
          if (!this.rolUsuario || !Array.isArray(permissions) || permissions.length === 0) {
            return true;
          }
          const rolePermission = permissions.find(
            (p: any) => p.nombreRol === this.rolUsuario
          );
          if (!rolePermission) {
            return true;
          }
          return rolePermission.permiso !== 'E';
        },
      },
    };
    
    if (config.type === 'datepicker' && config.props) {
        config.props['showIcon'] = true;
        config.props['dateFormat'] = 'mm/dd/yy';
        config.props['styleClass'] = 'w-full';
    }

    return config;
  }

  private mapFieldType(tipo?: string): string {
    const typeMap: { [key: string]: string } = {
      text: 'input',
      number: 'input',
      date: 'datepicker',
      time: 'input',
      select: 'select',
      textarea: 'textarea',
    };
    return tipo ? typeMap[tipo.toLowerCase()] || 'input' : 'input';
  }

  private mapAnchoToColumnClass(ancho: string): string {
    switch (ancho) {
      case '25%': return 'col-span-12 md:col-span-3';
      case '33%': return 'col-span-12 md:col-span-4';
      case '50%': return 'col-span-12 md:col-span-6';
      case '66%': return 'col-span-12 md:col-span-8';
      case '75%': return 'col-span-12 md:col-span-9';
      case '100%': return 'col-span-12';
      default: return 'col-span-12';
    }
  }

  getStepFormGroup(stepId: string): FormGroup {
    return this.mainForm.get(stepId) as FormGroup;
  }

  nextStep(): void {
    if (this.activeStepIndex < this.stepsConfig.length - 1) {
      this.activeStepIndex++;
    }
  }

  prevStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
    }
  }
  
  submitDecision(status: 'Aprobado' | 'Rechazado'): void {
    if (!this.solicitudId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No hay un ID de solicitud para procesar.' });
      return;
    }

    if (status === 'Aprobado' && this.mainForm.invalid) {
      this.mainForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulario Inválido', detail: 'Hay campos inválidos. Por favor, revise los datos antes de aprobar.' });
      return;
    }

    this.isSubmitting = true;

    let payload: any = {
      id: this.solicitudId,
      tipoDocumento: { id: 5 },
      fechaSolicitud: "25-08-2025"
      //correlativo: REF-NAC-001-2025 
      //estado: status
    };

    if (status === 'Aprobado') {

      const detallesSolicitudes = Object.keys(this.mainModel).flatMap((stepId) =>
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
        detallesSolicitudes: detallesSolicitudes
      };
    }
    
    this.api.updateRequestStatus(status, this.solicitudId, payload).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `La solicitud ha sido ${status} correctamente.` });
        
        setTimeout(() => {
          this.router.navigate(['/ruta-a-lista-de-solicitudes']);
        }, 2000);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error de Envío', detail: 'No se pudo actualizar el estado de la solicitud.' });
        console.error('Error al actualizar estado:', err);
      }
    });
  }
}
