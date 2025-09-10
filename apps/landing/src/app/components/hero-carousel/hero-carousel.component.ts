import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

export interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
  alt: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() autoPlayInterval = 6000;
  @Input() showNavigation = true;
  @Input() showIndicators = true;

  currentSlideIndex = 0;
  private autoPlaySubscription: Subscription | undefined;
  private isAutoPlayPaused = false;

  ngOnInit(): void {
    if (this.slides.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
    }

    this.autoPlaySubscription = interval(this.autoPlayInterval).subscribe(
      () => {
        if (!this.isAutoPlayPaused) {
          this.nextSlide();
        }
      },
    );
  }

  stopAutoPlay(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
      this.autoPlaySubscription = undefined;
    }
  }

  pauseAutoPlay(): void {
    this.isAutoPlayPaused = true;
  }

  resumeAutoPlay(): void {
    this.isAutoPlayPaused = false;
  }

  nextSlide(): void {
    if (this.slides.length === 0) return;

    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  previousSlide(): void {
    if (this.slides.length === 0) return;

    this.currentSlideIndex =
      this.currentSlideIndex === 0
        ? this.slides.length - 1
        : this.currentSlideIndex - 1;
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  getCurrentSlide(): CarouselSlide | null {
    return this.slides.length > 0 ? this.slides[this.currentSlideIndex] : null;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousSlide();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextSlide();
    }
  }

  onMouseEnter(): void {
    this.pauseAutoPlay();
  }

  onMouseLeave(): void {
    this.resumeAutoPlay();
  }
}
