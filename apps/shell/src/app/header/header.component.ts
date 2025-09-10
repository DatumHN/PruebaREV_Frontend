import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  AlignCenter,
  Maximize2,
  Search,
  MoreHorizontal,
  LogOut,
  Maximize,
} from 'lucide-angular';
import { NavigationService } from '../services/navigation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="page-main-header bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3 mb-4">
        <!-- Sidebar-aligned section: logo at start, toggle at end of sidebar width -->
        <div
          class="relative flex items-center"
          style="width:16rem; min-width:16rem;"
        >
          <div
            class="logo-wrapper flex items-center absolute left-0 top-1/2 -translate-y-1/2"
          >
            <a href="/inicio/Principal" class="flex items-center">
              <img
                class="h-8 w-auto"
                src="assets/logoNavbarNew.png"
                alt="REVFA Logo"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
              />
              <div
                class="hidden items-center justify-center bg-blue-600 text-white px-3 py-2 rounded font-bold text-lg"
              >
                REVFA
              </div>
            </a>
          </div>
          <button
            (click)="sidebarToggle()"
            class="toggle-sidebar  absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title="Toggle Sidebar"
          >
            <lucide-angular
              [img]="AlignCenter"
              class="w-5 h-5 text-gray-600"
            ></lucide-angular>
          </button>
        </div>

        <!-- Header Content -->
        <div class="flex-1 flex items-center justify-between">
          <!-- Center Search -->
          <div
            class="left-menu-header w-full max-w-md mx-auto flex-1 flex items-center justify-center"
          >
            <div class="relative w-full">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <lucide-angular
                  [img]="Search"
                  class="w-5 h-5 text-gray-400"
                ></lucide-angular>
              </div>
              <input
                type="text"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar..."
              />
            </div>
          </div>

          <!-- Right Section -->
          <div class="flex items-center space-x-4">
            <button
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="More"
            >
              <lucide-angular
                [img]="Maximize"
                class="w-5 h-5 text-gray-600"
              ></lucide-angular>
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#050e5b] hover:bg-[#1a237e] text-white transition-colors duration-200"
              title="Logout"
            >
              <lucide-angular
                [img]="LogOut"
                class="w-5 h-5 text-white"
              ></lucide-angular>
              <span class="font-semibold text-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-main-header {
        position: sticky !important;
        top: 0 !important;
        z-index: 1000 !important;
        backdrop-filter: blur(10px);
        background-color: rgba(255, 255, 255, 0.95) !important;
        display: flex !important;
        width: 100% !important;
        height: auto !important;
        border-bottom: 1px solid #e5e7eb !important;
      }

      .main-header-right {
        transition: all 0.3s ease;
      }

      /* Protect header layout from external styles */
      .page-main-header .flex {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }

      .page-main-header input {
        display: block !important;
        width: 100% !important;
      }

      .page-main-header button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .logo-wrapper img {
        max-height: 32px;
        width: auto;
      }

      input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      @media (max-width: 640px) {
        .left-menu-header {
          display: none;
        }

        .main-header-right {
          padding: 12px 16px;
        }
      }

      @media (max-width: 1024px) {
        .left-menu-header {
          max-width: 200px;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  private navService: NavigationService = inject(NavigationService);

  AlignCenter = AlignCenter;
  Maximize2 = Maximize2;
  Search = Search;
  MoreHorizontal = MoreHorizontal;
  LogOut = LogOut;

  open = false;

  sidebarToggle(): void {
    this.navService.toggleSidebar();
  }

  protected readonly Maximize = Maximize;
}
