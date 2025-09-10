import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ContactCardData {
  icon: string;
  title: string;
  content: string;
  link?: string;
  type?: 'address' | 'email' | 'phone' | 'whatsapp';
}

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-card.component.html',
  styleUrls: ['./contact-card.component.scss'],
})
export class ContactCardComponent {
  @Input() data!: ContactCardData;

  get isLink(): boolean {
    return !!(
      this.data.link ||
      this.data.type === 'email' ||
      this.data.type === 'phone' ||
      this.data.type === 'whatsapp'
    );
  }

  get linkHref(): string {
    if (this.data.link) return this.data.link;
    if (this.data.type === 'email') return `mailto:${this.data.content}`;
    if (this.data.type === 'phone') return `tel:${this.data.content}`;
    if (this.data.type === 'whatsapp') {
      return `https://wa.me/${this.data.content.replace(/\D/g, '')}`;
    }
    return '#';
  }

  get linkTarget(): string {
    return this.data.type === 'address' ? '_blank' : '_self';
  }
}
