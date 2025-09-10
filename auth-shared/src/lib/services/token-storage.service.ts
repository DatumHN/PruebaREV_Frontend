import { Injectable } from '@angular/core';
import { AuthConfig } from '../config/auth.config';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private config: AuthConfig;

  constructor() {
    this.config = {
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
      tokenRefreshBuffer: 5,
      encryptionEnabled: true,
    };
  }

  getConfig() {
    return this.config;
  }

  setAccessToken(token: string): void {
    if (this.config.encryptionEnabled) {
      localStorage.setItem(
        this.config.storageKeys.accessToken,
        this.encrypt(token),
      );
    } else {
      localStorage.setItem(this.config.storageKeys.accessToken, token);
    }
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(this.config.storageKeys.accessToken);
    if (token && this.config.encryptionEnabled) {
      return this.decrypt(token);
    }
    return token;
  }

  setRefreshToken(token: string): void {
    if (this.config.encryptionEnabled) {
      localStorage.setItem(
        this.config.storageKeys.refreshToken,
        this.encrypt(token),
      );
    } else {
      localStorage.setItem(this.config.storageKeys.refreshToken, token);
    }
  }

  getRefreshToken(): string | null {
    const token = localStorage.getItem(this.config.storageKeys.refreshToken);
    if (token && this.config.encryptionEnabled) {
      return this.decrypt(token);
    }
    return token;
  }

  setUserData(userData: unknown): void {
    // Validate user data before storing
    if (userData && typeof userData === 'object' && 'username' in userData) {
      const user = userData as { username: string };
      if (!user.username || user.username.trim() === '') {
        console.error(
          'TokenStorage: Cannot store user data - username is empty or missing',
        );
        return;
      }
    } else {
      console.error(
        'TokenStorage: Cannot store user data - invalid format or missing username field',
      );
      return;
    }

    const data = JSON.stringify(userData);
    if (this.config.encryptionEnabled) {
      localStorage.setItem(this.config.storageKeys.user, this.encrypt(data));
    } else {
      localStorage.setItem(this.config.storageKeys.user, data);
    }
  }

  getUserData(): unknown {
    const data = localStorage.getItem(this.config.storageKeys.user);

    if (data) {
      try {
        const decryptedData = this.config.encryptionEnabled
          ? this.decrypt(data)
          : data;
        const parsedData = JSON.parse(decryptedData || '');

        // Validate retrieved user data
        if (
          parsedData &&
          typeof parsedData === 'object' &&
          'username' in parsedData
        ) {
          const user = parsedData as { username: string };
          if (!user.username || user.username.trim() === '') {
            console.error(
              'TokenStorage: Retrieved user data has empty username, returning null',
            );
            return null;
          }
        } else {
          console.error(
            'TokenStorage: Retrieved user data is invalid format, returning null',
          );
          return null;
        }

        return parsedData;
      } catch (error) {
        console.error('TokenStorage: Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  setSessionData(sessionData: unknown): void {
    const data = JSON.stringify(sessionData);
    if (this.config.encryptionEnabled) {
      localStorage.setItem(this.config.storageKeys.session, this.encrypt(data));
    } else {
      localStorage.setItem(this.config.storageKeys.session, data);
    }
  }

  getSessionData(): unknown {
    const data = localStorage.getItem(this.config.storageKeys.session);

    if (data) {
      try {
        const decryptedData = this.config.encryptionEnabled
          ? this.decrypt(data)
          : data;
        const parsedData = JSON.parse(decryptedData || '');
        return parsedData;
      } catch (error) {
        console.error('TokenStorage: Error parsing session data:', error);
        return null;
      }
    }
    return null;
  }

  clearAll(): void {
    localStorage.removeItem(this.config.storageKeys.accessToken);
    localStorage.removeItem(this.config.storageKeys.refreshToken);
    localStorage.removeItem(this.config.storageKeys.user);
    localStorage.removeItem(this.config.storageKeys.session);
  }

  private encrypt(text: string): string {
    try {
      return btoa(text);
    } catch (error) {
      console.warn('Encryption failed, storing as plain text:', error);
      return text;
    }
  }

  private decrypt(text: string): string | null {
    try {
      return atob(text);
    } catch (error) {
      console.warn('Decryption failed:', error);
      return null;
    }
  }
}
