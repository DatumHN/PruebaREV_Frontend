import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FeatureCardData {
  title: string;
  description: string;
  image: string;
  layout?: 'left' | 'right';
  backgroundColor?: string;
}

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-card.component.html',
  styleUrls: ['./feature-card.component.scss'],
})
export class FeatureCardComponent {
  @Input() data!: FeatureCardData;

  get layoutClass(): string {
    return this.data.layout === 'right' ? 'lg:order-2' : 'lg:order-1';
  }

  get textLayoutClass(): string {
    const baseClass =
      this.data.layout === 'right' ? 'layout-right' : 'layout-left';
    return baseClass;
  }

  get backgroundClass(): string {
    if (this.data.backgroundColor === 'primary') return 'bg-primary';
    if (this.data.backgroundColor === 'secondary') return 'bg-secondary';
    return '';
  }
}
