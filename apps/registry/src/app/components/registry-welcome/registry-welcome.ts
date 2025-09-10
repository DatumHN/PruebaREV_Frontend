import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LucideAngularModule } from 'lucide-angular';
import { RegistryCardComponent } from '../registry-card/registry-card.component';
import {
  RegistryNavigationService,
  RegistryMenuItem,
} from '../../services/registry-navigation.service';

@Component({
  selector: 'app-registry-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    LucideAngularModule,
    NgOptimizedImage,
    RegistryCardComponent,
  ],
  templateUrl: './registry-welcome.html',
  styleUrls: ['./registry-welcome.css'],
})
export class RegistryWelcome {
  private registryService = inject(RegistryNavigationService);

  registryMenuItems = signal<RegistryMenuItem[]>(
    this.registryService.getRegistryMenuItems(),
  );
}
