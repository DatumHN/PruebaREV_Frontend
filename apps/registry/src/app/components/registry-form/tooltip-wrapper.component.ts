import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-tooltip-wrapper',
  standalone: true,
  imports: [CommonModule, FormlyModule],
  template: `
    <div class="tw-mb-4 tw-w-full">
      <!-- Label and Tooltip Row -->
      @if (props.label || props['ayuda'] || props['ejemplo']) {
        <div
          class="tw-flex tw-items-center tw-justify-between tw-mb-2 tw-min-h-[1.5rem]"
        >
          <!-- Label on the left -->
          @if (props.label) {
            <label
              [for]="id"
              class="tw-font-bold tw-text-gray-700 tw-flex-grow tw-mr-3"
            >
              {{ props.label }}
              @if (props.required) {
                <span class="tw-text-red-500 tw-ml-1">*</span>
              }
            </label>
          } @else {
            <!-- Empty space to push tooltip to the right when no label -->
            <div class="tw-flex-grow"></div>
          }

          <!-- Tooltip on the right -->
          @if (props['ayuda'] || props['ejemplo']) {
            <div class="tw-relative tw-group tw-flex-shrink-0">
              <svg
                #tooltipIcon
                class="tw-w-6 tw-h-6 tw-text-blue-500 tw-cursor-pointer hover:tw-text-blue-600 tw-transition-colors tw-drop-shadow-sm"
                fill="currentColor"
                viewBox="0 0 20 20"
                (mouseenter)="onMouseEnter()"
                (mouseleave)="onMouseLeave()"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd"
                />
              </svg>

              <!-- Custom Tailwind Tooltip -->
              <div
                #tooltip
                class="tw-fixed tw-invisible tw-opacity-0 tw-transition-all tw-duration-300 tw-pointer-events-none"
                style="z-index: 99999;"
              >
                <div
                  class="tw-text-white tw-text-sm tw-rounded-lg tw-px-3 tw-py-2 tw-shadow-xl tw-max-w-xs tw-w-max tw-border tw-relative"
                  style="min-width: 200px; background-color: var(--rnpn-primary-500); border-color: var(--rnpn-primary-600, var(--rnpn-primary-500));"
                >
                  <!-- Tooltip Arrow -->
                  <div
                    class="tw-absolute tw-top-full tw-left-1/2 tw-transform -tw-translate-x-1/2"
                  >
                    <div
                      class="tw-w-0 tw-h-0 tw-border-l-4 tw-border-r-4 tw-border-t-4 tw-border-l-transparent tw-border-r-transparent"
                      style="border-top-color: var(--rnpn-primary-500);"
                    ></div>
                  </div>

                  <!-- Tooltip Content -->
                  <div [innerHTML]="tooltipContent"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Control Row -->
      <div class="tw-w-full">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
})
export class TooltipWrapperComponent extends FieldWrapper {
  @ViewChild('tooltip') tooltip!: ElementRef<HTMLDivElement>;
  @ViewChild('tooltipIcon') tooltipIcon!: ElementRef<SVGElement>;

  onMouseEnter() {
    if (this.tooltip && this.tooltipIcon) {
      this.positionTooltip();
      this.tooltip.nativeElement.classList.remove(
        'tw-invisible',
        'tw-opacity-0',
      );
      this.tooltip.nativeElement.classList.add('tw-visible', 'tw-opacity-100');
    }
  }

  onMouseLeave() {
    if (this.tooltip) {
      this.tooltip.nativeElement.classList.remove(
        'tw-visible',
        'tw-opacity-100',
      );
      this.tooltip.nativeElement.classList.add('tw-invisible', 'tw-opacity-0');
    }
  }

  private positionTooltip() {
    if (!this.tooltip || !this.tooltipIcon) return;

    const iconElement = this.tooltipIcon.nativeElement;
    const tooltipElement = this.tooltip.nativeElement;
    const iconRect = iconElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    // Position tooltip above the icon by default
    let top = iconRect.top - tooltipRect.height - 12; // 12px gap
    let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;

    // Adjust if tooltip would go off the right edge
    if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    // Adjust if tooltip would go off the left edge
    if (left < 10) {
      left = 10;
    }

    // If tooltip would go off the top, position it below the icon instead
    if (top < 10) {
      top = iconRect.bottom + 12;
    }

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  }

  get tooltipContent(): string {
    const ejemplo = this.props?.['ejemplo'];
    const ayuda = this.props?.['ayuda'];

    let content = '';

    // Si hay ejemplo, mostrarlo como título
    if (ejemplo && ejemplo.trim() !== '') {
      content += `<div class="tw-text-center tw-font-bold tw-text-sm tw-text-blue-300 ${ayuda && ayuda.trim() !== '' ? 'tw-mb-2' : ''}">${ejemplo}</div>`;
    }

    // Si hay ayuda, mostrarla como cuerpo
    if (ayuda && ayuda.trim() !== '') {
      content += `<div class="tw-text-left tw-text-xs tw-leading-relaxed tw-text-gray-200">${ayuda}</div>`;
    }

    return (
      content ||
      '<div class="tw-text-xs tw-text-gray-300">Sin información de ayuda disponible</div>'
    );
  }
}
