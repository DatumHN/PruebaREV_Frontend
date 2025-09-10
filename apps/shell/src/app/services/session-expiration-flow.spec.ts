import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { TimerService } from './timer.service';
import { SessionExtensionModalComponent } from '../components/session-extension-modal.component';

const mockSessionManager = {
  showExtensionModal: signal(false),
  getTimeRemainingSeconds: jest.fn().mockReturnValue(120),
  handleExtendSession: jest.fn().mockResolvedValue(undefined),
  handleLogoutRequest: jest.fn().mockResolvedValue(undefined),
  handleModalClose: jest.fn(),
};

describe('Session Expiration Timer Feature - Integration Tests', () => {
  let timerService: TimerService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [TimerService],
    });
    timerService = TestBed.inject(TimerService);
  });

  afterEach(() => {
    jest.useRealTimers();
    timerService.ngOnDestroy();
    jest.clearAllMocks();
  });

  describe('Complete Session Expiration Flow', () => {
    it('should handle the complete session warning flow with timer countdown', () => {
      // Paso 1: Sistema detecta que quedan 2 minutos para expirar (120 segundos)
      const sessionTimer = timerService.createTimer('session-expiration', {
        initialSeconds: 120,
        autoStart: true,
        onComplete: () => {
          // Simula auto-logout cuando el tiempo se agota
          console.log('Session expired - auto logout');
        },
        onTick: (remainingSeconds) => {
          // Simula actualización de UI cada segundo
          console.log(
            `Time remaining: ${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}`,
          );
        },
      });

      // Verificamos estado inicial
      expect(sessionTimer.timeRemaining()).toBe(120);
      expect(sessionTimer.isRunning()).toBe(true);
      expect(sessionTimer.progress()).toBe(0);

      // Paso 2: Simulamos 30 segundos transcurridos
      jest.advanceTimersByTime(30100); // 30 segundos + buffer

      // Verificamos progreso
      expect(sessionTimer.timeRemaining()).toBe(90); // 1:30 restante
      expect(sessionTimer.progress()).toBe(25); // 25% completado
      expect(sessionTimer.isRunning()).toBe(true);

      // Paso 3: Usuario extiende la sesión (caso exitoso)
      sessionTimer.reset(300); // Se reinicia con 5 minutos nuevos

      // Verificamos reset exitoso
      expect(sessionTimer.timeRemaining()).toBe(300);
      expect(sessionTimer.progress()).toBe(0);
      expect(sessionTimer.isCompleted()).toBe(false);
    });
  });

  describe('Session Extension Scenarios', () => {
    it('should handle successful session extension workflow', () => {
      const callbacks = {
        onTick: jest.fn(),
        onComplete: jest.fn(),
      };

      // Paso 1: Timer inicial de 2 minutos (como en README)
      const timer = timerService.createTimer('extension-test', {
        initialSeconds: 120,
        autoStart: true,
        onTick: callbacks.onTick,
        onComplete: callbacks.onComplete,
      });

      // Paso 2: Pasa 1 minuto
      jest.advanceTimersByTime(60100);
      expect(timer.timeRemaining()).toBe(60); // 1 minuto restante
      expect(callbacks.onTick).toHaveBeenCalledWith(60);

      // Paso 3: Usuario extiende exitosamente (reinicia con 5 minutos)
      timer.reset(300);
      timer.start();

      expect(timer.timeRemaining()).toBe(300);
      expect(timer.isCompleted()).toBe(false);
      expect(callbacks.onComplete).not.toHaveBeenCalled();

      // Paso 4: Verificamos que continúa normalmente
      jest.advanceTimersByTime(30100);
      expect(timer.timeRemaining()).toBe(270); // 4:30 restante
    });

    it('should handle failed session extension (logout scenario)', () => {
      let autoLogoutTriggered = false;

      const timer = timerService.createTimer('failed-extension', {
        initialSeconds: 60, // 1 minuto para prueba rápida
        autoStart: true,
        onComplete: () => {
          autoLogoutTriggered = true;
        },
      });

      // Simulamos que falla la extensión y el tiempo se agota
      jest.advanceTimersByTime(60100);

      expect(timer.isCompleted()).toBe(true);
      expect(autoLogoutTriggered).toBe(true);
    });
  });
});
