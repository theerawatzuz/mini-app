/**
 * API Response Types
 * Standardized response formats for all API endpoints
 */

/**
 * Standard success response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string; // Error code (e.g., "PROVIDER_UNAVAILABLE")
    message: string; // User-friendly error message
    statusCode: number; // HTTP status code
  };
}

/**
 * Error codes used throughout the API
 */
export enum ErrorCode {
  INVALID_COORDINATES = "INVALID_COORDINATES",
  PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE",
  PROVIDER_ERROR = "PROVIDER_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Creates a standardized success response
 * @param data - Response data
 * @returns APIResponse with success status
 */
export function createSuccessResponse<T>(data: T): APIResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a standardized error response
 * @param code - Error code
 * @param message - User-friendly error message
 * @param statusCode - HTTP status code
 * @returns ErrorResponse object
 */
export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number,
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
    },
  };
}
