import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'warn' | 'info';
  summary: string;
  detail?: string;
  life?: number; // Duration in milliseconds
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class TailwindToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private defaultLife = 5000; // 5 seconds

  add(toast: Omit<ToastMessage, 'id' | 'timestamp'>) {
    const newToast: ToastMessage = {
      ...toast,
      id: this.generateId(),
      timestamp: Date.now(),
      life: toast.life || this.defaultLife,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto-remove after specified time
    if (newToast.life && newToast.life > 0) {
      setTimeout(() => {
        this.remove(newToast.id);
      }, newToast.life);
    }
  }

  remove(id: string) {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  clear() {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Convenience methods to match PrimeNG MessageService API
  addSuccess(summary: string, detail?: string, life?: number) {
    this.add({
      severity: 'success',
      summary,
      ...(detail && { detail }),
      ...(life && { life }),
    });
  }

  addError(summary: string, detail?: string, life?: number) {
    this.add({
      severity: 'error',
      summary,
      ...(detail && { detail }),
      ...(life && { life }),
    });
  }

  addWarn(summary: string, detail?: string, life?: number) {
    this.add({
      severity: 'warn',
      summary,
      ...(detail && { detail }),
      ...(life && { life }),
    });
  }

  addInfo(summary: string, detail?: string, life?: number) {
    this.add({
      severity: 'info',
      summary,
      ...(detail && { detail }),
      ...(life && { life }),
    });
  }
}
