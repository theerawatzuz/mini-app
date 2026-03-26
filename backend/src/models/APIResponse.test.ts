import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCode,
  APIResponse,
  ErrorResponse,
} from "./APIResponse";

describe("APIResponse Model", () => {
  describe("createSuccessResponse", () => {
    it("should create success response with data", () => {
      const data = { message: "Success" };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    it("should create success response with string data", () => {
      const response = createSuccessResponse("test");

      expect(response.success).toBe(true);
      expect(response.data).toBe("test");
    });

    it("should create success response with number data", () => {
      const response = createSuccessResponse(42);

      expect(response.success).toBe(true);
      expect(response.data).toBe(42);
    });

    it("should create success response with complex object", () => {
      const data = {
        locationName: "Bangkok",
        temperature: 32.5,
        humidity: 65,
        condition: "Sunny",
        icon: "01d",
      };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });
  });

  describe("createErrorResponse", () => {
    it("should create error response with all fields", () => {
      const response = createErrorResponse(
        ErrorCode.INVALID_COORDINATES,
        "Invalid coordinates provided",
        400,
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.INVALID_COORDINATES);
      expect(response.error.message).toBe("Invalid coordinates provided");
      expect(response.error.statusCode).toBe(400);
    });

    it("should create error response for provider unavailable", () => {
      const response = createErrorResponse(
        ErrorCode.PROVIDER_UNAVAILABLE,
        "Weather service is temporarily unavailable",
        503,
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.PROVIDER_UNAVAILABLE);
      expect(response.error.statusCode).toBe(503);
    });

    it("should create error response for rate limit", () => {
      const response = createErrorResponse(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Rate limit exceeded",
        429,
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(response.error.statusCode).toBe(429);
    });

    it("should create error response for provider error", () => {
      const response = createErrorResponse(
        ErrorCode.PROVIDER_ERROR,
        "Unable to retrieve weather data",
        502,
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.PROVIDER_ERROR);
      expect(response.error.statusCode).toBe(502);
    });

    it("should create error response for internal error", () => {
      const response = createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred",
        500,
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(response.error.statusCode).toBe(500);
    });
  });

  describe("ErrorCode enum", () => {
    it("should have all required error codes", () => {
      expect(ErrorCode.INVALID_COORDINATES).toBe("INVALID_COORDINATES");
      expect(ErrorCode.PROVIDER_UNAVAILABLE).toBe("PROVIDER_UNAVAILABLE");
      expect(ErrorCode.PROVIDER_ERROR).toBe("PROVIDER_ERROR");
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe("RATE_LIMIT_EXCEEDED");
      expect(ErrorCode.INTERNAL_ERROR).toBe("INTERNAL_ERROR");
    });
  });
});
