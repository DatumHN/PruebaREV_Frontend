import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-clock',
  standalone: true,
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss'],
  imports: [NgFor],
})
export class ClockComponent implements OnInit, OnDestroy {
  time: Date = new Date();
  hours: number[] = [];
  minutes: number[] = [];
  seconds: number[] = [];
  period = '';
  private subscription: Subscription | undefined;

  ngOnInit(): void {
    this.subscription = interval(1000).subscribe(() => {
      this.time = new Date();
      const hora = this.time.getHours();
      this.period = hora >= 12 ? 'PM' : 'AM';
      this.hours = this.getDigits(hora % 12 || 12);
      this.minutes = this.getDigits(this.time.getMinutes());
      this.seconds = this.getDigits(this.time.getSeconds());
    });
  }

  ngOnDestroy(): void {
    // @ts-ignore
    this.subscription.unsubscribe();
  }

  private getDigits(num: number): number[] {
    return num
      .toString()
      .padStart(2, '0')
      .split('')
      .map((digit) => parseInt(digit));
  }
}
