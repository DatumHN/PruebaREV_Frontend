import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { SessionExtensionModalComponent } from './session-extension-modal.component';
import { SessionManagerService } from '../services/session-manager.service';
import { TimerService } from '../services/timer.service';

describe('SessionExtensionModalComponent', () => {
  let component: SessionExtensionModalComponent;
  let fixture: ComponentFixture<SessionExtensionModalComponent>;
  let sessionManager: any;

  beforeEach(async () => {
    const mockSessionManager = {
      showExtensionModal: signal(false),
      getTimeRemainingSeconds: jest.fn().mockReturnValue(120),
    };

    const mockTimerService = {
      createTimer: jest.fn().mockReturnValue({
        timeRemaining: signal(120),
        isRunning: signal(false),
        isCompleted: signal(false),
        progress: signal(0),
        start: jest.fn(),
        pause: jest.fn(),
        reset: jest.fn(),
        stop: jest.fn(),
        destroy: jest.fn(),
        updateTime: jest.fn(),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [
        SessionExtensionModalComponent,
        CommonModule,
        LucideAngularModule,
      ],
      providers: [
        { provide: SessionManagerService, useValue: mockSessionManager },
        { provide: TimerService, useValue: mockTimerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionExtensionModalComponent);
    component = fixture.componentInstance;
    sessionManager = TestBed.inject(SessionManagerService);
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(component.isExtending()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.timer).toBeNull();
  });

  it('should handle component destruction', () => {
    expect(() => {
      component.ngOnDestroy();
    }).not.toThrow();
  });

  it('should emit modalClosed when backdrop is clicked', () => {
    sessionManager.showExtensionModal.set(true);
    fixture.detectChanges();
    const spy = jest.spyOn(component.modalClosed, 'emit');
    const event = {
      target: fixture.nativeElement.querySelector('.tw-fixed'),
      currentTarget: fixture.nativeElement.querySelector('.tw-fixed'),
    } as unknown as MouseEvent;

    component.onBackdropClick(event);

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit modalClosed when content is clicked', () => {
    sessionManager.showExtensionModal.set(true);
    fixture.detectChanges();
    const spy = jest.spyOn(component.modalClosed, 'emit');
    const event = {
      target: fixture.nativeElement.querySelector('.tw-bg-surface-0'),
      currentTarget: fixture.nativeElement.querySelector('.tw-fixed'),
    } as unknown as MouseEvent;

    component.onBackdropClick(event);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit sessionExtended when onExtendSession is called', () => {
    const spy = jest.spyOn(component.sessionExtended, 'emit');
    component.onExtendSession();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit logoutRequested when onLogout is called', () => {
    const spy = jest.spyOn(component.logoutRequested, 'emit');
    component.onLogout();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit modalClosed when onCancel is called', () => {
    const spy = jest.spyOn(component.modalClosed, 'emit');
    component.onCancel();
    expect(spy).toHaveBeenCalled();
  });
});
