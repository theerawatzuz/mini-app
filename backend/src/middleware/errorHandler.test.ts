import { Request, Response, NextFunction } from "express";
import { errorHandler } from "./errorHandler";
import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "../errors";

describe("Error Handler Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Spy on console methods to suppress output during tests
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("Custom Error Handling", () => {
    it("should return 503 response for ServiceUnavailableError", () => {
      const error = new ServiceUnavailableError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "PROVIDER_UNAVAILABLE",
          message: "Weather service is temporarily unavailable",
          statusCode: 503,
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should return 502 response for BadGatewayError", () => {
      const error = new BadGatewayError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(502);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "PROVIDER_ERROR",
          message: "Unable to retrieve weather data",
          statusCode: 502,
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should return 429 response for RateLimitError", () => {
      const error = new RateLimitError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded. Please try again later",
          statusCode: 429,
        },
      });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("Validation Error Handling", () => {
    it("should return 400 response for ValidationError", () => {
      const error = new Error("Invalid coordinates");
      error.name = "ValidationError";

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("should return 400 response for errors with 'Invalid' in message", () => {
      const error = new Error("Invalid latitude value");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });
  });

  describe("Unexpected Error Handling", () => {
    it("should return 500 response for unexpected errors", () => {
      const error = new Error("Something went wrong");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
          statusCode: 500,
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should never expose internal error details to clients", () => {
      const error = new Error("Database connection failed: password=secret123");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.message).toBe("An unexpected error occurred");
      expect(jsonCall.error.message).not.toContain("password");
      expect(jsonCall.error.message).not.toContain("secret123");
    });
  });

  describe("Logging", () => {
    it("should log errors with ERROR level for 5xx errors", () => {
      const error = new ServiceUnavailableError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]"),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("ServiceUnavailableError"),
      );
    });

    it("should log errors with WARN level for 4xx errors", () => {
      const error = new RateLimitError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]"),
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("RateLimitError"),
      );
    });

    it("should log stack trace for unexpected errors", () => {
      const error = new Error("Unexpected error");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Stack trace:"),
      );
    });
  });

  describe("Response Format", () => {
    it("should return standardized ErrorResponse format", () => {
      const error = new BadGatewayError();

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall).toHaveProperty("success", false);
      expect(jsonCall).toHaveProperty("error");
      expect(jsonCall.error).toHaveProperty("code");
      expect(jsonCall.error).toHaveProperty("message");
      expect(jsonCall.error).toHaveProperty("statusCode");
    });
  });
});
