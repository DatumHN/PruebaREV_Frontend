import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { formDataJson } from '../../data/birth-request-data';

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

// Interfaz para la respuesta del correlativo del backend
interface CorrelativoResponse {
  correlativo: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http: HttpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:8081'; // Asegúrate que esta sea tu URL de backend
  private baseUrlOpen = 'http://localhost:8082';

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

  getSelects(): Observable<Principales[]> {
    return this.http
      .get<Principales[]>(`${this.baseUrl}/`)
      .pipe(catchError(this.handleError));
  }

  getSelectsById(id: string): Observable<Principales[]> {
    return this.http
      .get<Principales[]>(`${this.baseUrl}/tiposdocumentos/superior?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  getCorrelativo(id: number): Observable<string> {
    return this.http
      .get<
        CorrelativoResponse[]
      >(`${this.baseUrl}/tiposdocumentos/correlativo?id=${id}`)
      .pipe(
        map((response) => response[0]?.correlativo),
        catchError(this.handleError),
      );
  }

  getformUniq(id: string, roles: string): Observable<any> {
    const params = new HttpParams().set('rol', roles);
    return this.http
      .get<any>(
        `${this.baseUrl}/optimized/tipodocumentos/${id}/secciones/entity-graph`,
        {
          params,
        },
      )
      .pipe(catchError(this.handleError));
  }

  getApproveFormById(
    idtipodocumento: string,
    id: string,
    rol: string,
  ): Observable<any[]> {
    return this.http
      .get<
        any[]
      >(`${this.baseUrl}/tiposdocumentos/solicitudCompleta?id=${idtipodocumento}&rol=${rol}&solicitud=${id}`)
      .pipe(catchError(this.handleError));
  }

  updateRequestStatus(
    status: string,
    solicitudId: string,
    payload: any,
  ): Observable<any> {
    if (status === 'Aprobado') {
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      return this.http
        .put<any>(
          `${this.baseUrl}/solicitudes/actualizar/${solicitudId}`,
          payload,
          { headers },
        )
        .pipe(catchError(this.handleError));
    } else if (status === 'Rechazado') {
      return this.http
        .put<any>(
          `${this.baseUrl}/solicitudes/estado/${status}/solicitud/${solicitudId}`,
          payload,
        )
        .pipe(catchError(this.handleError));
    } else {
      const errorMsg = `Estado no válido: '${status}'. Se esperaba 'Aprobado' o 'Rechazado'.`;
      console.error(errorMsg);
      return throwError(() => new Error(errorMsg));
    }
  }

  getControlsById(id: string): Observable<Principales[]> {
    return this.http
      .get<Principales[]>(`${this.baseUrl}/controls/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCatalogoHijo(id: number | string): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/catalogo/catalogoHijo?id=${id}`)
      .pipe(catchError(this.handleError));
  }

  createSelect(newRequest: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<any>(`${this.baseUrl}/solicitudes/crear`, newRequest, { headers })
      .pipe(catchError(this.handleError));
  }

  uploadAnexos(anexos: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrlOpen}/documents/anexos?`, anexos)
      .pipe(catchError(this.handleError));
  }

  updateSelect(item: { id: any }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .put<any>(`${this.baseUrl}/${item.id}`, item, { headers })
      .pipe(catchError(this.handleError));
  }

  getBirthCertificateData(): Observable<any> {
    return of(formDataJson);
  }
}
