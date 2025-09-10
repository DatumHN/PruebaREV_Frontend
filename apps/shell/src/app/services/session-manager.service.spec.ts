import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { SessionManagerService } from './session-manager.service';
import { AuthService } from '@revfa/auth-shared';
import { AuthStateService } from '@revfa/auth-shared';

// Mock auth-shared dependencies
const mockAuthService = {
  isTokenExpired: jest.fn(),
  isTokenCloseToExpiration: jest.fn(),
  getCurrentSession: jest.fn(),
};

const mockAuthStateService = {
  isAuthenticated: signal(false),
  refreshToken: jest.fn(),
  logout: jest.fn(),
  quickLogout: jest.fn(),
};

const mockRouter = {
  navigate: jest.fn(),
};

describe('SessionManagerService - Session Expiration Flow', () => {
  let service: SessionManagerService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    // Reset default mocks
    mockAuthService.isTokenExpired.mockReturnValue(false);
    mockAuthService.isTokenCloseToExpiration.mockReturnValue(false);
    mockAuthService.getCurrentSession.mockReturnValue({
      expiresAt: Date.now() + 300000, // 5 minutes from now
    });
    mockAuthStateService.refreshToken.mockReturnValue(of({}));
    mockAuthStateService.logout.mockReturnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        SessionManagerService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthStateService, useValue: mockAuthStateService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(SessionManagerService);
  });

  afterEach(() => {
    jest.useRealTimers();
    service.ngOnDestroy();
  });

  describe('Complete Session Monitoring Flow', () => {
    it('should start monitoring when user authenticates and show modal when token is close to expiration', () => {
      // Usuario se autentica
      mockAuthStateService.isAuthenticated.set(true);

      // Simulamos que el token está cerca de expirar (2 minutos)
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: Date.now() + 120000, // 2 minutes
      });

      // Avanzamos el tiempo para que se ejecute el monitoreo (5 segundos de intervalo)
      jest.advanceTimersByTime(5100);

      // Verificamos que el modal se muestre
      expect(service.showExtensionModal()).toBe(true);
    });

    it('should handle complete session extension flow successfully', async () => {
      // Setup: usuario autenticado con token cerca de expirar
      mockAuthStateService.isAuthenticated.set(true);
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: Date.now() + 120000,
      });

      // El monitoreo detecta token cerca de expirar y muestra modal
      jest.advanceTimersByTime(5100);
      expect(service.showExtensionModal()).toBe(true);

      // Usuario extiende la sesión exitosamente
      mockAuthStateService.refreshToken.mockReturnValue(of({ success: true }));
      await service.handleExtendSession();

      // Verificamos que:
      // 1. Se llamó al refresh token
      // 2. El modal se oculta
      // 3. El estado se resetea para permitir mostrar modal nuevamente
      expect(mockAuthStateService.refreshToken).toHaveBeenCalled();
      expect(service.showExtensionModal()).toBe(false);
    });

    it('should handle session extension failure and perform auto-logout', async () => {
      // Setup: modal mostrado
      mockAuthStateService.isAuthenticated.set(true);
      service.triggerExtensionModal();

      // Simulamos fallo en refresh token
      const refreshError = new Error('Token refresh failed');
      mockAuthStateService.refreshToken.mockReturnValue(
        throwError(() => refreshError),
      );

      // Intentamos extender la sesión
      await expect(service.handleExtendSession()).rejects.toThrow(
        'Token refresh failed',
      );

      // Verificamos que se ejecutó quickLogout automáticamente
      expect(mockAuthStateService.quickLogout).toHaveBeenCalled();
      expect(service.showExtensionModal()).toBe(false);
    });

    it('should handle complete logout flow from modal', async () => {
      // Setup: modal mostrado
      service.triggerExtensionModal();
      expect(service.showExtensionModal()).toBe(true);

      // Usuario selecciona logout
      await service.handleLogoutRequest();

      // Verificamos logout exitoso
      expect(mockAuthStateService.logout).toHaveBeenCalled();
      expect(service.showExtensionModal()).toBe(false);
    });

    it('should handle logout failure gracefully', async () => {
      // Setup: modal mostrado
      mockAuthStateService.isAuthenticated.set(true);
      service.triggerExtensionModal();

      // Simulamos fallo en logout
      const logoutError = new Error('Logout failed');
      mockAuthStateService.logout.mockReturnValue(
        throwError(() => logoutError),
      );

      // Ejecutamos logout - debe manejar el error internamente
      await service.handleLogoutRequest();

      // Verificamos que al menos se intentó el logout y se ocultó el modal
      expect(mockAuthStateService.logout).toHaveBeenCalled();
      expect(service.showExtensionModal()).toBe(false);
    });
  });

  describe('Session Expiration Detection', () => {
    it('should immediately logout when token is already expired', () => {
      // Setup: token ya expirado
      mockAuthStateService.isAuthenticated.set(true);
      mockAuthService.isTokenExpired.mockReturnValue(true);

      // El monitoreo detecta token expirado
      jest.advanceTimersByTime(5100);

      // Verificamos logout inmediato sin mostrar modal
      expect(mockAuthStateService.quickLogout).toHaveBeenCalled();
      expect(service.showExtensionModal()).toBe(false);
    });

    it('should auto-logout when modal timeout expires without user action', () => {
      // Setup: modal mostrado con 2 minutos restantes
      mockAuthStateService.isAuthenticated.set(true);
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: Date.now() + 120000, // 2 minutes
      });

      // Monitoreo muestra modal
      jest.advanceTimersByTime(5100);
      expect(service.showExtensionModal()).toBe(true);

      // Simulamos que pasan los 2 minutos sin acción del usuario
      jest.advanceTimersByTime(120000);

      // Verificamos auto-logout
      expect(mockAuthStateService.quickLogout).toHaveBeenCalled();
    });
  });

  describe('Authentication State Management', () => {
    it('should handle authentication state changes', () => {
      // Setup: usuario no autenticado inicialmente
      mockAuthStateService.isAuthenticated.set(false);
      expect(service.showExtensionModal()).toBe(false);

      // Usuario se autentica
      mockAuthStateService.isAuthenticated.set(true);
      // El modal no debe mostrarse automáticamente, solo con token cerca de expirar
      expect(service.showExtensionModal()).toBe(false);

      // Mostramos modal manualmente (simula token cerca de expirar)
      service.triggerExtensionModal();
      expect(service.showExtensionModal()).toBe(true);
    });

    it('should not show modal for unauthenticated users', () => {
      // Setup: usuario no autenticado
      mockAuthStateService.isAuthenticated.set(false);

      // Intentamos trigger manual (para testing)
      service.triggerExtensionModal();

      // Verificamos que no se muestre modal
      expect(service.showExtensionModal()).toBe(false);
    });
  });

  describe('Time Calculations', () => {
    it('should calculate remaining time correctly for various scenarios', () => {
      // Caso 1: Sesión válida con tiempo restante
      const futureTime = Date.now() + 180000; // 3 minutes
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: futureTime,
      });
      expect(service.getTimeRemainingSeconds()).toBeCloseTo(180, 1);

      // Caso 2: Sesión expirada
      const pastTime = Date.now() - 60000; // 1 minute ago
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: pastTime,
      });
      expect(service.getTimeRemainingSeconds()).toBe(0);

      // Caso 3: Sin sesión
      mockAuthService.getCurrentSession.mockReturnValue(null);
      expect(service.getTimeRemainingSeconds()).toBe(0);

      // Caso 4: Sesión sin expiración definida
      mockAuthService.getCurrentSession.mockReturnValue({ expiresAt: null });
      expect(service.getTimeRemainingSeconds()).toBe(0);
    });
  });

  describe('Modal State Management', () => {
    it('should prevent showing modal multiple times for same session', () => {
      // Setup: usuario autenticado, token cerca de expirar
      mockAuthStateService.isAuthenticated.set(true);
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);

      // Primera detección - debe mostrar modal
      jest.advanceTimersByTime(5100);
      expect(service.showExtensionModal()).toBe(true);

      // Segunda detección - NO debe mostrar modal nuevamente
      jest.advanceTimersByTime(5000);
      // El modal sigue mostrado, no se resetea
      expect(service.showExtensionModal()).toBe(true);
    });

    it('should allow showing modal again after successful session extension', async () => {
      // Primera vez: modal mostrado y sesión extendida
      mockAuthStateService.isAuthenticated.set(true);
      service.triggerExtensionModal();
      await service.handleExtendSession();
      expect(service.showExtensionModal()).toBe(false);

      // Segunda vez: token nuevamente cerca de expirar
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);
      jest.advanceTimersByTime(5100);

      // Debe mostrar modal nuevamente
      expect(service.showExtensionModal()).toBe(true);
    });
  });
  describe('when the modal is closed by clicking outside', () => {
    it('the session should be closed after the expiration time', () => {
      // Setup: modal is displayed with 2 minutes remaining
      mockAuthStateService.isAuthenticated.set(true);
      mockAuthService.isTokenCloseToExpiration.mockReturnValue(true);
      mockAuthService.getCurrentSession.mockReturnValue({
        expiresAt: Date.now() + 120000, // 2 minutes
      });

      // Monitoring shows modal
      jest.advanceTimersByTime(5100);
      expect(service.showExtensionModal()).toBe(true);

      // User closes the modal by clicking outside
      service.handleModalClose();

      // We check that the modal is hidden
      expect(service.showExtensionModal()).toBe(false);

      // We simulate that the 2 minutes pass without user action
      jest.advanceTimersByTime(120000);

      // We check that the session is closed
      expect(mockAuthStateService.quickLogout).toHaveBeenCalled();
    });
  });
});
