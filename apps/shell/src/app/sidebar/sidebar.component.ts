import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Home,
  Users,
  Settings,
  BarChart3,
  ChevronRight,
  ChevronDown,
  User,
  HelpCircle,
} from 'lucide-angular';
import { UserInfoComponent } from '../user-info/user-info.component';
import { NavigationService } from '../services/navigation.service';
import { RegistryMenuItem, RegistryNavigationService } from '@revfa/routing';
import {
  RouterLink,
  RouterLinkActive,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthStateService } from '@revfa/auth-shared';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    UserInfoComponent,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    UserInfoComponent,
  ],
  template: `
    <div
      class="tw-px-4 tw-h-full tw-bg-white  tw-border-r tw-border-gray-200 tw-flex tw-flex-col tw-overflow-hidden tw-pt-4 tw-transition-opacity tw-duration-700 tw-ease-in-out tw-delay-200"
      [ngClass]="{
        'tw-opacity-0': navService.sidebarCollapsed$ | async,
        'tw-opacity-100': (navService.sidebarCollapsed$ | async) === false,
      }"
    >
      <!-- User Info Section -->
      <div
        class=" tw-text-white tw-transition-all tw-duration-300"
        [ngClass]="{ 'px-2 py-2': navService.sidebarCollapsed$ | async }"
      >
        <div
          *ngIf="
            (navService.sidebarCollapsed$ | async) === false;
            else collapsedUserInfo
          "
        >
          <app-user-info></app-user-info>
        </div>
        <ng-template #collapsedUserInfo>
          <div class="tw-flex tw-items-center tw-justify-center tw-py-3">
            <div
              class="tw-w-8 tw-h-8 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center"
            >
              <lucide-angular
                [img]="User"
                class="tw-w-5 tw-h-5"
              ></lucide-angular>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Navigation -->
      <nav class="tw-flex-1 tw-overflow-y-auto">
        <div
          [ngClass]="{
            'px-1': navService.sidebarCollapsed$ | async,
            'px-3': (navService.sidebarCollapsed$ | async) === false,
          }"
          class="tw-py-4"
        >
          <!-- Expanded View -->
          <div *ngIf="(navService.sidebarCollapsed$ | async) === false">
            <!-- Mobile Back Button -->
            <div
              class="mobile-back md:tw-hidden tw-mb-4 tw-flex tw-items-center tw-justify-end tw-text-gray-600"
            >
              <span class="tw-mr-2 tw-text-sm">Atrás</span>
              <lucide-angular
                [img]="ChevronRight"
                class="tw-w-4 tw-h-4"
              ></lucide-angular>
            </div>

            <!-- Pages Section -->
            <div class="tw-mb-6">
              <h6
                class="tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-mb-2"
              >
                Páginas
              </h6>

              <!-- Inicio Menu -->
              <div class="tw-mb-2">
                <button
                  (click)="toggleSubmenu('inicio')"
                  class="nav-link tw-w-full tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2.5 tw-rounded-lg tw-text-left tw-transition-all tw-duration-200 hover:tw-bg-[#050e5b] hover:tw-text-[#99a3f9] tw-group "
                  [ngClass]="{
                    'tw-bg-[#050e5b] tw-text-[#99a3f9] tw-shadow-sm':
                      activeSubmenu === 'inicio',
                  }"
                >
                  <div class="tw-flex tw-items-center tw-space-x-3">
                    <lucide-angular
                      [img]="Home"
                      class="tw-w-5 tw-h-5"
                    ></lucide-angular>
                    <span class="tw-font-medium tw-text-sm">Inicio</span>
                  </div>
                  <lucide-angular
                    [img]="
                      activeSubmenu === 'inicio' ? ChevronDown : ChevronRight
                    "
                    class="tw-w-4 tw-h-4 tw-transition-transform tw-duration-200"
                  ></lucide-angular>
                </button>

                <!-- Inicio Subitems -->
                <div
                  class="tw-ml-8 tw-mt-2 tw-space-y-1 tw-overflow-hidden tw-transition-all tw-duration-300"
                  [ngClass]="{
                    'tw-max-h-0': activeSubmenu !== 'inicio',
                    'tw-max-h-96': activeSubmenu === 'inicio',
                  }"
                >
                  <a
                    routerLink="/inicio/Principal"
                    routerLinkActive="tw-text-blue-600"
                    class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                  >
                    Principal
                  </a>
                  <a
                    routerLink="/inicio/approve-table"
                    routerLinkActive="tw-text-blue-600"
                    class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                  >
                    Partidas Nacimiento
                  </a>
                  <a
                    routerLink="/inicio/registros"
                    routerLinkActive="tw-text-blue-600"
                    class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                  >
                    Registros
                  </a>
                </div>
              </div>
            </div>

            <!-- Sistema Section -->
            @if (
              authState.hasAnyRole([
                'admin',
                'administrador-rnpn',
                'registrador-sistema',
                'administrador-catalogos',
                'admin-log-npe',
              ])
            ) {
              <div>
                <h6
                  class="tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-500 tw-uppercase tw-tracking-wider tw-mb-2"
                >
                  Sistema
                </h6>

                <!-- Configuración Menu -->
                <div class="tw-mb-2">
                  <button
                    (click)="toggleSubmenu('config')"
                    class="nav-link tw-w-full tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2.5 tw-rounded-lg tw-text-left tw-transition-all tw-duration-200 hover:tw-bg-[#050e5b] hover:tw-text-[#99a3f9] tw-group "
                    [ngClass]="{
                      'tw-bg-[#050e5b] tw-text-[#99a3f9] tw-shadow-sm':
                        activeSubmenu === 'config',
                    }"
                  >
                    <div class="tw-flex tw-items-center tw-space-x-3">
                      <lucide-angular
                        [img]="Settings"
                        class="tw-w-5 tw-h-5"
                      ></lucide-angular>
                      <span class="tw-font-medium tw-text-sm"
                        >Configuración</span
                      >
                    </div>
                    <lucide-angular
                      [img]="
                        activeSubmenu === 'config' ? ChevronDown : ChevronRight
                      "
                      class="tw-w-4 tw-h-4 tw-transition-transform tw-duration-200"
                    ></lucide-angular>
                  </button>

                  <!-- Configuración Subitems -->
                  <div
                    class="tw-ml-8 tw-mt-2 tw-space-y-1 tw-overflow-hidden tw-transition-all tw-duration-300"
                    [ngClass]="{
                      'tw-max-h-0': activeSubmenu !== 'config',
                      'tw-max-h-96': activeSubmenu === 'config',
                    }"
                  >
                    @if (
                      authState.hasAnyRole([
                        'admin',
                        'administrador-rnpn',
                        'registrador-sistema',
                        'admin-log-npe',
                      ])
                    ) {
                      <a
                        routerLink="/config/principal"
                        routerLinkActive="tw-text-blue-600"
                        class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                      >
                        Principal
                      </a>
                    }
                    @if (
                      authState.hasAnyRole([
                        'admin',
                        'administrador-rnpn',
                        'registrador-sistema',
                        'admin-log-npe',
                      ])
                    ) {
                      <a
                        routerLink="/config/plantillas"
                        routerLinkActive="tw-text-blue-600"
                        class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                      >
                        Plantillas
                      </a>
                    }
                    @if (
                      authState.hasAnyRole(['admin', 'administrador-catalogos'])
                    ) {
                      <a
                        routerLink="/config/catalogo"
                        routerLinkActive="tw-text-blue-600"
                        class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                      >
                        Catálogo
                      </a>
                    }
                    @if (
                      authState.hasAnyRole([
                        'admin',
                        'administrador-rnpn',
                        'registrador-sistema',
                        'admin-log-npe',
                      ])
                    ) {
                      <a
                        routerLink="/config/mantenimiento-formularios"
                        routerLinkActive="tw-text-blue-600"
                        class="tw-block tw-px-3 tw-py-2 tw-rounded-md tw-text-sm tw-transition-all tw-duration-200 hover:tw-text-[#050e5b] tw-text-gray-600"
                      >
                        Mantenimiento Formularios
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </nav>
    </div>
  `,
  styles: [
    `
      .nav-menu {
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
      }

      .nav-menu::-webkit-scrollbar {
        width: 4px;
      }

      .nav-menu::-webkit-scrollbar-track {
        background: transparent;
      }

      .nav-menu::-webkit-scrollbar-thumb {
        background-color: #e5e7eb;
        border-radius: 2px;
      }

      .nav-menu::-webkit-scrollbar-thumb:hover {
        background-color: #d1d5db;
      }

      .nav-link {
        position: relative;
      }

      .nav-link:hover {
        transform: translateX(2px);
      }

      .nav-link.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 24px;
        background-color: #3b82f6;
        border-radius: 0 2px 2px 0;
      }

      .user-info-container {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .active-registry-item {
        @apply tw-bg-blue-50 tw-text-blue-700 tw-border-l-4 tw-border-blue-500;
        transform: translateX(2px);
      }

      .active-registry-item lucide-angular {
        @apply tw-text-blue-600;
      }
    `,
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public navService: NavigationService = inject(NavigationService);
  public registryNavService: RegistryNavigationService = inject(
    RegistryNavigationService,
  );
  private router = inject(Router);
  public authState = inject(AuthStateService);

  User = User;
  Home = Home;
  Users = Users;
  Settings = Settings;
  BarChart3 = BarChart3;
  HelpCircle = HelpCircle;
  ChevronRight = ChevronRight;
  ChevronDown = ChevronDown;
  activeSubmenu = 'inicio'; // Inicializar con 'inicio' por defecto
  registryMenuItems: RegistryMenuItem[];

  private destroy$ = new Subject<void>();

  toggleSubmenu(submenu: string): void {
    if (this.navService.collapseSidebar) {
      this.navService.collapseSidebar = false;
    }
    this.activeSubmenu = this.activeSubmenu === submenu ? '' : submenu;
  }

  constructor() {
    this.registryMenuItems = this.registryNavService.getRegistryMenuItems();
    // Establecer el submenu activo basado en la ruta actual al inicializar
    const currentRoute = this.router.url.split('/')[1];
    this.setActiveSubmenu(currentRoute);
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event: NavigationEnd) => {
        const currentRoute = event.urlAfterRedirects.split('/')[1];
        this.setActiveSubmenu(currentRoute);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setActiveSubmenu(route: string): void {
    if (route === 'config' || route.startsWith('config')) {
      this.activeSubmenu = 'config';
    } else if (
      route === 'home' ||
      route.startsWith('home') ||
      route === 'inicio' ||
      route.startsWith('inicio') ||
      route === '' ||
      route === '/'
    ) {
      this.activeSubmenu = 'home';
    } else {
      // Para otras rutas que no sean home o config, mantener el estado actual
      // o establecer 'home' como predeterminado
      if (!this.activeSubmenu) {
        this.activeSubmenu = 'home';
      }
    }
  }
}
