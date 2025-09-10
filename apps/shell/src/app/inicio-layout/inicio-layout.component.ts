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
    <div class="tw-flex tw-flex-col tw-min-h-screen tw-bg-white">
      <app-loading></app-loading>
      <app-header />
      <div class="tw-flex tw-flex-1 tw-relative">
        <app-sidebar
          class="tw-fixed tw-left-0 tw-top-16 tw-bottom-0 tw-z-40 tw-transition-all tw-duration-500 tw-ease-in-out tw-overflow-hidden"
          [ngClass]="{
            'tw-w-0': !isSidebarVisible,
            'tw-w-[280px]': isSidebarVisible,
          }"
        />
        <main
          class="tw-flex-1 tw-flex tw-flex-col tw-transition-all tw-duration-500 tw-ease-in-out tw-mt-16"
          style="background-color: #f5f7fb;"
          [ngClass]="{
            'tw-ml-[280px]': isSidebarVisible,
            'tw-ml-0': !isSidebarVisible,
          }"
        >
          <app-breadcrumb></app-breadcrumb>
          <div class="tw-flex-1 tw-p-6">
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
