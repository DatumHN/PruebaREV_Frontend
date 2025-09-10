import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { LucideAngularModule, Home, ChevronRight } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { RegistryNavigationService } from '../../services/registry-navigation.service';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
  icon?: any;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  template: `
    <nav
      class="flex px-6 py-3 bg-white border-b border-gray-200"
      aria-label="Breadcrumb"
    >
      <ol class="inline-flex items-center space-x-1 md:space-x-3">
        @for (breadcrumb of breadcrumbs; track $index) {
          <li class="inline-flex items-center">
            @if (!$first) {
              <lucide-angular
                [img]="ChevronRight"
                class="w-4 h-4 text-gray-400 mx-1"
              ></lucide-angular>
            }
            @if (breadcrumb.active) {
              <span class="flex items-center text-sm font-medium text-gray-500">
                @if (breadcrumb.icon) {
                  <lucide-angular
                    [img]="breadcrumb.icon"
                    class="w-4 h-4 mr-2"
                  ></lucide-angular>
                }
                {{ breadcrumb.label }}
              </span>
            } @else {
              <a
                [routerLink]="breadcrumb.url"
                class="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                @if (breadcrumb.icon) {
                  <lucide-angular
                    [img]="breadcrumb.icon"
                    class="w-4 h-4 mr-2"
                  ></lucide-angular>
                }
                {{ breadcrumb.label }}
              </a>
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private registryNavService: RegistryNavigationService,
  ) {}

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
    url: string = '',
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
      const label = this.getLabelForRoute(url, child);
      const icon = this.getIconForRoute(url);

      if (label && !breadcrumbs.some(b => b.url === url)) {
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

  private getLabelForRoute(url: string, route: ActivatedRoute): string {
    // Handle inicio route
    if (url === '/inicio') {
      return 'Inicio';
    }

    // Handle registry routes
    if (url.includes('/inicio/registry')) {
      if (url === '/inicio/registry' || url === '/inicio/registry/welcome') {
        return 'Registro Principal';
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

  private getIconForRoute(url: string): any {
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
