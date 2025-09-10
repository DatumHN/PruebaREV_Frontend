export interface AuthSuccessResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  realm: string;
  roles: string[];
}

export interface AuthErrorResponse {
  error: string;
  message: string;
}

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export function isAuthSuccess(
  response: AuthResponse,
): response is AuthSuccessResponse {
  return 'access_token' in response;
}

export function isAuthError(
  response: AuthResponse,
): response is AuthErrorResponse {
  return 'error' in response;
}
