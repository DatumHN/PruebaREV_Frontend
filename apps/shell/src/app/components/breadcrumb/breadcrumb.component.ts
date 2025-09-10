import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { RegistryNavigationService } from '@revfa/routing';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
  icon?: typeof Home | null;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  template: `
    <nav aria-label="breadcrumb" class="tw-w-full tw-pt-4">
      <ol
        class="tw-flex tw-w-full tw-flex-wrap tw-items-center tw-rounded-md tw-px-6 tw-py-8"
      >
        @for (breadcrumb of breadcrumbs; track $index) {
          <li
            class="tw-flex tw-cursor-pointer tw-items-center tw-text-sm tw-text-rnpn-primary tw-transition-colors tw-duration-300 hover:tw-text-slate-800"
          >
            @if (breadcrumb.active) {
              <span class="tw-flex tw-items-center">
                @if (breadcrumb.icon) {
                  <lucide-angular
                    [img]="breadcrumb.icon"
                    class="tw-w-4 tw-h-4 tw-mr-2"
                  ></lucide-angular>
                }
                {{ breadcrumb.label }}
              </span>
            } @else {
              <a [routerLink]="breadcrumb.url" class="tw-flex tw-items-center">
                @if (breadcrumb.icon) {
                  <lucide-angular
                    [img]="breadcrumb.icon"
                    class="tw-w-4 tw-h-4 tw-mr-2"
                  ></lucide-angular>
                }
                {{ breadcrumb.label }}
              </a>
              <span class="tw-pointer-events-none tw-mx-2 tw-text-slate-800">
                /
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        flex-shrink: 0;
      }

      nav {
        min-height: auto;
        flex-shrink: 0;
      }
    `,
  ],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  readonly Home = Home;
  readonly ChevronRight = ChevronRight;

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private registryNavService = inject(RegistryNavigationService);

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      });

    // Initial breadcrumbs
    this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // Create breadcrumb based on route
      const label = this.getLabelForRoute(url);
      const icon = this.getIconForRoute(url);

      if (label && !breadcrumbs.some((b) => b.url === url)) {
        breadcrumbs.push({
          label,
          url,
          active: false,
          icon,
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    // Mark the last breadcrumb as active
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].active = true;
    }

    return breadcrumbs;
  }

  private getLabelForRoute(url: string): string {
    // Handle inicio route
    if (url === '/inicio') {
      return 'Inicio';
    }

    // Handle registry routes
    if (url.includes('/inicio/registry')) {
      // Skip showing "Registro Principal" for base registry routes to avoid redundancy
      if (url === '/inicio/registry' || url === '/inicio/registry/welcome') {
        return '';
      }

      // Handle form routes
      const formMatch = url.match(/\/inicio\/registry\/form\/(\d+)/);
      if (formMatch) {
        const formId = parseInt(formMatch[1]);
        const menuItem = this.registryNavService
          .getRegistryMenuItems()
          .find((item) => item.route.includes(`/form/${formId}`));
        return menuItem ? menuItem.title : `Formulario ${formId}`;
      }
    }

    return '';
  }

  private getIconForRoute(url: string): typeof Home | null {
    if (url === '/inicio') {
      return Home;
    }

    // Handle registry form routes
    const formMatch = url.match(/\/inicio\/registry\/form\/(\d+)/);
    if (formMatch) {
      const formId = parseInt(formMatch[1]);
      const menuItem = this.registryNavService
        .getRegistryMenuItems()
        .find((item) => item.route.includes(`/form/${formId}`));
      return menuItem ? menuItem.icon : null;
    }

    return null;
  }
}
