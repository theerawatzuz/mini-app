/**
 * BadGatewayError
 * Thrown when the weather provider returns invalid or malformed data
 * Maps to HTTP 502 Bad Gateway
 */
export class BadGatewayError extends Error {
  public readonly statusCode: number = 502;
  public readonly code: string = "PROVIDER_ERROR";

  constructor(message: string = "Unable to retrieve weather data") {
    super(message);
    this.name = "BadGatewayError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BadGatewayError);
    }
  }
}
