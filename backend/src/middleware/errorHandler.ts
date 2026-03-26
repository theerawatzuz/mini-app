import { Request, Response, NextFunction } from "express";
import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "../errors";
import { createErrorResponse } from "../models/APIResponse";

/**
 * Global error handling middleware
 * Maps custom error classes to HTTP status codes and returns standardized ErrorResponse format
 * Logs errors with appropriate log levels and never exposes internal error details to clients
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Log error with appropriate level
  if (err instanceof ServiceUnavailableError) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ServiceUnavailableError: ${err.message}`,
    );
    const response = createErrorResponse(err.code, err.message, err.statusCode);
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof BadGatewayError) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - BadGatewayError: ${err.message}`,
    );
    const response = createErrorResponse(err.code, err.message, err.statusCode);
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof RateLimitError) {
    console.warn(
      `[WARN] ${new Date().toISOString()} - RateLimitError: ${err.message}`,
    );
    const response = createErrorResponse(err.code, err.message, err.statusCode);
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle validation errors (400 Bad Request)
  if (err.name === "ValidationError" || err.message.includes("Invalid")) {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ValidationError: ${err.message}`,
    );
    const response = createErrorResponse(
      "INVALID_COORDINATES",
      "Invalid coordinates provided",
      400,
    );
    res.status(400).json(response);
    return;
  }

  // Handle unexpected errors (500 Internal Server Error)
  // Log full error details for debugging but never expose to client
  console.error(
    `[ERROR] ${new Date().toISOString()} - Unexpected error: ${err.message}`,
  );
  console.error(`Stack trace: ${err.stack}`);

  const response = createErrorResponse(
    "INTERNAL_ERROR",
    "An unexpected error occurred",
    500,
  );
  res.status(500).json(response);
}
