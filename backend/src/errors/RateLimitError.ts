/**
 * RateLimitError
 * Thrown when the weather provider returns a 429 rate limit response
 * Maps to HTTP 429 Too Many Requests
 */
export class RateLimitError extends Error {
  public readonly statusCode: number = 429;
  public readonly code: string = "RATE_LIMIT_EXCEEDED";

  constructor(message: string = "Rate limit exceeded. Please try again later") {
    super(message);
    this.name = "RateLimitError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}
