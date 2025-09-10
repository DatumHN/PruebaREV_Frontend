export interface LogoutSuccessResponse {
  message: string;
}

export interface LogoutErrorResponse {
  error: string;
  message: string;
}

export type LogoutResponse = LogoutSuccessResponse | LogoutErrorResponse;

export function isLogoutSuccess(
  response: LogoutResponse,
): response is LogoutSuccessResponse {
  return !('error' in response) && 'message' in response;
}

export function isLogoutError(
  response: LogoutResponse,
): response is LogoutErrorResponse {
  return 'error' in response && 'message' in response;
}
