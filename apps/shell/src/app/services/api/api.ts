import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Interfaz que describe la estructura de los objetos en el arreglo
export interface Principales {
  id: number | string;
  idSuperior: number | string | null;
  nombre: string;
  plazoRespuesta: string | null;
  secuencia: number;
  activo: boolean;
  tipoCorrelativo: string | null;
  etiqueta: string;
}

// Interfaz para la respuesta de la lista de solicitudes
export interface RequestList {
  id: number;
  correlativo: string;
  fechaSolicitud: string;
  tipoDocumento: {
    id: number;
    idSuperior: number;
    nombre: string;
    terzoResponsa: number;
    sequencia: number;
    activo: string;
    tipoCorrelativo: string;
    etiqueta: string;
  };
  detallesSolicitudes: any[];
  uuid: string | null;
  estado: string;
  // Campos opcionales para compatibilidad con la tabla actual
  solicitante?: string;
  documIdentidad?: string;
  asignado?: string;
}

// Interfaz para la respuesta del correlativo del backend
interface CorrelativoResponse {
  correlativo: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:8081';

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Función actualizada para obtener la lista de solicitudes
  getRequestList(): Observable<RequestList[]> {
    return this.http
      .get<RequestList[]>(`${this.baseUrl}/solicitudes`)
      .pipe(catchError(this.handleError));
  }

  // --- MÉTODOS EXISTENTES ---
  getSelectsById(id: string): Observable<Principales[]> {
    return this.http
      .get<Principales[]>(`${this.baseUrl}/tiposdocumentos/superior/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCorrelativo(id: number): Observable<string> {
    return this.http
      .get<CorrelativoResponse>(`${this.baseUrl}/correlativos/generar/${id}`)
      .pipe(
        catchError(this.handleError),
        map((response) => response.correlativo),
      );
  }

  createSelect(payload: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/solicitudes`, payload)
      .pipe(catchError(this.handleError));
  }

  getformUniq(id: string, rol: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/secciones/portipodocumento/${id}/${rol}`)
      .pipe(catchError(this.handleError));
  }

  uploadAnexos(formData: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/anexos/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  getApproveFormById(id: string, rol: string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/secciones/porsolicitud/${id}/${rol}`)
      .pipe(catchError(this.handleError));
  }

  updateRequestStatus(
    status: string,
    id: string,
    payload: any,
  ): Observable<any> {
    const endpoint =
      status === 'Aprobado'
        ? `/solicitudes/actualizar`
        : `/solicitudes/cambiarestado/${id}/${status}`;
    const request =
      status === 'Aprobado'
        ? this.http.put(endpoint, payload)
        : this.http.put(endpoint, {});
    return request.pipe(catchError(this.handleError));
  }
}
