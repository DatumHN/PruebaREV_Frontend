import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCountSubject = new BehaviorSubject<number>(0);

  constructor(private router: Router) {
    this.initRouterLoading();
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get loadingCount$(): Observable<number> {
    return this.loadingCountSubject.asObservable();
  }

  private initRouterLoading(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.hide();
      }
    });
  }

  show(): void {
    const currentCount = this.loadingCountSubject.value;
    this.loadingCountSubject.next(currentCount + 1);
    this.loadingSubject.next(true);
  }

  hide(): void {
    const currentCount = this.loadingCountSubject.value;
    const newCount = Math.max(0, currentCount - 1);
    this.loadingCountSubject.next(newCount);

    if (newCount === 0) {
      // Add small delay to prevent flickering
      setTimeout(() => {
        if (this.loadingCountSubject.value === 0) {
          this.loadingSubject.next(false);
        }
      }, 100);
    }
  }

  forceHide(): void {
    this.loadingCountSubject.next(0);
    this.loadingSubject.next(false);
  }
}
