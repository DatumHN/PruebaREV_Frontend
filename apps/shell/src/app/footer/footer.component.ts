import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer
      class="tw-w-full tw-bg-gray-100 tw-text-gray-600 tw-py-3 tw-px-6 tw-text-center tw-border-t tw-mt-auto"
    >
      <span class="tw-text-xs">REVFA &copy; 2025 - Footer</span>
    </footer>
  `,
})
export class FooterComponent {}
