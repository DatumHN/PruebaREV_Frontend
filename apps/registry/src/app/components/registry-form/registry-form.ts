import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom, Subject, of } from 'rxjs';
import {
  takeUntil,
  delay,
  catchError,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { FormlyFieldConfig } from '@ngx-formly/core';

// --- PrimeNG ---
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { TailwindToastService } from './tailwind-toast.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// --- Servicios y Utilidades ---
import { Api, Principales } from '../../services/api/api';
import { LogoData } from '../../services/logo/logo';
import {
  PdfService,
  JsonGeneral,
  JsonTitular,
  SolicitudResponse,
} from '../../services/pdf-service/pdf-service';
import { ModalPdf } from '../modal-pdf/modal-pdf';
import { FormlyConfigModule } from './formly-config.module';
import { getRequestDocumentDefinition } from '../../utils/birth-request-document-definition';
import { FieldValueMapperService } from '../../services/test-data/field-value-mapper.service';
import { LogoSelectorComponent } from '../logo-selector/logo-selector';
import { AuthStateService } from '@revfa/auth-shared';
import { TailwindStepperComponent } from './tailwind-stepper.component';
import { TailwindToastContainerComponent } from './tailwind-toast-container.component';
import { TailwindMessageComponent } from './tailwind-message.component';
import { TailwindInputComponent } from './tailwind-input.component';

/* --- Interfaces --- */
interface StepConfig {
  id: string;
  header: string;
  formlyFields?: FormlyFieldConfig[];
}

// Interfaz actualizada para incluir la nueva estructura de catálogos
interface Campo {
  tipo?: string;
  obligatorio?: string;
  ancho?: string;
  nombre?: string;
  ayuda?: string;
  ejemplo?: string;
  id?: string;
  busqueda?: 'S' | 'N';
  lonMinima?: number;
  lonMaxima?: number;
  mascara?: string;
  mask?: string;
  regex?: string;
  validCompleja?: string;
  catalogos?: {
    id: number;
    nombre: string;
    valoresCatalogos: {
      id: number;
      valor: string;
    }[];
  };
}

interface PersonSearchResult {
  nombre: string;
  direccion: string;
  fotoUrl: string;
  dui: string;
}

interface Anexo {
  nombre: string;
  archivo: File;
}

interface AnexoEsperado {
  nombre: string;
}

interface FieldMapping {
  targetField: string;
  sections: string[];
  fields: string[];
  separator?: string;
  required?: boolean;
  validator?: (value: string) => boolean;
}

interface PdfFieldCache {
  [key: string]: string;
}

export function requireOneOf(controlName1: string, controlName2: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const control1 = group.get(controlName1);
    const control2 = group.get(controlName2);
    if (!control1 || !control2) return null;
    return !control1.value && !control2.value ? { requireOne: true } : null;
  };
}

@Component({
  selector: 'app-registry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyConfigModule,
    ButtonModule,
    DialogModule,
    CardModule,
    InputGroupModule,
    InputTextModule,
    TooltipModule,
    DividerModule,
    HttpClientModule,
    ProgressSpinnerModule,
    LogoSelectorComponent,
    TailwindStepperComponent,
    TailwindToastContainerComponent,
    TailwindMessageComponent,
    TailwindInputComponent,
  ],
  providers: [DialogService],
  templateUrl: './registry-form.html',
  styleUrls: ['./registry-form.css'],
})
export class RegistryForm implements OnInit, OnDestroy, AfterViewInit {
  private api = inject(Api);
  private pdfService = inject(PdfService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private toastService = inject(TailwindToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zone = inject(NgZone);
  private fieldValueMapper = inject(FieldValueMapperService);
  private authState = inject(AuthStateService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isPdfDataReady = false;
  activeStepIndex = 0;
  topForm = new FormGroup({});
  topModel: any = {};
  topFields: FormlyFieldConfig[] = [];
  mainForm = new FormGroup({});
  mainModel: any = {};
  stepsConfig: StepConfig[] = [];
  dialogRef: DynamicDialogRef | undefined;
  private destroy$ = new Subject<void>();
  isLoading = false;
  isSubmitting = false;
  noDataMessage: string | null = null;
  rolSeleccionado = '';
  etapaSeleccionadaId = 1;
  formDataParaPdf: any;
  selectedLogo: LogoData | null = null;
  logoBase64: string | null = null;

  // PDF field mapping configuration
  private readonly PDF_FIELD_MAPPINGS: FieldMapping[] = [
    {
      targetField: 'header.lugarFechaHora',
      sections: ['Inscrito'],
      fields: ['Fecha Nacimiento'],
      required: true,
    },
    {
      targetField: 'header.codigoPresentacion',
      sections: ['solicitud'],
      fields: ['correlativo'],
      required: true,
    },
    {
      targetField: 'header.emailContacto',
      sections: ['Informante'],
      fields: ['Número de Documento'], // Campo disponible como contacto
      required: false,
    },
    {
      targetField: 'header.plazoRespuesta',
      sections: ['solicitud'],
      fields: ['fechaSolicitud'],
      required: true,
    },
    {
      targetField: 'solicitante.tipoPersona',
      sections: ['Informante'],
      fields: ['Sexo'],
      required: true,
    },
    {
      targetField: 'solicitante.documentoTipo',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: ['Tipo Documento'],
      required: true,
    },
    {
      targetField: 'solicitante.documentoNumero',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: ['Número de Documento'],
      required: true,
    },
    {
      targetField: 'solicitante.domicilio',
      sections: ['Informante', 'DIRECCIÓN SEGÚN DUI'],
      fields: ['Departamento', 'Distrito/Ciudad'],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'solicitante.nombreCompleto',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'solicitante.esTituler',
      sections: ['Informante'],
      fields: ['Parentesco'],
      required: false,
    },
    {
      targetField: 'solicitante.caracter',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: ['Parentesco'],
      required: true,
    },
    {
      targetField: 'titular.documentoTipo',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: ['Tipo Documento'],
      required: true,
    },
    {
      targetField: 'titular.documentoNumero',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: ['Número de Documento'],
      required: true,
    },
    {
      targetField: 'titular.nombreCompleto',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'titular.fechaHecho',
      sections: ['Inscrito'],
      fields: ['Fecha Nacimiento'],
      required: true,
    },
    {
      targetField: 'titular.lugarHecho',
      sections: ['Inscrito', 'LUGAR Y DIRECCIÓN DE NACIMIENTO'],
      fields: ['Lugar especifico'],
      required: true,
    },
    {
      targetField: 'titular.nombreMadre',
      sections: ['Madre', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'titular.nombrePadre',
      sections: ['Padre', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'declaracion.inscripcionPrincipal',
      sections: ['Inscrito'],
      fields: ['CUN'],
      required: true,
    },
    {
      targetField: 'declaracion.anotacionMarginal',
      sections: ['Inscrito'],
      fields: ['Número de Boleta'],
      required: true,
    },
    {
      targetField: 'documentacion.presentada',
      sections: ['Informante'],
      fields: ['Tipo Documento'],
      required: true,
    },
    {
      targetField: 'firmas.nombreSolicitante',
      sections: ['Informante', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
    {
      targetField: 'firmas.nombreRef',
      sections: ['Padre', 'DATOS GENERALES'],
      fields: [
        'Primer Nombre',
        'Segundo Nombre',
        'Tercer Nombre',
        'Primer Apellido',
        'Segundo Apellido',
      ],
      separator: ' ',
      required: true,
    },
  ];

  private pdfFieldCache: PdfFieldCache = {};

  // Modal de búsqueda
  isSearchModalVisible = false;
  searchModalTitle = '';
  isSearching = false;
  searchError: string | null = null;
  searchResults: PersonSearchResult[] = [];
  private fieldToUpdateFromSearch: FormlyFieldConfig | null = null;

  // Modal de anexo
  isAnexoModalVisible = false;
  anexoForm: FormGroup;
  anexosSubidos: Anexo[] = [];
  anexosEsperados: AnexoEsperado[] = [];
  nombresPredefinidos: string[] = [];
  selectedFile: File | null = null;
  isDragOver = false;

  // Autocomplete properties for anexo form
  isAutocompleteOpen = false;
  isAutocompleteLoading = false;
  autocompleteQuery = '';
  filteredSugerencias: string[] = [];
  highlightedIndex = -1;
  highlightedOptionId = '';
  autocompleteListId =
    'autocomplete-list-' + Math.random().toString(36).substr(2, 9);

  idTipoDocumento = -1;
  correlativoG = '';
  solicitudIdFromWelcome: number | null = null;
  rolUsuario = '';
  topSelectionCompleted = false;

  // Registry types data for dynamic title
  private readonly registryTypes = [
    {
      id: 1,
      idSuperior: 0,
      nombre: 'Nacimiento',
      plazoRespuesta: 5,
      secuencia: 1,
      activo: 'S',
      tipoCorrelativo: 'NAC',
      etiqueta: 'Tipo de partida',
    },
    {
      id: 86,
      idSuperior: 0,
      nombre: 'Matrimonio',
      plazoRespuesta: 5,
      secuencia: 2,
      activo: 'S',
      tipoCorrelativo: 'MAT',
      etiqueta: 'Tipo de partida',
    },
    {
      id: 109,
      idSuperior: 0,
      nombre: 'Unión no Matrimonial',
      plazoRespuesta: 5,
      secuencia: 3,
      activo: 'S',
      tipoCorrelativo: 'UNM',
      etiqueta: 'Tipo de partida',
    },
    {
      id: 112,
      idSuperior: 0,
      nombre: 'Defunción',
      plazoRespuesta: 5,
      secuencia: 4,
      activo: 'S',
      tipoCorrelativo: 'DEF',
      etiqueta: 'Tipo de partida',
    },
    {
      id: 147,
      idSuperior: 0,
      nombre: 'Defunción Fetal',
      plazoRespuesta: 5,
      secuencia: 5,
      activo: 'S',
      tipoCorrelativo: 'DFF',
      etiqueta: 'Tipo de partida',
    },
  ];

  currentRegistryTypeName = 'Nacimiento';

  constructor() {
    this.anexoForm = this.fb.group(
      {
        nombrePredefinido: [null],
        nombrePersonalizado: [''],
        archivo: [null, Validators.required],
      },
      { validators: requireOneOf('nombrePredefinido', 'nombrePersonalizado') },
    );
  }

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

  private updateRegistryTypeName(registryId: number): void {
    const registryType = this.registryTypes.find(
      (type) => type.id === registryId,
    );
    this.currentRegistryTypeName = registryType
      ? registryType.nombre
      : 'Nacimiento';
  }

  ngOnInit() {
    console.log('RegistryForm ngOnInit iniciado');

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.rolUsuario = this.mapUserRoleToDisplayRole();
        this.solicitudIdFromWelcome = +params['id'];
        this.updateRegistryTypeName(+params['id']);

        this.initializeFormFlow();
        this.initializeComponent();
        this.loadAnexosEsperados();
      } else {
        console.warn(
          'No se proporcionó un ID de solicitud. Redirigiendo a la bienvenida.',
        );
        this.router.navigate(['/welcome']);
      }
    });
  }

  ngAfterViewInit() {
    console.log('RegistryForm ngAfterViewInit completado');
    this.cdr.detectChanges();
  }

  // ========================================================
  // ===          MÉTODOS DE GESTIÓN DE ANEXOS (SOLUCIÓN) ===
  // ========================================================

  loadAnexosEsperados() {
    this.anexosEsperados = [
      { nombre: 'Partida de Nacimiento del Padre' },
      { nombre: 'Partida de Nacimiento de la Madre' },
      { nombre: 'Constancia Médica de Nacimiento' },
      { nombre: 'DUI de Testigo 1' },
      { nombre: 'DUI de Testigo 2' },
    ];
    this.nombresPredefinidos = this.anexosEsperados.map(
      (anexo) => anexo.nombre,
    );
  }

  openAnexoModal() {
    console.log('Abriendo modal de anexo...');
    this.anexoForm.reset();
    this.selectedFile = null;

    // Reset autocomplete state
    this.isAutocompleteOpen = false;
    this.isAutocompleteLoading = false;
    this.autocompleteQuery = '';
    this.filteredSugerencias = [...this.nombresPredefinidos];
    this.highlightedIndex = -1;
    this.highlightedOptionId = '';

    setTimeout(() => {
      // Clear file input
      const fileInput = document.getElementById(
        'anexoFile',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }, 0);

    this.isAnexoModalVisible = true;
    this.cdr.detectChanges();
  }

  /**
   * Cierra el modal, asegurando que se ejecute
   * dentro de la zona de Angular para que la vista se actualice.
   */
  closeAnexoModal() {
    this.zone.run(() => {
      console.log('Solicitando cierre de modal DENTRO de NgZone...');
      this.isAnexoModalVisible = false;
    });
  }

  onAnexoModalHide() {
    console.log(
      'Evento onHide disparado - Limpiando estado del modal de anexo',
    );
    this.anexoForm.reset();
    this.selectedFile = null;

    // Reset autocomplete state
    this.isAutocompleteOpen = false;
    this.isAutocompleteLoading = false;
    this.autocompleteQuery = '';
    this.filteredSugerencias = [];
    this.highlightedIndex = -1;
    this.highlightedOptionId = '';

    // Clear file input
    const fileInput = document.getElementById('anexoFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    this.cdr.detectChanges();
  }

  onFileSelect(event: { files: File[] }) {
    if (event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];
      this.anexoForm.patchValue({ archivo: this.selectedFile });
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.anexoForm.patchValue({ archivo: null });
  }

  // Dropzone methods
  onDropzoneClick(event: Event) {
    // Prevent default behavior and stop event propagation
    event.preventDefault();
    event.stopPropagation();
    this.triggerFileInput();
  }

  triggerFileInput() {
    // Use ViewChild for reliable file input access
    if (this.fileInput?.nativeElement) {
      // Use setTimeout to ensure the element is ready and avoid click issues
      setTimeout(() => {
        this.fileInput.nativeElement.click();
      }, 0);
    } else {
      // Fallback to document query if ViewChild is not available
      const fileInput = document.querySelector(
        '#anexoFile',
      ) as HTMLInputElement;
      if (fileInput) {
        setTimeout(() => {
          fileInput.click();
        }, 0);
      } else {
        console.warn(
          'File input element not found - neither ViewChild nor document query worked',
        );
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File) {
    // Validate file type
    if (file.type !== 'application/pdf') {
      this.toastService.addError(
        'Tipo de archivo no válido',
        'Solo se permiten archivos PDF.',
      );
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.toastService.addError(
        'Tamaño de archivo no válido',
        'El tamaño máximo permitido es 10MB.',
      );
      return;
    }

    this.selectedFile = file;
    this.anexoForm.patchValue({ archivo: file });
  }

  removeFile(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.clearFile();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get nombrePredefinidoOptions() {
    return this.nombresPredefinidos.map((nombre) => ({
      value: nombre,
      label: nombre,
    }));
  }

  guardarAnexo() {
    this.anexoForm.markAllAsTouched();

    if (this.anexoForm.invalid) {
      this.toastService.addWarn(
        'Formulario Incompleto',
        'Debe proporcionar un nombre (predefinido o personalizado) y seleccionar un archivo PDF.',
      );
      return;
    }

    const nombre =
      this.anexoForm.value.nombrePersonalizado ||
      this.anexoForm.value.nombrePredefinido;

    if (!nombre || !this.selectedFile) {
      this.toastService.addError(
        'Error',
        'Ocurrió un problema al obtener el nombre o el archivo.',
      );
      return;
    }

    const nuevoAnexo: Anexo = {
      nombre: nombre,
      archivo: this.selectedFile,
    };

    this.anexosSubidos = [...this.anexosSubidos, nuevoAnexo];

    this.toastService.addSuccess(
      'Éxito',
      `Anexo "${nombre}" agregado correctamente.`,
    );

    this.closeAnexoModal();
  }

  eliminarAnexo(index: number) {
    if (index >= 0 && index < this.anexosSubidos.length) {
      const anexoEliminado = this.anexosSubidos[index];
      this.anexosSubidos.splice(index, 1);
      this.anexosSubidos = [...this.anexosSubidos];

      this.toastService.addInfo(
        'Anexo Eliminado',
        `Se eliminó el anexo: ${anexoEliminado.nombre}`,
      );
    }
  }

  // ========================================================
  // ===          RESTO DE MÉTODOS DEL COMPONENTE         ===
  // ========================================================

  private initializeFormFlow(): void {
    if (!this.rolUsuario || !this.solicitudIdFromWelcome) {
      console.error(
        'No se puede iniciar el formulario: falta el rol de usuario o el ID de la solicitud.',
      );
      this.noDataMessage =
        'No se pudo cargar la configuración inicial del formulario.';
      return;
    }

    this.rolSeleccionado = this.rolUsuario;

    this.api
      .getSelectsById(this.solicitudIdFromWelcome.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Principales[]) => {
          if (data && data.length > 0) {
            const firstFieldKey = data[0].etiqueta;
            const firstFieldLabel = data[0].etiqueta;
            const options = data.map((item) => ({
              value: item.id,
              label: item.nombre,
            }));

            const initialField = this.createNewTopField(
              firstFieldKey,
              firstFieldLabel,
              options,
            );
            this.topFields = [
              {
                fieldGroupClassName: 'tw-grid tw-grid-cols-12 tw-gap-4',
                fieldGroup: [initialField],
              },
            ];
          }
        },
        error: (err) => {
          console.error(
            'Error al cargar la configuración inicial del formulario:',
            err,
          );
          this.noDataMessage = 'Error al cargar la configuración inicial.';
        },
      });
  }

  private initializeComponent(): void {
    this.api
      .getBirthCertificateData()
      .pipe(
        catchError((error) => {
          console.error(
            'Error CRÍTICO al cargar la plantilla de datos del PDF.',
            error,
          );
          this.toastService.addError(
            'Error de Carga',
            'No se pudo cargar la plantilla para la vista previa.',
          );
          return of(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (pdfDataResult) => {
          if (pdfDataResult) {
            this.formDataParaPdf = pdfDataResult;
            this.isPdfDataReady = true;
            console.log(
              'Datos para la vista previa del PDF cargados correctamente.',
            );
          } else {
            this.isPdfDataReady = false;
            console.error(
              'Fallo la carga de datos iniciales para el PDF (plantilla no disponible).',
            );
          }
        },
      });
  }

  showPdfWithDynamicData(): void {
    if (!this.isPdfDataReady || !this.logoBase64) {
      this.toastService.addWarn(
        'Datos no listos',
        'Por favor, espere a que los datos carguen y seleccione un logo.',
      );
      return;
    }

    const dynamicFormData = this._buildPdfJson();
    const docDef = getRequestDocumentDefinition(
      dynamicFormData,
      this.logoBase64,
    );

    this.dialogRef = this.dialogService.open(ModalPdf, {
      header: 'Vista Previa de Solicitud de Registro',
      width: '85%',
      height: '90%',
      modal: true,
      maximizable: true,
      data: {
        docDefinition: docDef,
      },
    });

    this.dialogRef.onClose.subscribe(() => {
      this.dialogRef = undefined;
    });
  }

  async submitForm(): Promise<void> {
    // Validar todos los pasos excluyendo datepickers
    let allStepsValid = true;
    const invalidSteps: string[] = [];

    this.stepsConfig.forEach((step) => {
      if (
        step.formlyFields &&
        step.formlyFields.length > 0 &&
        step.id !== 'completion'
      ) {
        const formGroup = this.getStepFormGroup(step.id);
        if (!this.isStepValidExcludingDatepickers(step, formGroup)) {
          allStepsValid = false;
          invalidSteps.push(step.header);
        }
      }
    });

    if (!allStepsValid || this.topForm.invalid) {
      this.topForm.markAllAsTouched();
      this.mainForm.markAllAsTouched();
      this.toastService.addWarn(
        'Formulario Incompleto',
        invalidSteps.length > 0
          ? `Por favor, complete los campos requeridos en: ${invalidSteps.join(', ')}`
          : 'Por favor, complete todos los campos requeridos.',
      );
      return;
    }

    this.isSubmitting = true;

    try {
      const finalPayload = {
        correlativo: this.correlativoG,
        fechaSolicitud: new Date().toISOString().split('T')[0],
        tipoDocumento: { id: this.idTipoDocumento },
        detallesSolicitudes: Object.keys(this.mainModel).flatMap((stepId) =>
          Object.keys(this.mainModel[stepId]).map((compositeKey) => {
            const [idSeccion, campoId] = compositeKey.split('_');
            return {
              valor: this.mainModel[stepId][compositeKey] ?? '', // Usar ?? para manejar correctamente el valor 0
              campos: { id: parseInt(campoId, 10) },
              campoSeccion: parseInt(idSeccion, 10),
            };
          }),
        ),
      };

      const formResponse = await lastValueFrom(
        this.api.createSelect(finalPayload).pipe(takeUntil(this.destroy$)),
      );
      const correlativo = formResponse.data.correlativo;

      if (!correlativo) {
        throw new Error(
          'El backend no devolvió un correlativo para la solicitud.',
        );
      } else {
        this.router.navigate(['/welcome']);
      }

      this.toastService.addSuccess(
        'Éxito',
        'Datos del formulario guardados correctamente.',
      );

      const jsonGeneral: JsonGeneral = {
        tiposolicitud: 'partida Nacimiento',
        idSolicitud: '01', // TODO reemplazar por valores reales
        alcaldia: 'Cojutepeque ',
        usuario: 'userCojutepeque',
        correlativo: '12345678', // TODO reemplazar por valores reales
      };
      const jsonTitular: JsonTitular = {
        documento: '02929384-8',
        primernombre: 'Gerardo',
        segundonombre: 'Alfonso',
        tercernombre: '',
        primerapellido: 'Gutierrez',
        segundoapellido: 'Perez',
      };

      const pdfData = this._buildPdfJson();
      const docDef = getRequestDocumentDefinition(pdfData, this.logoBase64);

      const pdfResponse: SolicitudResponse =
        await this.pdfService.sendPdfToRest(
          docDef,
          correlativo,
          jsonGeneral,
          jsonTitular,
        );
      const solicitudId = pdfResponse.data;

      if (!solicitudId) {
        throw new Error(
          'La respuesta del envío del PDF no contenía un ID válido.',
        );
      }

      this.toastService.addInfo(
        'Documento Enviado',
        `El PDF se envió correctamente con ID: ${solicitudId}`,
      );

      await this.uploadAnexos(solicitudId);

      const completionStepIndex = this.stepsConfig.findIndex(
        (s) => s.id === 'completion',
      );
      if (completionStepIndex !== -1) {
        this.activeStepIndex = completionStepIndex;
      }
    } catch (error) {
      console.error('Ocurrió un error en el proceso de envío:', error);
      this.toastService.addError(
        'Error en el Proceso',
        'No se pudo completar el envío. Revisa la consola para más detalles.',
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  private async uploadAnexos(solicitudId: string): Promise<void> {
    if (this.anexosSubidos.length === 0) {
      console.log('No hay anexos para subir. Proceso completado.');
      return;
    }

    const formData = new FormData();
    formData.append('alcaldia', '002'); // Todo: reemplazar con valor real
    formData.append('uuidDocumento', solicitudId);

    this.anexosSubidos.forEach((anexo) => {
      formData.append(
        'content',
        anexo.archivo,
        anexo.nombre + '_' + solicitudId + '.pdf',
      );
    });
    try {
      await lastValueFrom(
        this.api.uploadAnexos(formData).pipe(takeUntil(this.destroy$)),
      );
      this.toastService.addSuccess(
        'Éxito',
        'Todos los anexos se han subido correctamente.',
      );
    } catch (error) {
      console.error(
        `Error al subir los anexos para la solicitud ${solicitudId}:`,
        error,
      );
      this.toastService.addError(
        'Error de Subida',
        'Ocurrió un error al subir uno o más anexos.',
      );
      throw error;
    }
  }

  // ========================================================
  // ===          AUTOCOMPLETE METHODS FOR ANEXO FORM     ===
  // ========================================================

  onAutocompleteInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.autocompleteQuery = input.value;
    this.filterSugerencias();

    if (!this.isAutocompleteOpen && this.autocompleteQuery.length > 0) {
      this.isAutocompleteOpen = true;
    }
  }

  onAutocompleteFocus(): void {
    if (
      this.autocompleteQuery.length > 0 ||
      this.filteredSugerencias.length > 0
    ) {
      this.isAutocompleteOpen = true;
    }
    this.filterSugerencias();
  }

  onAutocompleteBlur(): void {
    // Delay closing to allow click events on options to fire
    setTimeout(() => {
      this.isAutocompleteOpen = false;
      this.highlightedIndex = -1;
    }, 200);
  }

  onAutocompleteKeydown(event: KeyboardEvent): void {
    if (!this.isAutocompleteOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightNextOption();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightPreviousOption();
        break;
      case 'Enter':
        event.preventDefault();
        if (
          this.highlightedIndex >= 0 &&
          this.filteredSugerencias[this.highlightedIndex]
        ) {
          this.selectAutocompleteSuggestion(
            this.filteredSugerencias[this.highlightedIndex],
            this.highlightedIndex,
          );
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isAutocompleteOpen = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  toggleAutocompleteDropdown(): void {
    this.isAutocompleteOpen = !this.isAutocompleteOpen;
    if (this.isAutocompleteOpen) {
      this.filterSugerencias();
    } else {
      this.highlightedIndex = -1;
    }
  }

  selectAutocompleteSuggestion(suggestion: string, _index: number): void {
    this.anexoForm.patchValue({ nombrePredefinido: suggestion });
    this.autocompleteQuery = suggestion;
    this.isAutocompleteOpen = false;
    this.highlightedIndex = -1;

    // Clear the custom name field since we selected a predefined one
    this.anexoForm.patchValue({ nombrePersonalizado: '' });
  }

  getOptionId(index: number): string {
    return `${this.autocompleteListId}-option-${index}`;
  }

  private filterSugerencias(): void {
    const query = this.autocompleteQuery.toLowerCase().trim();

    if (query.length === 0) {
      this.filteredSugerencias = [...this.nombresPredefinidos];
    } else {
      this.filteredSugerencias = this.nombresPredefinidos.filter((nombre) =>
        nombre.toLowerCase().includes(query),
      );
    }

    // Reset highlighted index when filtering
    this.highlightedIndex = -1;
    this.updateHighlightedOptionId();
  }

  private highlightNextOption(): void {
    if (this.filteredSugerencias.length === 0) return;

    this.highlightedIndex =
      (this.highlightedIndex + 1) % this.filteredSugerencias.length;
    this.updateHighlightedOptionId();
  }

  private highlightPreviousOption(): void {
    if (this.filteredSugerencias.length === 0) return;

    this.highlightedIndex =
      this.highlightedIndex <= 0
        ? this.filteredSugerencias.length - 1
        : this.highlightedIndex - 1;
    this.updateHighlightedOptionId();
  }

  private updateHighlightedOptionId(): void {
    this.highlightedOptionId =
      this.highlightedIndex >= 0 ? this.getOptionId(this.highlightedIndex) : '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onLogoSelected(selectedLogo: LogoData) {
    this.selectedLogo = selectedLogo;
  }

  onLogoBase64Changed(logoBase64: string) {
    this.logoBase64 = logoBase64;
  }

  trackByStepId(index: number, step: StepConfig): string {
    return step.id;
  }

  getStepFormGroup(stepId: string): FormGroup {
    if (!this.mainForm.get(stepId)) {
      this.mainForm.addControl(stepId, new FormGroup({}));
      if (!this.mainModel[stepId]) {
        this.mainModel[stepId] = {};
      }
    }
    return this.mainForm.get(stepId) as FormGroup;
  }

  private loadFormUniq(apiId: string): void {
    this.noDataMessage = null;
    this.stepsConfig = [];
    this.mainForm = new FormGroup({});
    this.mainModel = {};
    this.activeStepIndex = 0;
    this.cdr.detectChanges();

    this.api
      .getformUniq(apiId, this.rolSeleccionado)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          if (data && data.length > 0) {
            const sectionsToShow = data.filter(
              (element: any) =>
                element.etapa &&
                element.etapa.id <= this.etapaSeleccionadaId &&
                element.ventanaEmergente !== 'S',
            );

            this.stepsConfig = sectionsToShow.map((element: any) => {
              const paso: StepConfig = {
                id: element.id.toString(),
                header: element.nombre,
                formlyFields: [],
              };

              if (element.camposSecciones?.length > 0) {
                const groups = this.buildFieldGroupsFromCampos(
                  element.camposSecciones,
                  element.id.toString(),
                );
                paso.formlyFields?.push(...groups);
              }

              if (element.subSecciones?.length > 0) {
                const subSectionsToShow = element.subSecciones.filter(
                  (sub: any) =>
                    sub.etapa &&
                    sub.etapa.id <= this.etapaSeleccionadaId &&
                    sub.ventanaEmergente !== 'S',
                );

                subSectionsToShow.forEach((sub: any) => {
                  paso.formlyFields?.push({
                    template: `<h4 class="text-xl font-semibold mb-4 mt-2 border-b pb-2">${sub.nombre}</h4>`,
                  });
                  if (sub.camposSecciones?.length > 0) {
                    const subGroups = this.buildFieldGroupsFromCampos(
                      sub.camposSecciones,
                      sub.id.toString(),
                    );
                    paso.formlyFields?.push(...subGroups);
                  }
                });
              }
              return paso;
            });

            this.stepsConfig.push({ id: 'completion', header: 'Resumen' });

            this.stepsConfig.forEach((step) => {
              if (step.formlyFields?.length) this.getStepFormGroup(step.id);
            });
          } else {
            this.noDataMessage =
              'No se encontró información para la opción seleccionada.';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.noDataMessage = 'Ocurrió un error al cargar la información.';
          console.error(
            `Error al cargar el formulario único con ID '${apiId}':`,
            error,
          );
          this.cdr.detectChanges();
        },
      });
  }

  private buildFieldGroupsFromCampos(
    campos: any[],
    parentId: string,
  ): FormlyFieldConfig[] {
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

      currentRowFields.push(this.createFieldConfig(cs, parentId));
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
        return 'col-span-12';
      default:
        return 'col-span-12';
    }
  }

  private createFieldConfig(
    campoSeccion: any,
    _parentId: string,
  ): FormlyFieldConfig {
    const campo: Campo = campoSeccion.campo;

    const config: FormlyFieldConfig = {
      key: `${campoSeccion.id}_${campo.id}`,
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

        // UPDATED PROPERTY STRUCTURE FROM BACKEND JSON:
        // - campo.mascara: Display mask for input formatting (e.g., "99-99999999-9")
        // - campo.validCompleja: Regex pattern for validation (e.g., "^\\d{2}-\\d{8}-\\d{1}$")

        // Propiedades para InputMask - usar campo.mascara para formato visual
        ...(campo.mascara &&
          typeof campo.mascara === 'string' &&
          campo.mascara.trim() !== '' && {
            mask: campo.mascara,
          }),
        // NOTE: Do NOT pass campo.validCompleja directly to HTML pattern attribute
        // as it may contain malformed regex that breaks HTML5 validation.
        // Our custom validators in buildValidators() handle the regex validation properly.

        // Add inputType for proper HTML input type handling
        ...(campo.tipo && this.getInputTypeFromCampoTipo(campo.tipo)),
      },
      expressionProperties: {
        'props.disabled': () => {
          const permissions = campoSeccion.rolesPermisos;
          if (!this.rolSeleccionado || !Array.isArray(permissions)) {
            return true;
          }

          const rolePermission = permissions.find(
            (p) => p.nombreRol === this.rolSeleccionado,
          );

          if (!rolePermission) {
            return true;
          }

          const permisoValue = rolePermission.permiso;

          return permisoValue !== 'E';
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
          // Mensajes de validación para campos numéricos
          ...(campo.tipo?.toLowerCase() === 'number' && {
            nonNegative: 'No se permiten números negativos.',
            wholeNumber: 'Solo se permiten números enteros (sin decimales).',
          }),
        },
      },
    };

    if (campo.busqueda === 'S') {
      config.type = 'input-group';
      if (!config.props) config.props = {};
      config.props['onSearchClick'] = (field: FormlyFieldConfig) =>
        this.handleSearchClick(field);
    }

    // ========================================================
    // ===          INICIO DE LA MODIFICACIÓN CLAVE         ===
    // ========================================================
    if (['select', 'radio'].includes(campo.tipo || '')) {
      if (!config.props) config.props = {};

      // Prioridad 1: Usar el nuevo objeto `catalogos` si existe y es válido.
      if (
        campo.catalogos &&
        Array.isArray(campo.catalogos.valoresCatalogos) &&
        campo.catalogos.valoresCatalogos.length > 0
      ) {
        // SOLUCIÓN CORREGIDA: Volvemos a mapear el array al formato { value, label }
        // que Formly espera por defecto. Esto es más compatible con versiones anteriores
        // y soluciona el problema de enlace de datos.
        config.props.options = campo.catalogos.valoresCatalogos.map(
          (catalogoItem: { id: number; valor: string }) => ({
            value: catalogoItem.id,
            label: catalogoItem.valor,
          }),
        );
      }
      // Prioridad 2 (Fallback): Usar la lógica anterior si `valoresPosibles` existe.
      else if (campoSeccion.valoresPosibles) {
        config.props.options =
          campoSeccion.valoresPosibles?.split(',').map((v: string) => ({
            value: v.trim(),
            label: v.trim(),
          })) || [];
      }
      // Por defecto: Dejar las opciones como un array vacío si no hay fuente de datos.
      else {
        config.props.options = [];
      }
    }
    // ========================================================
    // ===           FIN DE LA MODIFICACIÓN CLAVE           ===
    // ========================================================

    if (config.type === 'datepicker') {
      if (!config.props) config.props = {};
      config.props['styleClass'] = 'w-full';
      config.props['showIcon'] = true;
      config.props['dateFormat'] = 'dd/mm/yy';
      config.props['readonlyInput'] = false; // Permitir entrada manual para mejorar usabilidad
      config.props['showButtonBar'] = true;
      config.props['todayButtonStyleClass'] =
        'p-button-outlined p-button-secondary';
      config.props['clearButtonStyleClass'] =
        'p-button-outlined p-button-secondary';
      config.props['dataType'] = 'date'; // Asegurar que devuelva objetos Date
      config.props['keepInvalid'] = false; // No mantener valores inválidos
      config.props['required'] = false; // Deshabilitar validación requerida para datepicker

      // ⚠️ VALIDACIÓN COMPLETAMENTE DESHABILITADA PARA DATEPICKERS
      // Remover todos los validadores para evitar el estado inválido
      config.validators = {};
    }

    return config;
  }

  private buildValidators(campo: Campo): any {
    const validators: any = {};

    // Validador de campo obligatorio
    if (campo.obligatorio === 'S') {
      validators.required = {
        expression: (c: any) => {
          if (!c.value && c.value !== 0) return false;

          // Para campos de texto, verificar que no sea solo espacios en blanco
          if (typeof c.value === 'string') {
            return c.value.trim().length > 0;
          }

          // Para campos numéricos, aceptar 0 como valor válido
          if (typeof c.value === 'number') {
            return true;
          }

          // ⚠️ VALIDACIÓN DE FECHAS TEMPORALMENTE DESHABILITADA
          // Para campos de fecha, aceptar cualquier valor por ahora
          if (c.value instanceof Date) {
            return true; // Aceptar cualquier fecha por ahora
          }

          // Para otros tipos de datos
          return true;
        },
        message: `Este campo es obligatorio.`,
      };
    }

    // Para campos numéricos, usar validación de rango numérico en lugar de longitud de cadena
    if (campo.tipo?.toLowerCase() === 'number') {
      // Validador de valor mínimo (en lugar de longitud mínima)
      if (campo.lonMinima && campo.lonMinima > 0) {
        validators.minValue = {
          expression: (c: any) => {
            if (!c.value && c.value !== 0) return true;
            const numValue = Number(c.value);
            return !isNaN(numValue) && numValue >= campo.lonMinima!;
          },
          message: `El valor debe ser mayor o igual a ${campo.lonMinima}.`,
        };
      }

      // Validador de valor máximo (en lugar de longitud máxima)
      if (campo.lonMaxima && campo.lonMaxima > 0) {
        validators.maxValue = {
          expression: (c: any) => {
            if (!c.value && c.value !== 0) return true;
            const numValue = Number(c.value);
            return !isNaN(numValue) && numValue <= campo.lonMaxima!;
          },
          message: `El valor no puede ser mayor a ${campo.lonMaxima}.`,
        };
      }
    } else {
      // Para campos de texto, usar validación de longitud
      if (campo.lonMinima && campo.lonMinima > 0) {
        validators.minLength = {
          expression: (c: any) =>
            !c.value || c.value.length >= campo.lonMinima!,
          message: `Debe tener al menos ${campo.lonMinima} caracteres.`,
        };
      }

      if (campo.lonMaxima && campo.lonMaxima > 0) {
        validators.maxLength = {
          expression: (c: any) =>
            !c.value || c.value.length <= campo.lonMaxima!,
          message: `No puede exceder ${campo.lonMaxima} caracteres.`,
        };
      }
    }

    // Validador de expresión regular
    // For number fields, handle regex validation specially
    if (
      campo.validCompleja &&
      campo.validCompleja.trim() !== '' &&
      !campo.mascara
    ) {
      validators.pattern = {
        expression: (c: any) => {
          // Si no hay valor, la validación pasa (para evitar errores en campos vacíos)
          if (!c.value && c.value !== 0) return true;

          try {
            // Clean regex pattern - remove forward slash delimiters if present
            let cleanPattern = campo.validCompleja!.trim();
            if (cleanPattern.startsWith('/') && cleanPattern.endsWith('/')) {
              cleanPattern = cleanPattern.slice(1, -1);
            }

            // Fix common regex issues in the pattern
            cleanPattern = this.fixRegexPattern(cleanPattern);

            const regex = new RegExp(cleanPattern);

            // For number fields, test the string representation of the number
            const valueAsString = String(c.value);

            // Special handling for number fields with common number patterns
            if (campo.tipo?.toLowerCase() === 'number') {
              const numValue = Number(c.value);

              // Pattern analysis for common integer patterns
              const patternInfo = this.analyzeNumberPattern(cleanPattern);

              if (patternInfo.isSimpleIntegerPattern) {
                const isValid =
                  !isNaN(numValue) &&
                  Number.isInteger(numValue) &&
                  numValue >= patternInfo.minValue;

                console.log(`🔍 Number pattern validation (simplified):`, {
                  value: valueAsString,
                  numValue,
                  originalPattern: campo.validCompleja,
                  cleanPattern,
                  patternInfo,
                  isValid,
                });

                return isValid;
              }
            }

            // For other patterns, use regex as normal
            const isValid = regex.test(valueAsString);

            console.log(`🔍 Pattern validation for field:`, {
              value: valueAsString,
              fieldType: campo.tipo,
              originalPattern: campo.validCompleja,
              cleanPattern,
              isValid,
            });

            return isValid;
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

    // Validadores específicos para campos de tipo number
    if (campo.tipo?.toLowerCase() === 'number') {
      // Validador para números no negativos
      validators.nonNegative = {
        expression: (c: any) => {
          // Si no hay valor, la validación pasa (igual que otros validadores)
          if (!c.value && c.value !== 0) return true;

          const numValue = Number(c.value);
          return !isNaN(numValue) && numValue >= 0;
        },
        message: 'No se permiten números negativos.',
      };

      // Validador para números enteros (sin decimales)
      validators.wholeNumber = {
        expression: (c: any) => {
          // Si no hay valor, la validación pasa (igual que otros validadores)
          if (!c.value && c.value !== 0) return true;

          const numValue = Number(c.value);
          return !isNaN(numValue) && Number.isInteger(numValue);
        },
        message: 'Solo se permiten números enteros (sin decimales).',
      };
    }

    return validators;
  }

  private fixRegexPattern(pattern: string): string {
    // Fix common issues in regex patterns from backend
    let fixedPattern = pattern;

    // Fix double backslashes and spaces: '/^[1-9] \ d*$/' -> '^[1-9]\\d*$'
    fixedPattern = fixedPattern.replace(/\s*\\\s*d/g, '\\d');

    // Fix spaces before backslashes: '[1-9] \\d*' -> '[1-9]\\d*'
    fixedPattern = fixedPattern.replace(/\s+\\/g, '\\');

    // Fix spaces in character classes: '[1-9] d*' -> '[1-9]d*' (if \d was corrupted)
    fixedPattern = fixedPattern.replace(/\[([^\]]+)\]\s*d/g, '[$1]\\d');

    // Fix spaces within character classes: '[1-9] ' -> '[1-9]'
    fixedPattern = fixedPattern.replace(/\[([^\]]+)\s+\]/g, '[$1]');

    // Handle the specific case from the task: '/^[1-9] \\ d*$/' pattern
    if (fixedPattern.includes('[1-9]') && fixedPattern.includes('d*')) {
      // Ensure proper \d format
      fixedPattern = fixedPattern.replace(/\s*\\?\s*d\*/g, '\\d*');
    }

    console.log(`🔧 Fixed regex pattern:`, {
      original: pattern,
      fixed: fixedPattern,
    });

    return fixedPattern;
  }

  private analyzeNumberPattern(pattern: string): {
    isSimpleIntegerPattern: boolean;
    minValue: number;
    allowsZero: boolean;
    patternType: string;
  } {
    // Analyze common integer patterns and determine if 0 is allowed

    // Pattern 1: ^[1-9]\d*$ - Positive integers (1, 2, 3...), excludes 0
    if (
      /^\^?\[1-9\]\\d\*\$?$/.test(pattern) ||
      /^\[1-9\]\\d\*$/.test(pattern)
    ) {
      return {
        isSimpleIntegerPattern: true,
        minValue: 1,
        allowsZero: false,
        patternType: 'positive-integers',
      };
    }

    // Pattern 2: ^[0-9]\d*$ or ^\d+$ - Non-negative integers (0, 1, 2, 3...), includes 0
    if (
      /^\^?\[0-9\]\\d\*\$?$/.test(pattern) ||
      /^\[0-9\]\\d\*$/.test(pattern) ||
      /^\^?\\d\+\$?$/.test(pattern) ||
      /^\\d\+$/.test(pattern)
    ) {
      return {
        isSimpleIntegerPattern: true,
        minValue: 0,
        allowsZero: true,
        patternType: 'non-negative-integers',
      };
    }

    // Pattern 3: ^[0-9]+$ - Alternative non-negative integer pattern
    if (/^\^?\[0-9\]\+\$?$/.test(pattern) || /^\[0-9\]\+$/.test(pattern)) {
      return {
        isSimpleIntegerPattern: true,
        minValue: 0,
        allowsZero: true,
        patternType: 'non-negative-integers-alt',
      };
    }

    // Not a recognized simple integer pattern - let regex handle it
    return {
      isSimpleIntegerPattern: false,
      minValue: 0,
      allowsZero: true,
      patternType: 'complex',
    };
  }

  onSelectChange(field: FormlyFieldConfig, event: any): void {
    const selectedValue = event?.value;

    // Clear PDF field cache when form data changes
    this._clearPdfFieldCache();

    this.removeSubsequentFields(field);

    if (!selectedValue) {
      this.stepsConfig = [];
      this.mainForm = new FormGroup({});
      this.mainModel = {};
      this.noDataMessage = null;
      this.correlativoG = '';
      this.isLoading = false;
      this.topSelectionCompleted = false;
      this.etapaSeleccionadaId = 1;
      return;
    }

    this.api
      .getSelectsById(selectedValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Principales[]) => {
          if (data && data.length > 0) {
            const nextFieldKey = data[0].etiqueta;
            const nextFieldLabel = data[0].etiqueta;
            const options = data.map((item) => ({
              value: item.id,
              label: item.nombre,
            }));

            const newField = this.createNewTopField(
              nextFieldKey,
              nextFieldLabel,
              options,
            );

            const targetFieldGroup = this.topFields[0]?.fieldGroup;
            if (targetFieldGroup) {
              const existingFieldIndex = targetFieldGroup.findIndex(
                (f) => f.key === newField.key,
              );

              if (existingFieldIndex === -1) {
                targetFieldGroup.push(newField);
                this.topFields = [...this.topFields];
                this.cdr.detectChanges();
              }
            }
          } else {
            if (!this.topSelectionCompleted) {
              this.isLoading = true;
              this.etapaSeleccionadaId = 2;
              this.idTipoDocumento = parseInt(selectedValue, 10);
              this.topSelectionCompleted = true;

              this.api
                .getCorrelativo(this.idTipoDocumento)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (correlativoString: string) => {
                    this.correlativoG = correlativoString;
                  },
                  error: (err) =>
                    console.error('Error al obtener el correlativo:', err),
                });

              this.loadFormUniq(selectedValue);
            }
          }
        },
        error: (err) =>
          console.error(
            `Error al cargar opciones para el siguiente nivel con ID ${selectedValue}:`,
            err,
          ),
      });
  }

  private createNewTopField(
    key: string,
    label: string,
    options: {
      value: any;
      label: string;
    }[] = [],
  ): FormlyFieldConfig {
    const fieldConfig: FormlyFieldConfig = {
      className: 'tw-col-span-12 md:tw-col-span-6 lg:tw-col-span-4',
      key,
      type: 'select',
      props: {
        label,
        required: true,
        options,
        placeholder: 'Seleccione una opción',
      },
      hooks: {
        onInit: (field) => {
          if (field.formControl) {
            field.formControl.valueChanges
              .pipe(
                filter(
                  (selectedValue) =>
                    selectedValue !== null && selectedValue !== undefined,
                ),
                distinctUntilChanged(),
                takeUntil(this.destroy$),
              )
              .subscribe((selectedValue) => {
                this.onSelectChange(field, { value: selectedValue });
              });
          }
        },
      },
    };
    return fieldConfig;
  }

  private removeSubsequentFields(currentField: FormlyFieldConfig): void {
    const fieldGroup = this.topFields[0]?.fieldGroup;
    if (!fieldGroup) return;

    const currentIndex = fieldGroup.findIndex(
      (f) => f.key === currentField.key,
    );

    if (currentIndex > -1 && fieldGroup.length > currentIndex + 1) {
      const fieldsToRemove = fieldGroup.length - (currentIndex + 1);

      for (let i = currentIndex + 1; i < fieldGroup.length; i++) {
        const keyToRemove = fieldGroup[i].key;
        if (keyToRemove) {
          delete this.topModel[keyToRemove as string];
          const control = this.topForm.get(keyToRemove as string);
          if (control) {
            this.topForm.removeControl(keyToRemove as string);
          }
        }
      }

      fieldGroup.splice(currentIndex + 1, fieldsToRemove);
      this.topFields = [...this.topFields];

      if (fieldsToRemove > 0) {
        this.stepsConfig = [];
        this.mainForm = new FormGroup({});
        this.mainModel = {};
        this.noDataMessage = null;
        this.correlativoG = '';
        this.isLoading = false;
        this.topSelectionCompleted = false;
        this.etapaSeleccionadaId = 1;
      }

      this.cdr.detectChanges();
    }
  }

  private determinarTipoCampo = (campo: Campo): string => {
    // Si hay máscara o regex definida, usar input con directive
    if (
      (campo.mascara &&
        typeof campo.mascara === 'string' &&
        campo.mascara.trim() !== '') ||
      (campo.validCompleja &&
        typeof campo.validCompleja === 'string' &&
        campo.validCompleja.trim() !== '')
    ) {
      return 'input'; // Use regular input with mask/regex directive
    }

    const mapeoTipos: { [key: string]: string } = {
      text: 'input',
      string: 'input',
      email: 'input',
      number: 'input',
      date: 'datepicker',
      datetime: 'calendar',
      time: 'input',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      textarea: 'textarea',
    };
    const tipo = campo.tipo?.toLowerCase() || 'input';
    return mapeoTipos[tipo] || 'input';
  };

  private getInputTypeFromCampoTipo(campoTipo: string): {
    inputType?: string;
    min?: number;
    step?: number;
  } {
    const tipo = campoTipo?.toLowerCase();
    switch (tipo) {
      case 'number':
        return {
          inputType: 'number',
          min: 0, // Prevent negative numbers
          step: 1, // Only allow whole numbers (integers)
        };
      case 'email':
        return { inputType: 'email' };
      case 'time':
        return { inputType: 'time' };
      case 'password':
        return { inputType: 'password' };
      case 'tel':
        return { inputType: 'tel' };
      case 'url':
        return { inputType: 'url' };
      default:
        return {};
    }
  }

  nextStep(currentStepIndex: number): void {
    const step = this.stepsConfig[currentStepIndex];
    if (step.formlyFields && step.formlyFields.length > 0) {
      const formGroup = this.getStepFormGroup(step.id);

      // Validación especial que excluye datepickers
      const isFormValidExcludingDatepickers =
        this.isStepValidExcludingDatepickers(step, formGroup);

      if (!isFormValidExcludingDatepickers) {
        formGroup.markAllAsTouched();

        // Buscar campos obligatorios que estén vacíos para mostrar mensaje específico
        const emptyRequiredFields = this.findEmptyRequiredFields(
          step,
          formGroup,
        );
        if (emptyRequiredFields.length > 0) {
          const fieldNames = emptyRequiredFields.join(', ');
          this.toastService.addWarn(
            'Campos obligatorios',
            `Los siguientes campos son obligatorios: ${fieldNames}`,
            5000,
          );
        } else {
          this.toastService.addWarn(
            'Formulario inválido',
            'Por favor, corrija los errores antes de continuar.',
            5000,
          );
        }
        return;
      }
    }

    // Advance to the next step
    if (this.activeStepIndex < this.stepsConfig.length - 1) {
      this.activeStepIndex++;
      this.cdr.detectChanges(); // Force change detection to update the stepper
    }
  }

  prevStep(): void {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.cdr.detectChanges(); // Force change detection to update the stepper
    }
  }

  onStepChange(stepIndex: number): void {
    this.activeStepIndex = stepIndex;
    this.cdr.detectChanges(); // Force change detection to update the stepper
  }

  private isStepValidExcludingDatepickers(
    step: StepConfig,
    formGroup: FormGroup,
  ): boolean {
    if (!step.formlyFields) return true;

    let isValid = true;

    // Función recursiva para validar campos excluyendo datepickers
    const validateFields = (fields: FormlyFieldConfig[]) => {
      fields.forEach((field) => {
        if (field.fieldGroup) {
          validateFields(field.fieldGroup);
        } else if (field.key && field.type !== 'datepicker') {
          const control = formGroup.get(field.key as string);
          if (
            control &&
            field.props?.required &&
            (!control.value ||
              (typeof control.value === 'string' &&
                control.value.trim() === ''))
          ) {
            isValid = false;
          }
        }
      });
    };

    validateFields(step.formlyFields);
    return isValid;
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

  private _findValue(
    targetSections: string[],
    targetFields: string[],
    separator = ' ',
    useCache = true,
  ): string {
    const cacheKey = `${targetSections.join(',')}-${targetFields.join(',')}-${separator}`;
    console.log(cacheKey);
    // Return cached value if available and cache is enabled
    if (useCache && this.pdfFieldCache[cacheKey]) {
      return this.pdfFieldCache[cacheKey];
    }

    const values: { [key: string]: string } = {};

    this.stepsConfig.forEach((step) => {
      if (!step.formlyFields) return;

      let currentSubSection = '';
      const currentParentSection = step.header;

      step.formlyFields.forEach((config) => {
        if (config.template) {
          const match = config.template.match(/>(.*?)</);
          currentSubSection = match ? match[1] : '';
        }

        if (config.fieldGroup) {
          // Create hierarchical context array
          const contextHierarchy = [currentParentSection.toLowerCase()];
          if (currentSubSection) {
            contextHierarchy.push(currentSubSection.toLowerCase());
          }

          // Check if all target sections match in the hierarchy
          const isTargetSection = this.matchesHierarchicalSections(
            targetSections,
            contextHierarchy,
          );

          if (isTargetSection) {
            config.fieldGroup.forEach((field) => {
              const fieldLabel = field.props?.label?.toLowerCase() || '';
              const keyword = targetFields.find((tf) =>
                fieldLabel.includes(tf.toLowerCase()),
              );

              if (keyword && field.key) {
                const fieldValue =
                  this.mainModel[step.id]?.[field.key as string];
                if (
                  fieldValue !== null &&
                  fieldValue !== undefined &&
                  fieldValue !== ''
                ) {
                  values[keyword] = String(fieldValue);
                }
                console.log(fieldValue);
              }
            });
          }
        }
      });
    });

    const result = targetFields
      .map((k) => values[k])
      .filter(Boolean)
      .join(separator);

    // Cache the result if cache is enabled
    if (useCache) {
      this.pdfFieldCache[cacheKey] = result;
    }

    return result;
  }

  private _clearPdfFieldCache(): void {
    this.pdfFieldCache = {};
  }

  private matchesHierarchicalSections(
    targetSections: string[],
    contextHierarchy: string[],
  ): boolean {
    // For single section targets, use the original logic
    if (targetSections.length === 1) {
      return contextHierarchy.some((context) =>
        context.includes(targetSections[0].toLowerCase()),
      );
    }

    // For hierarchical targets, check if all sections are present in order
    let currentHierarchyIndex = 0;

    for (const targetSection of targetSections) {
      let found = false;

      // Look for this target section in the remaining hierarchy
      for (let i = currentHierarchyIndex; i < contextHierarchy.length; i++) {
        if (contextHierarchy[i].includes(targetSection.toLowerCase())) {
          currentHierarchyIndex = i + 1;
          found = true;
          break;
        }
      }

      if (!found) {
        return false;
      }
    }

    return true;
  }

  private _buildPdfJson(): any {
    try {
      // Clear cache before building new PDF data
      this._clearPdfFieldCache();

      // Clone the template data
      const data = JSON.parse(JSON.stringify(this.formDataParaPdf));
      const missingFields: string[] = [];
      const invalidFields: string[] = [];
      console.log(this.PDF_FIELD_MAPPINGS);
      // Apply field mappings
      this.PDF_FIELD_MAPPINGS.forEach((mapping) => {
        const value = this._findValue(
          mapping.sections,
          mapping.fields,
          mapping.separator || ' ',
        );
        console.log(value);
        // Validate the field value
        if (mapping.required && (!value || value.trim() === '')) {
          missingFields.push(mapping.targetField);
        }

        if (value && mapping.validator && !mapping.validator(value)) {
          invalidFields.push(mapping.targetField);
        }

        // Assign the value to the target field
        data[mapping.targetField] = value || '';
      });

      // Log validation issues (non-blocking)
      if (missingFields.length > 0) {
        console.warn('Missing required PDF fields:', missingFields);
      }

      if (invalidFields.length > 0) {
        console.warn('Invalid PDF field values:', invalidFields);
      }

      // Add metadata
      data._metadata = {
        generatedAt: new Date().toISOString(),
        formVersion: '1.0',
        missingFields,
        invalidFields,
      };

      return data;
    } catch (error) {
      console.error('Error building PDF JSON:', error);

      // Return fallback data structure
      const fallbackData = JSON.parse(JSON.stringify(this.formDataParaPdf));
      fallbackData._metadata = {
        generatedAt: new Date().toISOString(),
        formVersion: '1.0',
        error: 'Failed to build PDF data properly',
        missingFields: [],
        invalidFields: [],
      };

      return fallbackData;
    }
  }

  fillStepWithTestData(stepId: string): void {
    const step = this.stepsConfig.find((s) => s.id === stepId);
    if (!step || !step.formlyFields) return;

    const formGroup = this.getStepFormGroup(stepId);
    const stepModel = this.mainModel[stepId] || {};

    this.fillFieldsRecursively(step.formlyFields, formGroup, stepModel);

    this.mainModel[stepId] = stepModel;

    Object.keys(stepModel).forEach((key) => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });

    this.toastService.addSuccess(
      'Datos de Prueba Cargados',
      'Los campos han sido llenados con datos de ejemplo.',
    );
  }

  private fillFieldsRecursively(
    fields: FormlyFieldConfig[],
    formGroup: FormGroup,
    stepModel: any,
  ): void {
    fields.forEach((field) => {
      if (field.fieldGroup) {
        this.fillFieldsRecursively(field.fieldGroup, formGroup, stepModel);
      } else if (field.key && field.props?.label) {
        const fieldTypeString =
          typeof field.type === 'string' ? field.type : undefined;
        const testValue = this.fieldValueMapper.getTestValueForField(
          field.props.label,
          fieldTypeString,
        );
        if (testValue !== null) {
          stepModel[field.key as string] = testValue;

          const control = formGroup.get(field.key as string);
          if (control) {
            control.setValue(testValue);
          }
        }
      }
    });
  }

  handleSearchClick(field: FormlyFieldConfig) {
    const dui = field.formControl?.value;
    if (!dui) {
      return;
    }

    this.fieldToUpdateFromSearch = field;
    this.searchModalTitle = `Buscando resultados para DUI: ${dui}`;
    this.isSearchModalVisible = true;
    this.isSearching = true;
    this.searchError = null;
    this.searchResults = [];
    const mockApiResponse: PersonSearchResult[] = [
      {
        nombre: 'Juan Ernesto Pérez López',
        direccion: 'Colonia San Benito, Pasaje 1, Casa #5, San Salvador',
        fotoUrl: 'https://placehold.co/100x100/EFEFEF/AAAAAA?text=Foto',
        dui: '12345678-9',
      },
    ];

    of(mockApiResponse)
      .pipe(delay(1500))
      .subscribe({
        next: (results) => {
          if (results && results.length > 0) {
            this.searchResults = results;
          } else {
            this.searchError =
              'No se encontraron resultados para el DUI proporcionado.';
          }
          this.isSearching = false;
        },
        error: (err) => {
          console.error('Error en la búsqueda:', err);
          this.searchError =
            'Ocurrió un error al realizar la búsqueda. Intente de nuevo.';
          this.isSearching = false;
        },
      });
  }

  selectSearchResult(result: PersonSearchResult) {
    if (
      this.fieldToUpdateFromSearch &&
      this.fieldToUpdateFromSearch.formControl
    ) {
      this.fieldToUpdateFromSearch.formControl.setValue(result.nombre);
    }
    this.closeSearchModal();
  }

  closeSearchModal() {
    this.isSearchModalVisible = false;
    this.fieldToUpdateFromSearch = null;
    this.isSearching = false;
    this.searchError = null;
    this.searchResults = [];
  }
}
