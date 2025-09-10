import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom, Subject, of, forkJoin, from } from 'rxjs';
import {
  takeUntil,
  delay,
  catchError,
  distinctUntilChanged,
  filter,
} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { FormlyDatepickerModule } from '@ngx-formly/primeng/datepicker';

// --- PrimeNG ---
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// --- Servicios y Utilidades ---
import { Api, Principales } from '../../services/api/api';
import { Logo, LogoData } from '../../services/logo/logo';
import { PdfService } from '../../services/pdf-service/pdf-service';
import { ModalPdf } from '../modal-pdf/modal-pdf';
import { FormlyConfigModule } from './formly-config.module';
import { getRequestDocumentDefinition } from '../../utils/birth-request-document-definition';

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
    FormlyPrimeNGModule,
    FormlyDatepickerModule,
    StepperModule,
    ButtonModule,
    DialogModule,
    CardModule,
    AutoCompleteModule,
    InputGroupModule,
    InputTextModule,
    TableModule,
    FileUploadModule,
    TooltipModule,
    MessageModule,
    DividerModule,
    ToastModule,
    HttpClientModule,
    ProgressSpinnerModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './registry-form.html',
  styleUrls: ['./registry-form.css'],
})
export class RegistryForm implements OnInit, OnDestroy, AfterViewInit {
  private api = inject(Api);
  private pdfService = inject(PdfService);
  private logoService = inject(Logo);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private zone = inject(NgZone);

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
  logos: LogoData[] = [];
  filteredLogos: LogoData[] = [];
  selectedLogo: LogoData | null = null;
  logoBase64: string | null = null;
  isLoadingLogos = false;

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
  sugerenciasNombres: string[] = [];
  selectedFile: File | null = null;

  idTipoDocumento = -1;
  correlativoG = '';
  solicitudIdFromWelcome: number | null = null;
  rolUsuario = '';

  @ViewChild('fileUploader') fileUploader?: FileUpload;

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

  ngOnInit() {
    console.log('RegistryForm ngOnInit iniciado');

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.rolUsuario = 'Registrador';
        this.solicitudIdFromWelcome = +params['id'];

        this.initializeFormFlow();
        this.initializeComponent();
        this.loadAnexosEsperados();
      } else {
        console.warn(
          'No se proporcionó un ID de solicitud. Redirigiendo a la bienvenida.',
        );
        this.router.navigate(['../welcome'], { relativeTo: this.route });
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

  /**
   * Filtra los nombres para el AutoComplete y fuerza la detección de cambios.
   */
  filtrarNombresAnexos(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.sugerenciasNombres = this.nombresPredefinidos.filter((nombre) =>
      nombre.toLowerCase().includes(query),
    );
    // Forzar la detección de cambios para asegurar que la lista de sugerencias se actualice
    //this.cdr.detectChanges();
  }

  openAnexoModal() {
    console.log('Abriendo modal de anexo...');
    this.anexoForm.reset();
    this.selectedFile = null;

    setTimeout(() => {
      if (this.fileUploader) {
        this.fileUploader.clear();
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
    console.log('Evento onHide disparado - Limpiando estado del modal de anexo');
    this.anexoForm.reset();
    this.selectedFile = null;

    if (this.fileUploader) {
      this.fileUploader.clear();
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

  guardarAnexo() {
    this.anexoForm.markAllAsTouched();

    if (this.anexoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail:
          'Debe proporcionar un nombre (predefinido o personalizado) y seleccionar un archivo PDF.',
      });
      return;
    }

    const nombre =
      this.anexoForm.value.nombrePersonalizado ||
      this.anexoForm.value.nombrePredefinido;

    if (!nombre || !this.selectedFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un problema al obtener el nombre o el archivo.',
      });
      return;
    }

    const nuevoAnexo: Anexo = {
      nombre: nombre,
      archivo: this.selectedFile,
    };

    this.anexosSubidos = [...this.anexosSubidos, nuevoAnexo];

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Anexo "${nombre}" agregado correctamente.`,
    });

    this.closeAnexoModal();
  }

  eliminarAnexo(index: number) {
    if (index >= 0 && index < this.anexosSubidos.length) {
      const anexoEliminado = this.anexosSubidos[index];
      this.anexosSubidos.splice(index, 1);
      this.anexosSubidos = [...this.anexosSubidos];

      this.messageService.add({
        severity: 'info',
        summary: 'Anexo Eliminado',
        detail: `Se eliminó el anexo: ${anexoEliminado.nombre}`,
      });
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
                fieldGroupClassName: 'grid grid-cols-12 gap-4',
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
    const logoDefault$ = from(this.loadDefaultLogo()).pipe(
      catchError((error) => {
        console.warn(
          'No se pudo cargar el logo por defecto. El usuario deberá seleccionar uno manualmente.',
          error,
        );
        return of(null);
      }),
    );

    const pdfData$ = this.api.getBirthCertificateData().pipe(
      catchError((error) => {
        console.error(
          'Error CRÍTICO al cargar la plantilla de datos del PDF.',
          error,
        );
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Carga',
          detail: 'No se pudo cargar la plantilla para la vista previa.',
        });
        return of(null);
      }),
    );

    forkJoin([logoDefault$, pdfData$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([_, pdfDataResult]) => {
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

    this.loadAvailableLogos();
  }

  showPdfWithDynamicData(): void {
    if (!this.isPdfDataReady || !this.logoBase64) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos no listos',
        detail:
          'Por favor, espere a que los datos carguen y seleccione un logo.',
      });
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
  }

  private async loadDefaultLogo() {
    try {
      const logoPath = '/assets/logos/RNPNFooter.png';
      const response = await lastValueFrom(
        this.http.get(logoPath, { responseType: 'blob' }),
      );
      this.logoBase64 = await this.convertBlobToBase64(response);
    } catch (error) {
      console.error('Error al cargar el logo por defecto:', error);
      throw error;
    }
  }

  async submitForm(): Promise<void> {
    if (this.mainForm.invalid || this.topForm.invalid) {
      this.topForm.markAllAsTouched();
      this.mainForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor, complete todos los campos requeridos.',
      });
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
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Datos del formulario guardados correctamente.',
      });

      const jsonGeneral = {
        tiposolicitud: 'partida Nacimiento',
        alcaldia: 'Cojutepeque ',
        usuario: 'userCojutepeque',
        correlativo: '',
      };
      const jsonTitular = {
        documento: '02929384-8',
        primernombre: 'Gerardo',
        segundonombre: 'Alfonso',
        tercernombre: '',
        primerapellido: 'Gutierrez',
        segundoapellido: 'Perez',
      };

      const pdfData = this._buildPdfJson();
      const docDef = getRequestDocumentDefinition(pdfData, this.logoBase64);

      const pdfResponse = await this.pdfService.sendPdfToRest(
        docDef,
        correlativo,
        jsonGeneral,
        jsonTitular,
      );
      const solicitudId = pdfResponse.id;

      if (!solicitudId) {
        throw new Error(
          'La respuesta del envío del PDF no contenía un ID válido.',
        );
      }

      this.messageService.add({
        severity: 'info',
        summary: 'Documento Enviado',
        detail: `El PDF se envió correctamente con ID: ${solicitudId}`,
      });

      await this.uploadAnexos(solicitudId);

      const completionStepIndex = this.stepsConfig.findIndex(
        (s) => s.id === 'completion',
      );
      if (completionStepIndex !== -1) {
        this.activeStepIndex = completionStepIndex;
      }
    } catch (error) {
      console.error('Ocurrió un error en el proceso de envío:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error en el Proceso',
        detail:
          'No se pudo completar el envío. Revisa la consola para más detalles.',
      });
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
    formData.append('alcaldia', '0002');
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
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Todos los anexos se han subido correctamente.',
      });
    } catch (error) {
      console.error(
        `Error al subir los anexos para la solicitud ${solicitudId}:`,
        error,
      );
      this.messageService.add({
        severity: 'error',
        summary: 'Error de Subida',
        detail: 'Ocurrió un error al subir uno o más anexos.',
      });
      throw error;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async loadAvailableLogos() {
    this.isLoadingLogos = true;
    try {
      this.logos = await lastValueFrom(this.logoService.getLogos());
      const defaultLogo: LogoData = {
        id: 'default',
        nombre: 'Logo por defecto (Gobierno)',
        imagebase64: this.logoBase64 || '',
      };
      this.logos.unshift(defaultLogo);
      this.selectedLogo = defaultLogo;
    } catch (error) {
      console.error('Error al cargar los logos desde la API:', error);
      const defaultLogo: LogoData = {
        id: 'default',
        nombre: 'Logo por defecto (Gobierno)',
        imagebase64: this.logoBase64 || '',
      };
      this.logos = [defaultLogo];
      this.selectedLogo = defaultLogo;
    } finally {
      this.isLoadingLogos = false;
    }
  }

  filterLogos(event: { query: string }) {
    const query = event.query.toLowerCase();
    this.filteredLogos = this.logos.filter((logo) =>
      logo.nombre.toLowerCase().includes(query),
    );
  }

  onLogoSelect(selectedLogo: LogoData) {
    if (selectedLogo) {
      this.logoBase64 = selectedLogo.imagebase64;
    }
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
          fieldGroupClassName: 'grid grid-cols-12 gap-x-6 mb-4',
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
        fieldGroupClassName: 'grid grid-cols-12 gap-x-6 mb-4',
        fieldGroup: currentRowFields,
      });
    }

    return rows;
  }

  private mapAnchoToColumnClass(ancho: string): string {
    switch (ancho) {
      case '25%':
        return 'col-span-12 md:col-span-3';
      case '33%':
        return 'col-span-12 md:col-span-4';
      case '50%':
        return 'col-span-12 md:col-span-6';
      case '66%':
        return 'col-span-12 md:col-span-8';
      case '75%':
        return 'col-span-12 md:col-span-9';
      case '100%':
        return 'col-span-12';
      default:
        return 'col-span-12';
    }
  }

  private createFieldConfig(
    campoSeccion: any,
    parentId: string,
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
      validation: { messages: { required: 'Este campo es obligatorio.' } },
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
    }

    return config;
  }

  onSelectChange(field: FormlyFieldConfig, event: any): void {
    const selectedValue = event?.value;

    if (!selectedValue) {
      this.removeSubsequentFields(field);
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
              targetFieldGroup.push(newField);
              this.topFields = [...this.topFields];
            }
          } else {
            this.isLoading = true;
            this.etapaSeleccionadaId = 2;
            this.idTipoDocumento = parseInt(selectedValue, 10);

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

            this.removeSubsequentFields(field);
            this.loadFormUniq(selectedValue);
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
      className: 'col-span-12 md:col-span-6 lg:col-span-4',
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
        }
      }

      fieldGroup.splice(currentIndex + 1, fieldsToRemove);
      this.topFields = [...this.topFields];
      this.stepsConfig = [];
      this.mainForm = new FormGroup({});
      this.mainModel = {};
      this.noDataMessage = null;
      this.correlativoG = '';
    }
  }

  private determinarTipoCampo = (campo: Campo): string => {
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

  nextStep(currentStepIndex: number): void {
    const step = this.stepsConfig[currentStepIndex];
    if (step.formlyFields && step.formlyFields.length > 0) {
      const formGroup = this.getStepFormGroup(step.id);
      if (formGroup.invalid) {
        formGroup.markAllAsTouched();
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

  private _findValue(
    targetSections: string[],
    targetFields: string[],
    separator = ' ',
  ): string {
    const values: { [key: string]: string } = {};
    this.stepsConfig.forEach((step) => {
      if (!step.formlyFields) return;
      let currentSubSection = '';
      step.formlyFields.forEach((config) => {
        if (config.template) {
          const match = config.template.match(/>(.*?)</);
          currentSubSection = match ? match[1] : '';
        }
        if (config.fieldGroup) {
          const contextTitle = currentSubSection || step.header;
          if (
            targetSections.some((ts) =>
              contextTitle.toLowerCase().includes(ts.toLowerCase()),
            )
          ) {
            config.fieldGroup.forEach((field) => {
              const fieldLabel = field.props?.label?.toLowerCase() || '';
              const keyword = targetFields.find((tf) =>
                fieldLabel.includes(tf.toLowerCase()),
              );
              if (keyword) {
                const fieldValue =
                  this.mainModel[step.id]?.[field.key as string];
                if (fieldValue) values[keyword] = fieldValue;
              }
            });
          }
        }
      });
    });
    return targetFields
      .map((k) => values[k])
      .filter(Boolean)
      .join(separator);
  }

  private _buildPdfJson(): any {
    const data = JSON.parse(JSON.stringify(this.formDataParaPdf));
    data.partidaNo = this._findValue(
      ['general'],
      ['partida no', 'número de partida'],
    );

    data.libro = this._findValue(['general'], ['libro']);
    data.folio = this._findValue(['general'], ['folio']);
    data.anio = this._findValue(['general'], ['año']);

    return data;
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

    this.messageService.add({
      severity: 'success',
      summary: 'Datos de Prueba Cargados',
      detail: 'Los campos han sido llenados con datos de ejemplo.',
    });
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
        const testValue = this.getTestValueForField(
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

  private getTestValueForField(fieldLabel: string, fieldType?: string): any {
    const label = fieldLabel.toLowerCase();

    const testData = {
      nombres: [
        'Carlos',
        'María',
        'José',
        'Ana',
        'Juan',
        'Sofía',
        'Luis',
        'Elena',
      ],
      apellidos: [
        'Hernández',
        'Rivera',
        'Martínez',
        'García',
        'López',
        'Pérez',
        'Flores',
      ],
      parentescos: [
        'Padre',
        'Madre',
        'Abuelo(a)',
        'Tío(a)',
        'Representante Legal',
      ],
      profesiones: [
        'Doctor(a)',
        'Ingeniero(a)',
        'Abogado(a)',
        'Estudiante',
        'Contador(a)',
        'Oficios Domésticos',
        'Comerciante',
        'Agricultor(a)',
        'Mecánico(a)',
      ],
      ocupaciones: [
        'Empleado(a) público',
        'Trabajador(a) independiente',
        'Ama de casa',
        'Empleado(a) privado',
        'Jubilado(a)',
        'Desempleado(a)',
      ],
      nacionalidades: [
        'Salvadoreña',
        'Guatemalteca',
        'Hondureña',
        'Estadounidense',
      ],
      paises: [
        'El Salvador',
        'Guatemala',
        'Honduras',
        'Estados Unidos',
        'Nicaragua',
      ],
      departamentos: [
        'Santa Ana',
        'San Salvador',
        'San Miguel',
        'La Libertad',
        'Sonsonate',
        'Ahuachapán',
      ],
      municipios: [
        'Santa Ana',
        'Chalchuapa',
        'Metapán',
        'Soyapango',
        'Ilopango',
        'Mejicanos',
      ],
      cantones: [
        'El Brazo',
        'Las Flores',
        'San Antonio',
        'El Portezuelo',
        'La Esperanza',
        'Monte Verde',
      ],
      distritos: [
        'Distrito Centro',
        'Distrito Norte',
        'Distrito Sur',
        'Distrito Este',
        'Distrito Oeste',
      ],
      documentos: ['DUI', 'Pasaporte', 'Carné de Residente'],
      estadosFamiliares: [
        'Soltero(a)',
        'Casado(a)',
        'Acompañado(a)',
        'Divorciado(a)',
      ],
      generos: ['Masculino', 'Femenino'],
      direcciones: [
        'Colonia San Benito, Pasaje 1, Casa #5',
        'Residencial Las Arboledas, Polígono D, Casa #12',
        'Cantón El Portezuelo, Calle Principal',
        'Barrio San Jacinto, 10a Avenida Sur',
      ],
      direccionesEspecificas: [
        'Casa #15, Calle Los Almendros',
        'Apartamento 2B, Edificio Central',
        'Km 12.5 Carretera a San Miguel',
        'Final 25 Avenida Norte, #245',
        'Condominio Las Palmeras, Casa 8',
      ],
      gradosEducativos: [
        'Ninguno',
        '1° a 3° grado',
        '4° a 6° grado',
        '7° a 9° grado',
        'Bachillerato',
        'Técnico',
        'Universitario',
        'Postgrado',
      ],
      respuestasSiNo: ['Sí', 'No'],
      tiposParto: ['Simple', 'Múltiple'],
      clasesParto: ['Natural', 'Cesárea'],
      tiposAsistencia: [
        'Médico',
        'Enfermera',
        'Partera',
        'Comadrona',
        'Sin asistencia',
      ],
      nombresAsistentes: [
        'Dr. José Antonio Martínez',
        'Dra. María Elena Rodríguez',
        'Enfermera Carmen López',
        'Partera Rosa Hernández',
        'Dr. Luis Alberto Gómez',
      ],
      preposicionesCasada: ['de', 'del', 'de la', 'vda. de', 'viuda de'],
      tiposCentroSalud: [
        'Hospital Nacional',
        'Clínica Comunal',
        'Unidad de Salud',
        'Hospital Privado',
        'Centro de Salud Rural',
        'Dispensario Médico',
      ],
    };

    if (
      label.includes('parentesco con el inscrito') ||
      label.includes('parentesco')
    ) {
      return this.getRandomFromArray(testData.parentescos);
    }
    if (label.includes('primer nombre')) {
      return this.getRandomFromArray(testData.nombres);
    }
    if (label.includes('segundo nombre')) {
      return this.getRandomFromArray(testData.nombres);
    }
    if (label.includes('tercer nombre')) {
      return Math.random() > 0.5
        ? this.getRandomFromArray(testData.nombres)
        : '';
    }
    if (label.includes('primer apellido')) {
      return this.getRandomFromArray(testData.apellidos);
    }
    if (label.includes('segundo apellido')) {
      return this.getRandomFromArray(testData.apellidos);
    }
    if (label.includes('preposición del apellido de casada')) {
      return this.getRandomFromArray(testData.preposicionesCasada);
    }
    if (label.includes('apellido de casada')) {
      return this.getRandomFromArray(testData.apellidos);
    }
    if (
      label.includes('fecha de nacimiento') ||
      (fieldType === 'datepicker' && label.includes('nacimiento'))
    ) {
      return this.getRandomBirthDate();
    }
    if (
      label.includes('fecha de registro') ||
      (fieldType === 'datepicker' && label.includes('registro'))
    ) {
      const today = new Date();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const year = today.getFullYear().toString();
      return `${month}/${day}/${year}`;
    }
    if (label.includes('lugar de nacimiento')) {
      return (
        this.getRandomFromArray(testData.municipios) +
        ', ' +
        this.getRandomFromArray(testData.departamentos)
      );
    }
    if (
      label.includes('país de nacimiento') ||
      label.includes('pais de nacimiento')
    ) {
      return this.getRandomFromArray(testData.paises);
    }
    if (label.includes('departamento de nacimiento')) {
      return this.getRandomFromArray(testData.departamentos);
    }
    if (label.includes('municipio de nacimiento')) {
      return this.getRandomFromArray(testData.municipios);
    }
    if (label.includes('distrito de nacimiento')) {
      return this.getRandomFromArray(testData.distritos);
    }
    if (
      label.includes('cantón de nacimiento') ||
      label.includes('canton de nacimiento')
    ) {
      return this.getRandomFromArray(testData.cantones);
    }
    if (
      label.includes('dirección específica de nacimiento') ||
      label.includes('direccion especifica de nacimiento')
    ) {
      return this.getRandomFromArray(testData.direccionesEspecificas);
    }
    if (
      label.includes('país de residencia') ||
      label.includes('pais de residencia')
    ) {
      return this.getRandomFromArray(testData.paises);
    }
    if (label.includes('departamento de residencia según dui')) {
      return this.getRandomFromArray(testData.departamentos);
    }
    if (label.includes('distrito o ciudad de residencia según dui')) {
      return this.getRandomFromArray(testData.municipios);
    }
    if (label.includes('departamento de residencia')) {
      return this.getRandomFromArray(testData.departamentos);
    }
    if (label.includes('municipio de residencia')) {
      return this.getRandomFromArray(testData.municipios);
    }
    if (label.includes('distrito de residencia')) {
      return this.getRandomFromArray(testData.distritos);
    }
    if (label.includes('distrito de registro')) {
      return this.getRandomFromArray(testData.distritos);
    }
    if (
      label.includes('cantón de residencia') ||
      label.includes('canton de residencia')
    ) {
      return this.getRandomFromArray(testData.cantones);
    }
    if (label.includes('dirección específica')) {
      return this.getRandomFromArray(testData.direccionesEspecificas);
    }
    if (label.includes('oficina de registro')) {
      return 'Oficina Regional ' + this.getRandomFromArray(testData.municipios);
    }
    if (label.includes('nui')) {
      return this.generateRandomNUI();
    }
    if (label.includes('tipo de documento')) {
      return this.getRandomFromArray(testData.documentos);
    }
    if (
      label.includes('numero de documento') ||
      label.includes('número de documento')
    ) {
      return this.generateRandomDUI();
    }
    if (label.includes('edad')) {
      return Math.floor(Math.random() * 60) + 18;
    }
    if (label.includes('nacionalidad')) {
      return this.getRandomFromArray(testData.nacionalidades);
    }
    if (label.includes('estado familiar') || label.includes('estado civil')) {
      return this.getRandomFromArray(testData.estadosFamiliares);
    }
    if (
      label.includes('genero') ||
      label.includes('género') ||
      label.includes('sexo')
    ) {
      return this.getRandomFromArray(testData.generos);
    }
    if (
      label.includes('profesión u oficio') ||
      label.includes('profesion u oficio')
    ) {
      return this.getRandomFromArray(testData.profesiones);
    }
    if (
      label.includes('ocupación actual') ||
      label.includes('ocupacion actual')
    ) {
      return this.getRandomFromArray(testData.ocupaciones);
    }
    if (label.includes('profesion') || label.includes('profesión')) {
      return this.getRandomFromArray(testData.profesiones);
    }
    if (label.includes('sabe leer y escribir')) {
      return this.getRandomFromArray(testData.respuestasSiNo);
    }
    if (label.includes('grado aprobado')) {
      return this.getRandomFromArray(testData.gradosEducativos);
    }
    if (
      label.includes('número de hijos') ||
      label.includes('numero de hijos')
    ) {
      return Math.floor(Math.random() * 8) + 1;
    }
    if (label.includes('nacidos vivos que continuan vivos')) {
      return Math.floor(Math.random() * 5) + 1;
    }
    if (label.includes('nacidos vivos que han fallecido')) {
      return Math.floor(Math.random() * 3);
    }
    if (label.includes('nacieron muertos')) {
      return Math.floor(Math.random() * 2);
    }
    if (label.includes('tipo de parto')) {
      return this.getRandomFromArray(testData.tiposParto);
    }
    if (label.includes('clase de parto')) {
      return this.getRandomFromArray(testData.clasesParto);
    }
    if (
      label.includes('duración de embarazo en semanas') ||
      label.includes('duracion de embarazo en semanas')
    ) {
      return Math.floor(Math.random() * 12) + 28;
    }
    if (label.includes('tipo de asistencia')) {
      return this.getRandomFromArray(testData.tiposAsistencia);
    }
    if (label.includes('nombre del asistente')) {
      return this.getRandomFromArray(testData.nombresAsistentes);
    }
    if (label.includes('tipo de centro de salud')) {
      return this.getRandomFromArray(testData.tiposCentroSalud);
    }
    if (label.includes('peso al nacer en gramos')) {
      return Math.floor(Math.random() * 2000) + 2500;
    }
    if (
      label.includes('talla al nacer en centimetros') ||
      label.includes('talla al nacer en centímetros')
    ) {
      return Math.floor(Math.random() * 10) + 45;
    }
    if (label.includes('hora de nacimiento')) {
      const hours = Math.floor(Math.random() * 24)
        .toString()
        .padStart(2, '0');
      const minutes = Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    if (
      label.includes('número de boleta') ||
      label.includes('numero de boleta')
    ) {
      return Math.floor(Math.random() * 900000) + 100000;
    }
    if (label.includes('país') || label.includes('pais')) {
      return this.getRandomFromArray(testData.paises);
    }
    if (label.includes('departamento')) {
      return this.getRandomFromArray(testData.departamentos);
    }
    if (label.includes('municipio')) {
      return this.getRandomFromArray(testData.municipios);
    }
    if (label.includes('cantón') || label.includes('canton')) {
      return this.getRandomFromArray(testData.cantones);
    }
    if (label.includes('distrito')) {
      return this.getRandomFromArray(testData.distritos);
    }
    if (label.includes('direccion') || label.includes('dirección')) {
      return this.getRandomFromArray(testData.direcciones);
    }
    if (fieldType === 'input' && label.includes('nombre')) {
      return this.getRandomFromArray(testData.nombres);
    }
    if (fieldType === 'input' && label.includes('apellido')) {
      return this.getRandomFromArray(testData.apellidos);
    }
    if (
      fieldType === 'number' ||
      label.includes('numero') ||
      label.includes('número')
    ) {
      return Math.floor(Math.random() * 1000000) + 1;
    }
    if (fieldType === 'input' && !label.includes('fecha')) {
      return 'Dato de prueba';
    }

    return null;
  }

  private getRandomFromArray(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  private getRandomBirthDate(): string {
    const start = new Date(1950, 0, 1);
    const end = new Date(2010, 11, 31);
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
    const month = (randomDate.getMonth() + 1).toString().padStart(2, '0');
    const day = randomDate.getDate().toString().padStart(2, '0');
    const year = randomDate.getFullYear().toString();
    return `${month}/${day}/${year}`;
  }

  private generateRandomDUI(): string {
    const randomNumber = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');
    return `${randomNumber.substring(0, 8)}-${Math.floor(Math.random() * 10)}`;
  }

  private generateRandomNUI(): string {
    return Math.floor(Math.random() * 1000000000).toString();
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