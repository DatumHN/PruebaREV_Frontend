export interface AuthConfig {
  apiUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  storageKeys: {
    accessToken: string;
    refreshToken: string;
    user: string;
    session: string;
  };
  tokenRefreshBuffer: number; // minutes before expiry to refresh token
  encryptionEnabled: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  apiUrl: 'http://localhost:8085/api/v1',
  loginEndpoint: '/auth/login',
  refreshEndpoint: '/auth/refresh',
  logoutEndpoint: '/auth/logout',
  storageKeys: {
    accessToken: 'revfa_access_token',
    refreshToken: 'revfa_refresh_token',
    user: 'revfa_user',
    session: 'revfa_session',
  },
  tokenRefreshBuffer: 1, // Refresh token 1 minute before expiry (reduced for short-lived tokens)
  encryptionEnabled: true,
};

export function createAuthConfig(overrides?: Partial<AuthConfig>): AuthConfig {
  return {
    ...DEFAULT_AUTH_CONFIG,
    ...overrides,
  };
}
