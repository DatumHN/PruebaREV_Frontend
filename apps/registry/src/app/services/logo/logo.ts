import { inject, Injectable } from '@angular/core';
import { Observable, from, lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface LogoData {
  id: string;
  nombre: string;
  imagebase64: string;
}

@Injectable()
export class Logo {
  private http: HttpClient = inject(HttpClient);

  getLogos(): Observable<LogoData[]> {
    // Return available logos as static data since /assets/logos contains image files
    const availableLogos: LogoData[] = [
      {
        id: 'gobierno',
        nombre: 'Logo Gobierno',
        imagebase64: '',
      },
      {
        id: 'rnpn-footer',
        nombre: 'RNPN Footer Logo',
        imagebase64: '',
      },
    ];

    // Load the actual image data for each logo
    return from(this.loadLogosWithBase64Data(availableLogos));
  }

  getLogoById(id: string): Observable<LogoData> {
    return this.getLogos().pipe(
      map((logos) => logos.find((logo) => logo.id === id)),
      map((logo) => {
        if (!logo) {
          throw new Error(`Logo with id '${id}' not found`);
        }
        return logo;
      }),
    );
  }

  private async loadLogosWithBase64Data(
    logos: LogoData[],
  ): Promise<LogoData[]> {
    const logoMap: { [key: string]: string } = {
      gobierno: '/assets/logos/gobierno.png',
      'rnpn-footer': '/assets/logos/RNPNFooter.png',
    };

    const loadedLogos: LogoData[] = [];

    for (const logo of logos) {
      try {
        const logoPath = logoMap[logo.id];
        if (logoPath) {
          const response = await lastValueFrom(
            this.http.get(logoPath, { responseType: 'blob' }),
          );
          const base64Data = await this.convertBlobToBase64(response);
          loadedLogos.push({
            ...logo,
            imagebase64: base64Data,
          });
        }
      } catch (error) {
        console.warn(`Failed to load logo ${logo.id}:`, error);
        // Add logo without base64 data as fallback
        loadedLogos.push(logo);
      }
    }

    return loadedLogos;
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
