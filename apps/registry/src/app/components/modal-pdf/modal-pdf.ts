import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// --- PrimeNG ---
// SOLUCIÓN: Importamos DynamicDialogRef para poder controlar el modal.
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
// SOLUCIÓN: Importamos el módulo para el botón.
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

// --- Servicios ---
import { PdfService } from '../../services/pdf-service/pdf-service';

@Component({
  selector: 'app-modal-pdf',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    // SOLUCIÓN: Añadimos los módulos de PrimeNG a los imports.
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './modal-pdf.html',
  styleUrls: ['./modal-pdf.css'],
})
export class ModalPdf implements OnInit {
  // --- Inyección de Dependencias ---
  private pdfService = inject(PdfService);
  private dialogConfig = inject(DynamicDialogConfig);
  // SOLUCIÓN: Inyectamos la referencia al diálogo.
  private dialogRef = inject(DynamicDialogRef);
  private sanitizer = inject(DomSanitizer);

  // --- Propiedades ---
  public pdfUrl: SafeResourceUrl | null = null;
  public isLoading = true;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    const docDefinition = this.dialogConfig.data?.docDefinition;

    if (!docDefinition) {
      this.errorMessage =
        'No se proporcionó la definición del documento para generar el PDF.';
      this.isLoading = false;
      return;
    }

    this.pdfService
      .generatePdfAsDataUrl(docDefinition)
      .then((dataUrl) => {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
      })
      .catch((err) => {
        this.errorMessage =
          'Ocurrió un error al generar la vista previa del PDF.';
        console.error('Error en ModalPdf:', err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  /**
   * SOLUCIÓN: Nuevo método para cerrar el modal.
   */
  public closeModal(): void {
    this.dialogRef.close();
  }
}
