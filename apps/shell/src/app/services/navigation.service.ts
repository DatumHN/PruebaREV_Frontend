import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  get collapseSidebar(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  set collapseSidebar(value: boolean) {
    this.sidebarCollapsedSubject.next(value);
  }

  toggleSidebar(): void {
    this.collapseSidebar = !this.collapseSidebar;
  }
}
