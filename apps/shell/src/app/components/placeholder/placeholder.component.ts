import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold">Módulo de Configuración</h1>
      <p class="mt-4">Esta es una página provisional para la ruta:</p>
      <pre
        class="bg-gray-100 p-4 rounded mt-2 text-lg"
      ><code>/config/{{ route.snapshot.url.join('/') }}</code></pre>
      <p class="mt-4">
        El contenido real de esta sección se implementará en el futuro.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {
  public route = inject(ActivatedRoute);
}
