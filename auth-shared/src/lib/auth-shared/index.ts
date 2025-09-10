// Public API exports for auth-shared library

// Models
export * from '../models';

// Services
export * from '../services';

// Providers
export * from '../providers';

// Guards
export * from '../guards';

// Configuration
export * from '../config';

// Re-export key types for convenience
export type {
  AuthRequest,
  AuthResponse,
  AuthSuccessResponse,
  AuthErrorResponse,
  User,
  UserSession,
  AuthState,
} from '../models';

export type { AuthConfig } from '../config';

// Re-export key services for convenience
export { AuthService } from '../services/auth.service';
export { AuthStateService } from '../providers/auth-state.service';
export { TokenStorageService } from '../services/token-storage.service';

// Re-export interceptor
export { authHttpInterceptor } from '../providers/auth-http.interceptor';
