import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Home,
  Users,
  Settings,
  BarChart3,
  FileText,
  ChevronRight,
  ChevronDown,
  User,
  HelpCircle,
  BookOpen,
  Database,
  ClipboardList,
  FolderOpen,
  FileCheck,
  Clipboard,
} from 'lucide-angular';
import { UserInfoComponent } from '../user-info/user-info.component';
import { NavigationService } from '../services/navigation.service';
import {
  RegistryMenuItem,
  RegistryNavigationService,
} from '../services/registry-navigation.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

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
      class="h-full bg-white shadow-lg border-r border-gray-200 flex flex-col overflow-hidden pt-4"
    >
      <!-- User Info Section -->
      <div
        class=" text-white transition-all duration-300"
        [ngClass]="{ 'px-2 py-2': navService.sidebarCollapsed$ | async }"
      >
        <div
          *ngIf="
            !(navService.sidebarCollapsed$ | async);
            else collapsedUserInfo
          "
        >
          <app-user-info></app-user-info>
        </div>
        <ng-template #collapsedUserInfo>
          <div class="flex items-center justify-center py-3">
            <div
              class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <lucide-angular [img]="User" class="w-5 h-5"></lucide-angular>
            </div>
          </div>
        </ng-template>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto">
        <div
          [ngClass]="{
            'px-1': navService.sidebarCollapsed$ | async,
            'px-3': !(navService.sidebarCollapsed$ | async),
          }"
          class="py-4"
        >
          <!-- Collapsed View -->
          <div *ngIf="navService.sidebarCollapsed$ | async" class="space-y-2">
            <button
              (click)="toggleSubmenu('inicio')"
              class="nav-link w-full flex items-center justify-center p-3 rounded-lg text-left transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] text-gray-700"
              title="Inicio"
            >
              <lucide-angular [img]="Home" class="w-5 h-5"></lucide-angular>
            </button>

            <button
              (click)="toggleSubmenu('config')"
              class="nav-link w-full flex items-center justify-center p-3 rounded-lg text-left transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] text-gray-700"
              title="Configuración"
            >
              <lucide-angular [img]="Settings" class="w-5 h-5"></lucide-angular>
            </button>

            <a
              routerLink="/reportes"
              routerLinkActive="bg-[#050e5b] text-[#99a3f9] shadow-sm"
              class="nav-link w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] text-gray-700"
              title="Reportes"
            >
              <lucide-angular
                [img]="BarChart3"
                class="w-5 h-5"
              ></lucide-angular>
            </a>

            <a
              routerLink="/usuarios"
              routerLinkActive="bg-[#050e5b] text-[#99a3f9] shadow-sm"
              class="nav-link w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] text-gray-700"
              title="Usuarios"
            >
              <lucide-angular [img]="Users" class="w-5 h-5"></lucide-angular>
            </a>

            <a
              routerLink="/ayuda"
              routerLinkActive="bg-[#050e5b] text-[#99a3f9] shadow-sm"
              class="nav-link w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] text-gray-700"
              title="Ayuda"
            >
              <lucide-angular
                [img]="HelpCircle"
                class="w-5 h-5"
              ></lucide-angular>
            </a>
          </div>

          <!-- Expanded View -->
          <div *ngIf="!(navService.sidebarCollapsed$ | async)">
            <!-- Mobile Back Button -->
            <div
              class="mobile-back md:hidden mb-4 flex items-center justify-end text-gray-600"
            >
              <span class="mr-2 text-sm">Atrás</span>
              <lucide-angular
                [img]="ChevronRight"
                class="w-4 h-4"
              ></lucide-angular>
            </div>

            <!-- Pages Section -->
            <div class="mb-6">
              <h6
                class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                Páginas
              </h6>

              <!-- Inicio Menu -->
              <div class="mb-2">
                <button
                  (click)="toggleSubmenu('inicio')"
                  class="nav-link w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] group"
                  [ngClass]="{
                    'bg-[#050e5b] text-[#99a3f9] shadow-sm':
                      activeSubmenu === 'inicio',
                  }"
                >
                  <div class="flex items-center space-x-3">
                    <lucide-angular
                      [img]="Home"
                      class="w-5 h-5"
                    ></lucide-angular>
                    <span class="font-medium text-sm">Inicio</span>
                  </div>
                  <lucide-angular
                    [img]="
                      activeSubmenu === 'inicio' ? ChevronDown : ChevronRight
                    "
                    class="w-4 h-4 transition-transform duration-200"
                  ></lucide-angular>
                </button>

                <!-- Inicio Subitems -->
                <div
                  class="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
                  [ngClass]="{
                    'max-h-0': activeSubmenu !== 'inicio',
                    'max-h-96': activeSubmenu === 'inicio',
                  }"
                >
                  <a
                    routerLink="/inicio/Principal"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Principal
                  </a>
                  <a
                    routerLink="/inicio/approve-table"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Partidas Nacimiento
                  </a>
                  <a
                    routerLink="/inicio/registros"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Registros
                  </a>
                </div>
              </div>
            </div>

            <!-- Sistema Section -->
            <div>
              <h6
                class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                Sistema
              </h6>

              <!-- Configuración Menu -->
              <div class="mb-2">
                <button
                  (click)="toggleSubmenu('config')"
                  class="nav-link w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-[#050e5b] hover:text-[#99a3f9] group text-gray-700"
                  [ngClass]="{
                    'bg-[#050e5b] text-[#99a3f9] shadow-sm':
                      activeSubmenu === 'config',
                  }"
                >
                  <div class="flex items-center space-x-3">
                    <lucide-angular
                      [img]="Settings"
                      class="w-5 h-5"
                    ></lucide-angular>
                    <span class="font-medium text-sm">Configuración</span>
                  </div>
                  <lucide-angular
                    [img]="
                      activeSubmenu === 'config' ? ChevronDown : ChevronRight
                    "
                    class="w-4 h-4 transition-transform duration-200"
                  ></lucide-angular>
                </button>

                <!-- Configuración Subitems -->
                <div
                  class="ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300"
                  [ngClass]="{
                    'max-h-0': activeSubmenu !== 'config',
                    'max-h-96': activeSubmenu === 'config',
                  }"
                >
                  <a
                    routerLink="/config/principal"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Principal
                  </a>
                  <a
                    routerLink="/config/plantillas"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Plantillas
                  </a>
                  <a
                    routerLink="/config/catalogo"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Catálogo
                  </a>
                  <a
                    routerLink="/config/mantenimiento-formularios"
                    routerLinkActive="text-blue-600 bg-blue-50"
                    class="block px-3 py-2 rounded-md text-sm transition-all duration-200 hover:text-[#050e5b] text-gray-600"
                  >
                    Mantenimiento Formularios
                  </a>
                </div>
              </div>
            </div>
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
        @apply bg-blue-50 text-blue-700 border-l-4 border-blue-500;
        transform: translateX(2px);
      }

      .active-registry-item lucide-angular {
        @apply text-blue-600;
      }
    `,
  ],
})
export class SidebarComponent {
  public navService: NavigationService = inject(NavigationService);
  public registryNavService: RegistryNavigationService = inject(
    RegistryNavigationService,
  );

  User = User;
  Home = Home;
  Users = Users;
  Settings = Settings;
  BarChart3 = BarChart3;
  FileText = FileText;
  HelpCircle = HelpCircle;
  ChevronRight = ChevronRight;
  ChevronDown = ChevronDown;
  Database = Database;
  BookOpen = BookOpen;
  ClipboardList = ClipboardList;
  FolderOpen = FolderOpen;
  FileCheck = FileCheck;
  Clipboard = Clipboard;
  activeSubmenu: string | null = null;
  registryMenuItems: RegistryMenuItem[];

  toggleSubmenu(submenu: string): void {
    if (this.navService.collapseSidebar) {
      this.navService.collapseSidebar = false;
    }
    this.activeSubmenu = this.activeSubmenu === submenu ? null : submenu;
  }

  constructor() {
    this.registryMenuItems = this.registryNavService.getRegistryMenuItems();
  }
}
