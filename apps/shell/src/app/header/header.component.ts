import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  AlignCenter,
  Maximize2,
  Search,
  MoreHorizontal,
  LogOut,
  Maximize,
  User,
  ChevronDown,
} from 'lucide-angular';
import { NavigationService } from '../services/navigation.service';
import { AuthStateService } from '@revfa/auth-shared';
import { LogoutConfirmationDialogComponent } from '../components/logout-confirmation-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    LogoutConfirmationDialogComponent,
  ],
  template: `
    <div
      class="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-[1000] tw-w-full tw-bg-white/95 tw-backdrop-blur-[10px] tw-shadow-sm tw-border-b tw-border-gray-200"
    >
      <div
        class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-h-[82px] tw-w-full"
      >
        <!-- Left Section: Logo and Sidebar Toggle -->
        <div class="tw-flex tw-items-center tw-w-64 tw-min-w-[16rem]">
          <div class="tw-flex tw-items-center">
            <a href="/inicio" class="tw-flex tw-items-center">
              <img
                class="tw-h-[29px] tw-ml-3 tw-w-auto tw-max-h-8"
                src="assets/logoNavbarNew.png"
                alt="REVFA Logo"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
              />
              <div
                class="tw-hidden tw-items-center tw-justify-center tw-bg-blue-600 tw-text-white tw-px-3 tw-py-2 tw-rounded tw-font-bold tw-text-lg"
              >
                REVFA
              </div>
            </a>
          </div>
          <button
            (click)="sidebarToggle()"
            (keydown.enter)="sidebarToggle()"
            (keydown.space)="$event.preventDefault(); sidebarToggle()"
            class="tw-mr-4 tw-ml-auto tw-p-2 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 sm:tw-block focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            title="Toggle Sidebar"
            tabindex="0"
          >
            <lucide-angular
              [img]="AlignCenter"
              class="tw-w-5 tw-h-5 tw-text-rnpn-primary-500"
            ></lucide-angular>
          </button>
        </div>

        <!-- Center Section: Search Bar -->
        <div
          class="tw-flex-1 tw-flex tw-items-center tw-justify-center tw-px-8 tw-hidden md:tw-flex"
        >
          <div class="tw-relative tw-w-full tw-max-w-md lg:tw-max-w-lg">
            <div
              class="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-3 tw-flex tw-items-center tw-pointer-events-none"
            >
              <lucide-angular
                [img]="Search"
                class="tw-w-5 tw-h-5 tw-text-gray-400"
              ></lucide-angular>
            </div>
            <input
              type="text"
              class="tw-block tw-w-full tw-pl-10 tw-pr-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent focus:tw-shadow-lg focus:tw-shadow-blue-500/10 tw-transition-all tw-duration-200"
              placeholder="Buscar..."
            />
          </div>
        </div>

        <!-- Right Section: User Profile and Actions -->
        <div
          class="tw-flex tw-items-center tw-space-x-3 tw-w-64 tw-min-w-[16rem] tw-justify-end"
        >
          <!-- Maximize Button -->
          <button
            class="tw-p-2 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-colors tw-duration-200 tw-hidden sm:tw-flex focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            title="Maximize"
            tabindex="0"
          >
            <lucide-angular
              [img]="Maximize"
              class="tw-w-5 tw-h-5 tw-text-gray-600"
            ></lucide-angular>
          </button>

          <!-- Loading State -->
          <div
            *ngIf="isLoading() && !isLoggedIn()"
            class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2"
          >
            <div
              class="tw-w-8 tw-h-8 tw-bg-gray-200 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-animate-pulse"
            >
              <lucide-angular
                [img]="User"
                class="tw-w-4 tw-h-4 tw-text-gray-400"
              ></lucide-angular>
            </div>
            <div class="tw-hidden md:tw-block">
              <div
                class="tw-w-20 tw-h-4 tw-bg-gray-200 tw-rounded tw-animate-pulse"
              ></div>
              <div
                class="tw-w-16 tw-h-3 tw-bg-gray-100 tw-rounded tw-mt-1 tw-animate-pulse"
              ></div>
            </div>
          </div>

          <!-- User Dropdown -->
          <div
            id="user-dropdown-container"
            class="tw-relative"
            *ngIf="isLoggedIn() && user()?.username"
          >
            <button
              (click)="toggleUserDropdown($event)"
              (keydown.enter)="toggleUserDropdown()"
              (keydown.space)="toggleUserDropdown()"
              class="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-rounded-lg tw-border tw-border-transparent hover:tw-bg-gray-100 hover:tw-shadow-sm hover:tw-border-gray-200 tw-transition-all tw-duration-200 tw-cursor-pointer"
              [class.tw-bg-gray-100]="userDropdownOpen"
              [class.tw-border-blue-300]="userDropdownOpen"
              [class.tw-ring-2]="userDropdownOpen"
              [class.tw-ring-blue-500]="userDropdownOpen"
              [class.tw-ring-opacity-20]="userDropdownOpen"
              title="Click to open user menu"
              id="user-menu-button"
              aria-haspopup="true"
              [attr.aria-expanded]="userDropdownOpen"
            >
              <div class="tw-flex tw-items-center tw-gap-2">
                <div
                  class="tw-w-8 tw-h-8 tw-bg-[#050e5b] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-200"
                  [class.tw-bg-blue-600]="userDropdownOpen"
                  [class.tw-shadow-md]="userDropdownOpen"
                >
                  <lucide-angular
                    [img]="User"
                    class="tw-w-4 tw-h-4 tw-text-white"
                  ></lucide-angular>
                </div>
                <div class="tw-hidden md:tw-block tw-text-left">
                  <div class="tw-text-sm tw-font-semibold tw-text-gray-900">
                    {{ user()?.username || 'Usuario' }}
                  </div>
                  <div
                    class="tw-text-xs tw-text-gray-500"
                    *ngIf="user()?.roles && user()!.roles.length > 0"
                  >
                    {{ user()!.roles[0] }}
                  </div>
                </div>
                <lucide-angular
                  [img]="ChevronDown"
                  class="tw-w-4 tw-h-4 tw-text-gray-600 tw-transition-transform tw-duration-300 tw-ease-in-out"
                  [class.tw-rotate-180]="userDropdownOpen"
                  [class.tw-text-blue-600]="userDropdownOpen"
                ></lucide-angular>
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div
              *ngIf="userDropdownOpen"
              class="tw-absolute tw-right-0 tw-mt-3 tw-w-64 sm:tw-w-72 tw-bg-white tw-rounded-lg tw-shadow-xl tw-border tw-border-gray-200 tw-py-2 tw-z-[9999] tw-transform tw-transition-all tw-duration-200 tw-opacity-100 tw-scale-100 tw-max-w-[calc(100vw-2rem)] tw-mr-0 sm:tw-mr-0"
              (click)="$event.stopPropagation()"
              (keydown.escape)="closeUserDropdown()"
              role="menu"
              aria-labelledby="user-menu-button"
              id="user-dropdown-menu"
              tabindex="-1"
            >
              <!-- User Info -->
              <div class="tw-px-4 tw-py-3 tw-border-b tw-border-gray-100">
                <div class="tw-text-sm tw-font-semibold tw-text-gray-900">
                  {{ user()?.username }}
                </div>
                <div
                  class="tw-flex tw-gap-1 tw-mt-2"
                  *ngIf="user()?.roles && user()!.roles.length > 0"
                >
                  <span
                    *ngFor="let role of user()!.roles"
                    class="tw-px-2 tw-py-1 tw-text-xs tw-bg-blue-100 tw-text-blue-800 tw-rounded-full"
                  >
                    {{ role }}
                  </span>
                </div>
              </div>

              <!-- Logout Error Display -->
              <div
                *ngIf="logoutError()"
                class="tw-mx-4 tw-my-2 tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg"
              >
                <div class="tw-flex tw-items-center tw-justify-between">
                  <div class="tw-text-sm tw-text-red-600">
                    {{ logoutError() }}
                  </div>
                  <button
                    (click)="clearLogoutError()"
                    (keydown.enter)="clearLogoutError()"
                    (keydown.enter)="clearLogoutError()"
                    class="tw-text-red-400 hover:tw-text-red-600 tw-ml-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-red-500"
                    title="Dismiss"
                    tabindex="0"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Logout Actions -->
              <div class="tw-px-2">
                <button
                  (click)="openLogoutConfirmation()"
                  (keydown.enter)="openLogoutConfirmation()"
                  (keydown.enter)="openLogoutConfirmation()"
                  class="tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-text-sm tw-text-red-600 hover:tw-bg-red-50 tw-rounded-lg tw-transition-colors tw-duration-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-red-500"
                  tabindex="0"
                >
                  <lucide-angular
                    [img]="LogOut"
                    class="tw-w-4 tw-h-4"
                  ></lucide-angular>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Fallback Logout (when authenticated but missing user data, or not loading) -->
          <button
            *ngIf="!isLoggedIn() && !isLoading() && isAuthenticated()"
            (click)="openLogoutConfirmation()"
            (keydown.enter)="openLogoutConfirmation()"
            (keydown.space)="$event.preventDefault(); openLogoutConfirmation()"
            class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-lg tw-bg-[#050e5b] hover:tw-bg-[#1a237e] tw-text-white tw-transition-all tw-duration-200 hover:tw-shadow-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
            title="Logout"
            tabindex="0"
          >
            <lucide-angular
              [img]="LogOut"
              class="tw-w-5 tw-h-5 tw-text-white"
            ></lucide-angular>
            <span class="tw-font-semibold tw-text-sm tw-hidden sm:tw-inline">
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Dialog -->
    <app-logout-confirmation-dialog
      [isOpen]="showLogoutConfirmation"
      [isLoggingOut]="isLoggingOut()"
      [logoutError]="logoutError()"
      (confirm)="logout()"
      (quickLogout)="quickLogout()"
      (cancelled)="closeLogoutConfirmation()"
    ></app-logout-confirmation-dialog>
  `,
  styles: [],
})
export class HeaderComponent {
  private navService: NavigationService = inject(NavigationService);
  private authState = inject(AuthStateService);

  AlignCenter = AlignCenter;
  Maximize2 = Maximize2;
  Search = Search;
  MoreHorizontal = MoreHorizontal;
  LogOut = LogOut;
  Maximize = Maximize;
  User = User;
  ChevronDown = ChevronDown;

  open = false;
  userDropdownOpen = false;
  showLogoutConfirmation = false;

  // Authentication signals
  isAuthenticated = this.authState.isAuthenticated;
  isLoggingOut = this.authState.isLoggingOut;
  isLoading = this.authState.isLoading;
  user = this.authState.user;
  logoutError = this.authState.logoutError;
  isLoggedIn = this.authState.isLoggedIn;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.querySelector('[role="menu"]');

    if (userMenuButton && userDropdown) {
      const isClickInsideDropdown =
        userMenuButton.contains(event.target as Node) ||
        userDropdown.contains(event.target as Node);

      if (!isClickInsideDropdown) {
        this.closeUserDropdown();
      }
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeUserDropdown();
  }

  sidebarToggle(): void {
    this.navService.toggleSidebar();
  }

  toggleUserDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    console.log(
      'Header: Toggling user dropdown from',
      this.userDropdownOpen,
      'to',
      !this.userDropdownOpen,
    );
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown(): void {
    this.userDropdownOpen = false;
  }

  openLogoutConfirmation(): void {
    this.showLogoutConfirmation = true;
    this.closeUserDropdown();
  }

  closeLogoutConfirmation(): void {
    this.showLogoutConfirmation = false;
  }

  async logout(): Promise<void> {
    try {
      await this.authState.logout();
      this.closeLogoutConfirmation();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  quickLogout(): void {
    this.authState.quickLogout();
    this.closeLogoutConfirmation();
  }

  clearLogoutError(): void {
    this.authState.clearLogoutError();
  }
}
