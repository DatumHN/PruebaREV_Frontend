import {
  Component,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-clock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tw-flex tw-items-center tw-justify-center tw-text-[2rem] tw-font-museo-sans tw-font-light text-[#050e5b]"
    >
      {{ formattedTime() }}
    </div>
  `,
  styleUrls: ['./clock.component.scss'],
})
export class ClockComponent implements OnDestroy {
  private currentTime = signal(new Date());
  private subscription: Subscription;

  formattedTime = computed(() => {
    const time = this.currentTime();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  });

  constructor() {
    this.currentTime.set(new Date());

    this.subscription = interval(1000).subscribe(() => {
      this.currentTime.set(new Date());
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
