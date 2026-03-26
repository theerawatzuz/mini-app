/**
 * ServiceUnavailableError
 * Thrown when the weather provider service is unreachable due to network issues
 * Maps to HTTP 503 Service Unavailable
 */
export class ServiceUnavailableError extends Error {
  public readonly statusCode: number = 503;
  public readonly code: string = "PROVIDER_UNAVAILABLE";

  constructor(message: string = "Weather service is temporarily unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceUnavailableError);
    }
  }
}
