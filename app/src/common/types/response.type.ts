export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
