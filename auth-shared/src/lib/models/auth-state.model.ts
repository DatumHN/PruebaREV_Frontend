import { User, UserSession } from './user.model';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  user: User | null;
  session: UserSession | null;
  error: string | null;
  logoutError: string | null;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  user: null,
  session: null,
  error: null,
  logoutError: null,
};

export enum AuthAction {
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT_START = 'LOGOUT_START',
  LOGOUT_SUCCESS = 'LOGOUT_SUCCESS',
  LOGOUT_FAILURE = 'LOGOUT_FAILURE',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  CLEAR_ERROR = 'CLEAR_ERROR',
  CLEAR_LOGOUT_ERROR = 'CLEAR_LOGOUT_ERROR',
}
