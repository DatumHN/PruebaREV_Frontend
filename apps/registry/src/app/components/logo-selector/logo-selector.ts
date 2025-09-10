import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Subject } from 'rxjs';

import { SelectModule } from 'primeng/select';
import { SelectChangeEvent } from 'primeng/select';

import { Logo, LogoData } from '../../services/logo/logo';

@Component({
  selector: 'app-logo-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  template: `
    <div class="logo-selector">
      <label for="logo-select" class="block text-sm font-medium mb-2">
        Seleccionar Logo
      </label>

      <p-select
        inputId="logo-select"
        [options]="logos"
        [(ngModel)]="selectedLogo"
        optionLabel="nombre"
        placeholder="Seleccionar logo..."
        [loading]="isLoadingLogos"
        (onChange)="onLogoChange($event)"
        class="tw-w-full md:tw-w-56 "
      >
      </p-select>

      <!-- Logo Preview -->
      @if (selectedLogo && selectedLogo.imagebase64) {
        <div class="mt-4">
          <p class="text-sm font-medium mb-2">Vista previa:</p>
          <div class="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
            <img
              [src]="selectedLogo.imagebase64"
              [alt]="selectedLogo.nombre"
              class="max-w-32 max-h-16 object-contain"
            />
            <span class="text-sm font-medium">{{ selectedLogo.nombre }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class LogoSelectorComponent implements OnInit, OnDestroy {
  @Input() selectedLogo: LogoData | null = null;
  @Output() logoSelected = new EventEmitter<LogoData>();
  @Output() logoBase64Changed = new EventEmitter<string>();

  private logoService = inject(Logo);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  logos: LogoData[] = [];
  isLoadingLogos = false;

  ngOnInit() {
    this.loadAvailableLogos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadAvailableLogos() {
    this.isLoadingLogos = true;
    try {
      const defaultLogoBase64 = await this.loadDefaultLogo();
      this.logos = await lastValueFrom(this.logoService.getLogos());

      const defaultLogo: LogoData = {
        id: 'default',
        nombre: 'RNP El Salvador (Logo por defecto)',
        imagebase64: defaultLogoBase64 || '',
      };

      this.logos.unshift(defaultLogo);
      this.selectedLogo = defaultLogo;
      this.logoSelected.emit(defaultLogo);
      this.logoBase64Changed.emit(defaultLogoBase64);
    } catch (error: unknown) {
      console.error('Error al cargar los logos desde la API:', error);
      const defaultLogoBase64 = await this.loadDefaultLogo().catch(() => '');

      const defaultLogo: LogoData = {
        id: 'default',
        nombre: 'RNP El Salvador (Logo por defecto)',
        imagebase64: defaultLogoBase64,
      };

      this.logos = [defaultLogo];
      this.selectedLogo = defaultLogo;
      this.logoSelected.emit(defaultLogo);
      this.logoBase64Changed.emit(defaultLogoBase64);
    } finally {
      this.isLoadingLogos = false;
    }
  }

  private async loadDefaultLogo(): Promise<string> {
    try {
      const logoPath = '/assets/logos/RNPNFooter.png';
      const response = await lastValueFrom(
        this.http.get(logoPath, { responseType: 'blob' }),
      );
      return await this.convertBlobToBase64(response);
    } catch (error: unknown) {
      console.error('Error al cargar el logo por defecto:', error);
      throw error;
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

  onLogoChange(event: SelectChangeEvent) {
    if (event.value) {
      this.selectedLogo = event.value;
      this.logoSelected.emit(event.value);
      this.logoBase64Changed.emit(event.value.imagebase64);
    }
  }
}
