import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './landing-page.component';

@Component({
  selector: 'app-nx-welcome',
  imports: [CommonModule, LandingPageComponent],
  template: ` <app-landing-page></app-landing-page> `,
  styleUrls: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {}
