import { Injectable, signal, computed, OnDestroy } from '@angular/core';

export interface TimerConfig {
  initialSeconds: number;
  interval?: number; // milliseconds, default 1000
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (remainingSeconds: number) => void;
}

@Injectable({
  providedIn: 'root',
})
export class TimerService implements OnDestroy {
  private timers = new Map<string, TimerInstance>();

  /**
   * Creates a new timer instance
   * @param id Unique identifier for the timer
   * @param config Timer configuration
   * @returns Timer control object
   */
  createTimer(id: string, config: TimerConfig): TimerControl {
    // Clean up existing timer with same id
    this.destroyTimer(id);

    const timer = new TimerInstance(config);
    this.timers.set(id, timer);

    return {
      timeRemaining: timer.timeRemaining,
      isRunning: timer.isRunning,
      isCompleted: timer.isCompleted,
      progress: timer.progress,
      start: () => timer.start(),
      pause: () => timer.pause(),
      reset: (newSeconds?: number) => timer.reset(newSeconds),
      stop: () => timer.stop(),
      destroy: () => this.destroyTimer(id),
      updateTime: (seconds: number) => timer.updateTime(seconds),
    };
  }

  /**
   * Destroys a timer instance
   */
  destroyTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      timer.destroy();
      this.timers.delete(id);
    }
  }

  /**
   * Gets an existing timer
   */
  getTimer(id: string): TimerControl | null {
    const timer = this.timers.get(id);
    return timer ? this.createTimerControl(timer) : null;
  }

  private createTimerControl(timer: TimerInstance): TimerControl {
    return {
      timeRemaining: timer.timeRemaining,
      isRunning: timer.isRunning,
      isCompleted: timer.isCompleted,
      progress: timer.progress,
      start: () => timer.start(),
      pause: () => timer.pause(),
      reset: (newSeconds?: number) => timer.reset(newSeconds),
      stop: () => timer.stop(),
      destroy: () => timer.destroy(),
      updateTime: (seconds: number) => timer.updateTime(seconds),
    };
  }

  ngOnDestroy(): void {
    // Clean up all timers
    for (const [id] of this.timers) {
      this.destroyTimer(id);
    }
  }
}

export interface TimerControl {
  readonly timeRemaining: () => number;
  readonly isRunning: () => boolean;
  readonly isCompleted: () => boolean;
  readonly progress: () => number; // 0-100 percentage
  start(): void;
  pause(): void;
  reset(newSeconds?: number): void;
  stop(): void;
  destroy(): void;
  updateTime(seconds: number): void;
}

class TimerInstance {
  private _timeRemaining = signal(0);
  private _isRunning = signal(false);
  private _isCompleted = signal(false);
  private _initialSeconds = signal(0);

  private intervalId: number | undefined;
  private config: TimerConfig;

  // Public signals
  readonly timeRemaining = this._timeRemaining.asReadonly();
  readonly isRunning = this._isRunning.asReadonly();
  readonly isCompleted = this._isCompleted.asReadonly();

  // Computed progress (0-100)
  readonly progress = computed(() => {
    const initial = this._initialSeconds();
    const remaining = this._timeRemaining();
    if (initial <= 0) return 0;
    return Math.max(0, ((initial - remaining) / initial) * 100);
  });

  constructor(config: TimerConfig) {
    this.config = config;
    this._timeRemaining.set(config.initialSeconds);
    this._initialSeconds.set(config.initialSeconds);

    if (config.autoStart) {
      this.start();
    }
  }

  start(): void {
    if (this._isRunning()) return;

    this._isRunning.set(true);
    this._isCompleted.set(false);

    const interval = this.config.interval || 1000;

    this.intervalId = window.setInterval(() => {
      const current = this._timeRemaining();

      if (current <= 0) {
        this.complete();
        return;
      }

      const newTime = current - 1;
      this._timeRemaining.set(newTime);

      // Call onTick callback if provided
      if (this.config.onTick) {
        this.config.onTick(newTime);
      }

      if (newTime <= 0) {
        this.complete();
      }
    }, interval);
  }

  pause(): void {
    this._isRunning.set(false);
    this.clearInterval();
  }

  reset(newSeconds?: number): void {
    this.clearInterval();
    this._isRunning.set(false);
    this._isCompleted.set(false);

    const seconds = newSeconds ?? this._initialSeconds();
    this._timeRemaining.set(seconds);
    this._initialSeconds.set(seconds);
  }

  stop(): void {
    this.clearInterval();
    this._isRunning.set(false);
    this._isCompleted.set(false);
    this._timeRemaining.set(this._initialSeconds());
  }

  updateTime(seconds: number): void {
    this._timeRemaining.set(seconds);
    // Update initial seconds to maintain correct progress calculation
    if (!this._isRunning()) {
      this._initialSeconds.set(seconds);
    }
  }

  private complete(): void {
    this.clearInterval();
    this._isRunning.set(false);
    this._isCompleted.set(true);
    this._timeRemaining.set(0);

    // Call onComplete callback if provided
    if (this.config.onComplete) {
      this.config.onComplete();
    }
  }

  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  destroy(): void {
    this.clearInterval();
    this._isRunning.set(false);
  }
}
