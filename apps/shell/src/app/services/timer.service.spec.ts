import { TestBed } from '@angular/core/testing';
import { TimerService, TimerConfig, TimerControl } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    // Clean up any remaining timers
    service.ngOnDestroy();
  });

  describe('createTimer', () => {
    it('should create a timer with initial configuration', () => {
      const config: TimerConfig = {
        initialSeconds: 60,
        autoStart: false,
      };

      const timer = service.createTimer('test-timer', config);

      expect(timer).toBeDefined();
      expect(timer.timeRemaining()).toBe(60);
      expect(timer.isRunning()).toBe(false);
      expect(timer.isCompleted()).toBe(false);
      expect(timer.progress()).toBe(0);
    });

    it('should auto-start timer when autoStart is true', () => {
      const config: TimerConfig = {
        initialSeconds: 10,
        autoStart: true,
      };

      const timer = service.createTimer('auto-start-timer', config);

      expect(timer.isRunning()).toBe(true);
    });

    it('should clean up existing timer when creating with same id', () => {
      const config: TimerConfig = {
        initialSeconds: 30,
        autoStart: true,
      };

      const timer1 = service.createTimer('duplicate-id', config);
      expect(timer1.isRunning()).toBe(true);

      const timer2 = service.createTimer('duplicate-id', {
        initialSeconds: 60,
      });
      expect(timer1.isRunning()).toBe(false); // Previous timer should be stopped
      expect(timer2.timeRemaining()).toBe(60);
    });

    it('should call onTick callback during countdown', () => {
      const onTick = jest.fn();
      const config: TimerConfig = {
        initialSeconds: 3,
        autoStart: true,
        onTick,
      };

      const timer = service.createTimer('tick-timer', config);

      jest.advanceTimersByTime(1100);
      expect(onTick).toHaveBeenCalledWith(2);

      jest.advanceTimersByTime(1000);
      expect(onTick).toHaveBeenCalledWith(1);
    });

    it('should call onComplete callback when timer reaches zero', () => {
      const onComplete = jest.fn();
      const config: TimerConfig = {
        initialSeconds: 2,
        autoStart: true,
        onComplete,
      };

      const timer = service.createTimer('complete-timer', config);

      jest.advanceTimersByTime(2100);

      expect(onComplete).toHaveBeenCalled();
      expect(timer.isCompleted()).toBe(true);
      expect(timer.isRunning()).toBe(false);
      expect(timer.timeRemaining()).toBe(0);
    });

    it('should use custom interval when provided', () => {
      const onTick = jest.fn();
      const config: TimerConfig = {
        initialSeconds: 5,
        interval: 500,
        autoStart: true,
        onTick,
      };

      const timer = service.createTimer('custom-interval-timer', config);

      jest.advanceTimersByTime(600);
      expect(onTick).toHaveBeenCalledWith(4);

      jest.advanceTimersByTime(500);
      expect(onTick).toHaveBeenCalledWith(3);
    });
  });

  describe('TimerControl operations', () => {
    let timer: TimerControl;

    beforeEach(() => {
      timer = service.createTimer('control-timer', {
        initialSeconds: 10,
        autoStart: false,
      });
    });

    describe('start', () => {
      it('should start the timer', () => {
        expect(timer.isRunning()).toBe(false);

        timer.start();

        expect(timer.isRunning()).toBe(true);
        expect(timer.isCompleted()).toBe(false);
      });

      it('should not restart if already running', () => {
        timer.start();
        expect(timer.isRunning()).toBe(true);

        const initialTime = timer.timeRemaining();
        timer.start();
        expect(timer.timeRemaining()).toBe(initialTime);
      });
    });

    describe('pause', () => {
      it('should pause the timer', () => {
        timer.start();
        jest.advanceTimersByTime(1100);

        timer.pause();

        expect(timer.isRunning()).toBe(false);
        expect(timer.timeRemaining()).toBe(9);
      });

      it('should not affect time when paused', () => {
        timer.start();
        jest.advanceTimersByTime(1100);
        timer.pause();

        const timeBeforePause = timer.timeRemaining();
        jest.advanceTimersByTime(5000);

        expect(timer.timeRemaining()).toBe(timeBeforePause);
      });
    });

    describe('reset', () => {
      it('should reset timer to initial seconds', () => {
        timer.start();
        jest.advanceTimersByTime(3100);

        timer.reset();

        expect(timer.timeRemaining()).toBe(10);
        expect(timer.isRunning()).toBe(false);
        expect(timer.isCompleted()).toBe(false);
        expect(timer.progress()).toBe(0);
      });

      it('should reset timer to custom seconds', () => {
        timer.start();
        jest.advanceTimersByTime(2100);

        timer.reset(15);

        expect(timer.timeRemaining()).toBe(15);
        expect(timer.isRunning()).toBe(false);
      });
    });

    describe('stop', () => {
      it('should stop timer and reset to initial time', () => {
        timer.start();
        jest.advanceTimersByTime(4100);

        timer.stop();

        expect(timer.timeRemaining()).toBe(10);
        expect(timer.isRunning()).toBe(false);
        expect(timer.isCompleted()).toBe(false);
      });
    });

    describe('updateTime', () => {
      it('should update remaining time when not running', () => {
        timer.updateTime(25);

        expect(timer.timeRemaining()).toBe(25);
      });

      it('should update remaining time when running', () => {
        timer.start();
        jest.advanceTimersByTime(2100);

        timer.updateTime(15);

        expect(timer.timeRemaining()).toBe(15);
        expect(timer.isRunning()).toBe(true);
      });
    });

    describe('destroy', () => {
      it('should stop timer and clean up', () => {
        timer.start();

        timer.destroy();

        expect(timer.isRunning()).toBe(false);

        const timeAfterDestroy = timer.timeRemaining();
        jest.advanceTimersByTime(5000);
        expect(timer.timeRemaining()).toBe(timeAfterDestroy);
      });
    });
  });

  describe('progress calculation', () => {
    it('should calculate progress correctly', () => {
      const timer = service.createTimer('progress-timer', {
        initialSeconds: 10,
        autoStart: true,
      });

      expect(timer.progress()).toBe(0);

      jest.advanceTimersByTime(2100);
      expect(timer.progress()).toBe(20);

      jest.advanceTimersByTime(3000);
      expect(timer.progress()).toBe(50);

      jest.advanceTimersByTime(5000);
      expect(timer.progress()).toBe(100);
    });

    it('should handle progress calculation with custom reset', () => {
      const timer = service.createTimer('reset-progress-timer', {
        initialSeconds: 10,
        autoStart: true,
      });

      jest.advanceTimersByTime(3100);
      expect(timer.progress()).toBe(30);

      timer.reset(20);
      expect(timer.progress()).toBe(0);

      timer.start();
      jest.advanceTimersByTime(5100);
      expect(timer.progress()).toBe(25);
    });
  });

  describe('getTimer', () => {
    it('should retrieve existing timer', () => {
      const originalTimer = service.createTimer('retrieve-timer', {
        initialSeconds: 30,
      });

      const retrievedTimer = service.getTimer('retrieve-timer');

      expect(retrievedTimer).toBeDefined();
      expect(retrievedTimer!.timeRemaining()).toBe(30);
    });

    it('should return null for non-existent timer', () => {
      const timer = service.getTimer('non-existent');

      expect(timer).toBeNull();
    });
  });

  describe('destroyTimer', () => {
    it('should destroy specific timer by id', () => {
      const timer = service.createTimer('destroy-test', {
        initialSeconds: 15,
        autoStart: true,
      });

      expect(timer.isRunning()).toBe(true);

      service.destroyTimer('destroy-test');

      expect(timer.isRunning()).toBe(false);
      expect(service.getTimer('destroy-test')).toBeNull();
    });

    it('should handle destroying non-existent timer', () => {
      expect(() => {
        service.destroyTimer('non-existent-timer');
      }).not.toThrow();
    });
  });

  describe('multiple timers', () => {
    it('should handle multiple concurrent timers', () => {
      const timer1 = service.createTimer('timer1', {
        initialSeconds: 10,
        autoStart: true,
      });

      const timer2 = service.createTimer('timer2', {
        initialSeconds: 20,
        autoStart: true,
      });

      expect(timer1.isRunning()).toBe(true);
      expect(timer2.isRunning()).toBe(true);

      jest.advanceTimersByTime(5100);

      expect(timer1.timeRemaining()).toBe(5);
      expect(timer2.timeRemaining()).toBe(15);
    });

    it('should clean up all timers on service destroy', () => {
      const timer1 = service.createTimer('cleanup1', {
        initialSeconds: 10,
        autoStart: true,
      });

      const timer2 = service.createTimer('cleanup2', {
        initialSeconds: 15,
        autoStart: true,
      });

      expect(timer1.isRunning()).toBe(true);
      expect(timer2.isRunning()).toBe(true);

      service.ngOnDestroy();

      expect(timer1.isRunning()).toBe(false);
      expect(timer2.isRunning()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle timer with 0 initial seconds', () => {
      const onComplete = jest.fn();
      const timer = service.createTimer('zero-timer', {
        initialSeconds: 0,
        autoStart: true,
        onComplete,
      });

      expect(timer.timeRemaining()).toBe(0);

      jest.advanceTimersByTime(1100);

      expect(timer.isCompleted()).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });

    it('should maintain accuracy with long-running timers', () => {
      const timer = service.createTimer('long-timer', {
        initialSeconds: 3600,
        autoStart: true,
      });

      jest.advanceTimersByTime(1800 * 1000);
      expect(timer.timeRemaining()).toBe(1800);
      expect(timer.progress()).toBe(50);
    });
  });
});
