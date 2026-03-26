import {
  ServiceUnavailableError,
  BadGatewayError,
  RateLimitError,
} from "./index";

describe("Custom Error Classes", () => {
  describe("ServiceUnavailableError", () => {
    it("should have correct status code 503", () => {
      const error = new ServiceUnavailableError();
      expect(error.statusCode).toBe(503);
    });

    it("should have correct error code", () => {
      const error = new ServiceUnavailableError();
      expect(error.code).toBe("PROVIDER_UNAVAILABLE");
    });

    it("should have default message", () => {
      const error = new ServiceUnavailableError();
      expect(error.message).toBe("Weather service is temporarily unavailable");
    });

    it("should accept custom message", () => {
      const customMessage = "Custom unavailable message";
      const error = new ServiceUnavailableError(customMessage);
      expect(error.message).toBe(customMessage);
    });

    it("should have correct name", () => {
      const error = new ServiceUnavailableError();
      expect(error.name).toBe("ServiceUnavailableError");
    });

    it("should be instance of Error", () => {
      const error = new ServiceUnavailableError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("BadGatewayError", () => {
    it("should have correct status code 502", () => {
      const error = new BadGatewayError();
      expect(error.statusCode).toBe(502);
    });

    it("should have correct error code", () => {
      const error = new BadGatewayError();
      expect(error.code).toBe("PROVIDER_ERROR");
    });

    it("should have default message", () => {
      const error = new BadGatewayError();
      expect(error.message).toBe("Unable to retrieve weather data");
    });

    it("should accept custom message", () => {
      const customMessage = "Invalid data format";
      const error = new BadGatewayError(customMessage);
      expect(error.message).toBe(customMessage);
    });

    it("should have correct name", () => {
      const error = new BadGatewayError();
      expect(error.name).toBe("BadGatewayError");
    });

    it("should be instance of Error", () => {
      const error = new BadGatewayError();
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("RateLimitError", () => {
    it("should have correct status code 429", () => {
      const error = new RateLimitError();
      expect(error.statusCode).toBe(429);
    });

    it("should have correct error code", () => {
      const error = new RateLimitError();
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
    });

    it("should have default message", () => {
      const error = new RateLimitError();
      expect(error.message).toBe("Rate limit exceeded. Please try again later");
    });

    it("should accept custom message", () => {
      const customMessage = "Too many requests";
      const error = new RateLimitError(customMessage);
      expect(error.message).toBe(customMessage);
    });

    it("should have correct name", () => {
      const error = new RateLimitError();
      expect(error.name).toBe("RateLimitError");
    });

    it("should be instance of Error", () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(Error);
    });
  });
});
