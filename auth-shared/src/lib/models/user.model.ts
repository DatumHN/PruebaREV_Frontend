export interface User {
  username: string;
  roles: string[];
  realm: string;
  scope: string;
}

export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number;
  isAuthenticated: boolean;
}
