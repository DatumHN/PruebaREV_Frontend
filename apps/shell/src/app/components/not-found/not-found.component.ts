import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `<h1>404</h1>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
