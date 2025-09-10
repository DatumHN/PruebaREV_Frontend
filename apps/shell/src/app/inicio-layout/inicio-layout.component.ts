import { inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavigationService } from '../services/navigation.service';
import { Subscription } from 'rxjs';
import { BreadcrumbComponent } from '../components/breadcrumb/breadcrumb.component';
import { LoadingComponent } from '../components/loading/loading.component';

@Component({
  selector: 'app-inicio-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    BreadcrumbComponent,
    LoadingComponent,
  ],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-loading></app-loading>
      <app-header />
      <div class="flex flex-1 relative">
        <app-sidebar
          *ngIf="isSidebarVisible"
          class="fixed left-0 top-16 bottom-0 z-40 transition-transform transition-opacity duration-300 ease-in-out w-64"
          [ngClass]="{
            'opacity-0 -translate-x-8 pointer-events-none': !isSidebarVisible,
            'opacity-100 translate-x-0': isSidebarVisible
          }"
        />
        <main
          class="flex-1 bg-gray-50 flex flex-col transition-all duration-300 ease-in-out"
          [ngClass]="{ 'ml-64': isSidebarVisible, 'ml-0': !isSidebarVisible }"
        >
          <app-breadcrumb></app-breadcrumb>
          <div class="flex-1 p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <app-footer />
    </div>
  `,
})
export class InicioLayoutComponent implements OnInit, OnDestroy {
  navService = inject(NavigationService);
  isSidebarVisible = true;
  private sidebarSub: Subscription | undefined;

  ngOnInit() {
    this.sidebarSub = this.navService.sidebarCollapsed$.subscribe(
      (collapsed) => {
        this.isSidebarVisible = !collapsed;
      },
    );
  }

  ngOnDestroy() {
    this.sidebarSub?.unsubscribe();
  }
}
