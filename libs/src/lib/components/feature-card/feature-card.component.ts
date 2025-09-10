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
  selector: 'lib-feature-card',
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
    return this.data.layout === 'right' ? 'lg:order-1' : 'lg:order-2';
  }

  get backgroundClass(): string {
    return this.data.backgroundColor ? `bg-[${this.data.backgroundColor}]` : '';
  }
}
