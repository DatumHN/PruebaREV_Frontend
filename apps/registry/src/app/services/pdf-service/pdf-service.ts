import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Definimos los tipos aquí para usarlos en toda la clase.
type PdfMake = typeof import('pdfmake/build/pdfmake');
type TCreatedPdf = ReturnType<PdfMake['createPdf']>;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private http: HttpClient = inject(HttpClient);
  // Guardamos la instancia de pdfMake una vez cargada para no recargarla.
  private pdfMakeInstance: PdfMake | null = null;

  /**
   * Carga dinámica de pdfMake y sus fuentes.
   * Este método se asegura de que la librería y sus fuentes estén completamente cargadas
   * y configuradas ANTES de intentar usarlas.
   */
  private async getPdfMake(): Promise<PdfMake> {
    if (this.pdfMakeInstance) {
      return this.pdfMakeInstance;
    }

    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

    // SOLUCIÓN DEFINITIVA: Asignamos 'vfs' directamente desde el módulo de fuentes.
    // El error de TypeScript nos indica que esta es la estructura correcta en tu proyecto.
    pdfMakeModule.vfs = pdfFontsModule.vfs;

    this.pdfMakeInstance = pdfMakeModule;
    return this.pdfMakeInstance;
  }

  private async createPdfInstance(
    docDefinition: TDocumentDefinitions,
  ): Promise<TCreatedPdf> {
    const pdfMake = await this.getPdfMake();
    return pdfMake.createPdf(docDefinition);
  }

  private async getPdfBlob(docDefinition: TDocumentDefinitions): Promise<Blob> {
    const pdf = await this.createPdfInstance(docDefinition);
    return new Promise<Blob>((resolve) => pdf.getBlob(resolve));
  }

  public async downloadPdf(
    docDefinition: TDocumentDefinitions,
    fileName: string,
  ): Promise<void> {
    const pdf = await this.createPdfInstance(docDefinition);
    await new Promise<void>((resolve) => pdf.download(fileName, resolve));
  }

  public async generatePdfAsDataUrl(
    docDefinition: TDocumentDefinitions,
  ): Promise<string> {
    const pdf = await this.createPdfInstance(docDefinition);
    return new Promise<string>((resolve, reject) => {
      try {
        pdf.getDataUrl((dataUrl: string) => resolve(dataUrl));
      } catch (error) {
        console.error('Error al generar la data URL del PDF:', error);
        reject(error);
      }
    });
  }

  public async sendPdfToRest(
    docDefinition: TDocumentDefinitions,
    nombreDocumento: string,
    jsonGeneral: any,
    jsonTitular: any,
    endpointUrl = 'http://localhost:8082/documents/uploadSololicitud',
  ): Promise<any> {
    const pdfBlob = await this.getPdfBlob(docDefinition);
    const formData = new FormData();

    // 1. Adjuntar el archivo PDF
    formData.append('alcaldia', `0002`);
    formData.append('content', pdfBlob, `${nombreDocumento}.pdf`);

    // 2. Adjuntar el primer JSON (general) como un Blob
    // const jsonGeneralBlob = new Blob([JSON.stringify(jsonGeneral)], { type: 'application/json' });
    formData.append('general', JSON.stringify(jsonGeneral));
    console.log('JSON General adjuntado:', JSON.stringify(jsonGeneral));
    // 3. Adjuntar el segundo JSON (titular) como un Blob
    //const jsonTitularBlob = new Blob([JSON.stringify(jsonTitular)], { type: 'application/json' });
    formData.append('titular', JSON.stringify(jsonTitular));
    console.log('JSON Titular adjuntado:', JSON.stringify(jsonTitular));
    // Mantenemos este campo por si el backend lo requiere explícitamente.
    formData.append('fileName', `${nombreDocumento}.pdf`);

    return lastValueFrom(this.http.post(endpointUrl, formData));
  }
}
