import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer
      class="w-full bg-gray-100 text-gray-600 py-3 px-6 text-center border-t mt-auto"
    >
      <span class="text-xs">REVFA &copy; 2025 - Footer</span>
    </footer>
  `,
})
export class FooterComponent {}
