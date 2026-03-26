import { Request, Response } from "express";
import { WeatherController } from "./WeatherController";
import { WeatherService } from "../services/WeatherService";
import {
  RateLimitError,
  BadGatewayError,
  ServiceUnavailableError,
} from "../errors";
import { WeatherData } from "../models/WeatherData";
import fc from "fast-check";

// Mock WeatherService
jest.mock("../services/WeatherService");

describe("WeatherController", () => {
  let weatherController: WeatherController;
  let mockWeatherService: jest.Mocked<WeatherService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Create mock WeatherService
    mockWeatherService = new WeatherService(
      "test-key",
      "openweathermap",
    ) as jest.Mocked<WeatherService>;

    weatherController = new WeatherController(mockWeatherService);

    // Setup mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup mock request
    mockRequest = {
      query: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/weather", () => {
    it("should return 400 when lat parameter is missing", async () => {
      mockRequest.query = { lon: "100" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Missing required parameters: lat and lon",
          statusCode: 400,
        },
      });
    });

    it("should return 400 when lon parameter is missing", async () => {
      mockRequest.query = { lat: "13.7" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Missing required parameters: lat and lon",
          statusCode: 400,
        },
      });
    });

    it("should return 400 for invalid latitude (> 90)", async () => {
      mockRequest.query = { lat: "91", lon: "100" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });

    it("should return 400 for invalid latitude (< -90)", async () => {
      mockRequest.query = { lat: "-91", lon: "100" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });

    it("should return 400 for invalid longitude (> 180)", async () => {
      mockRequest.query = { lat: "13.7", lon: "181" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });

    it("should return 400 for invalid longitude (< -180)", async () => {
      mockRequest.query = { lat: "13.7", lon: "-181" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });

    it("should return 400 for non-numeric latitude", async () => {
      mockRequest.query = { lat: "invalid", lon: "100" };

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INVALID_COORDINATES",
          message: "Invalid coordinates provided",
          statusCode: 400,
        },
      });
    });

    it("should return 200 with weather data for valid coordinates", async () => {
      const mockWeatherData: WeatherData = {
        locationName: "Bangkok, TH",
        temperature: 32.5,
        humidity: 65,
        condition: "Partly Cloudy",
        icon: "02d",
      };

      mockRequest.query = { lat: "13.7563", lon: "100.5018" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockResolvedValue(mockWeatherData);

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockWeatherService.getWeatherByCoordinates).toHaveBeenCalledWith(
        13.7563,
        100.5018,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockWeatherData,
      });
    });

    it("should throw RateLimitError when service throws it", async () => {
      mockRequest.query = { lat: "13.7563", lon: "100.5018" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockRejectedValue(new RateLimitError());

      await expect(
        weatherController.getWeather(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(RateLimitError);
    });

    it("should throw BadGatewayError when service throws it", async () => {
      mockRequest.query = { lat: "13.7563", lon: "100.5018" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockRejectedValue(new BadGatewayError());

      await expect(
        weatherController.getWeather(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(BadGatewayError);
    });

    it("should throw ServiceUnavailableError when service throws it", async () => {
      mockRequest.query = { lat: "13.7563", lon: "100.5018" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockRejectedValue(new ServiceUnavailableError());

      await expect(
        weatherController.getWeather(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow(ServiceUnavailableError);
    });

    it("should throw unexpected errors", async () => {
      mockRequest.query = { lat: "13.7563", lon: "100.5018" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockRejectedValue(new Error("Unexpected error"));

      await expect(
        weatherController.getWeather(
          mockRequest as Request,
          mockResponse as Response,
        ),
      ).rejects.toThrow("Unexpected error");
    });

    it("should accept coordinates at exact boundaries", async () => {
      const mockWeatherData: WeatherData = {
        locationName: "North Pole",
        temperature: -30,
        humidity: 80,
        condition: "Clear",
        icon: "01d",
      };

      // Test latitude = 90, longitude = 180
      mockRequest.query = { lat: "90", lon: "180" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockResolvedValue(mockWeatherData);

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockWeatherService.getWeatherByCoordinates).toHaveBeenCalledWith(
        90,
        180,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should accept coordinates at negative boundaries", async () => {
      const mockWeatherData: WeatherData = {
        locationName: "South Pole",
        temperature: -40,
        humidity: 70,
        condition: "Clear",
        icon: "01d",
      };

      // Test latitude = -90, longitude = -180
      mockRequest.query = { lat: "-90", lon: "-180" };
      mockWeatherService.getWeatherByCoordinates = jest
        .fn()
        .mockResolvedValue(mockWeatherData);

      await weatherController.getWeather(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockWeatherService.getWeatherByCoordinates).toHaveBeenCalledWith(
        -90,
        -180,
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe("Property-Based Tests", () => {
    /**
     * Property 4: Backend Weather Data Fetch
     * **Validates: Requirements 2.2**
     *
     * For any valid coordinate pair received by the backend API,
     * the backend should make a request to the weather provider API with those coordinates.
     */
    it("Property 4: Backend makes request to weather provider for valid coordinates", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random valid coordinates
          fc.float({ min: -90, max: 90 }),
          fc.float({ min: -180, max: 180 }),
          async (lat, lon) => {
            // Setup mock weather data response
            const mockWeatherData: WeatherData = {
              locationName: "Test Location",
              temperature: 20,
              humidity: 50,
              condition: "Clear",
              icon: "01d",
            };

            // Reset mocks for each iteration
            jest.clearAllMocks();

            // Mock the weather service to return data
            mockWeatherService.getWeatherByCoordinates = jest
              .fn()
              .mockResolvedValue(mockWeatherData);

            // Setup request with generated coordinates
            mockRequest.query = {
              lat: lat.toString(),
              lon: lon.toString(),
            };

            // Call the controller
            await weatherController.getWeather(
              mockRequest as Request,
              mockResponse as Response,
            );

            // Verify that the weather service was called with the exact coordinates
            expect(
              mockWeatherService.getWeatherByCoordinates,
            ).toHaveBeenCalledTimes(1);

            // Get the actual arguments passed to the mock
            const [actualLat, actualLon] =
              mockWeatherService.getWeatherByCoordinates.mock.calls[0];

            // Verify coordinates match (handling -0 vs 0 edge case)
            expect(
              Object.is(actualLat, lat) ||
                (actualLat === lat && actualLat === 0 && lat === 0),
            ).toBe(true);
            expect(
              Object.is(actualLon, lon) ||
                (actualLon === lon && actualLon === 0 && lon === 0),
            ).toBe(true);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });

    /**
     * Property 5: Weather Data Completeness
     * **Validates: Requirements 2.4**
     *
     * For any successful weather data response from the backend API,
     * the response should include all required fields: locationName (non-empty string),
     * temperature (number), humidity (number between 0-100), condition (non-empty string),
     * and icon (non-empty string).
     */
    it("Property 5: Successful responses contain all required weather data fields", async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random valid coordinates (excluding NaN and Infinity)
          fc
            .float({ min: -90, max: 90, noNaN: true })
            .filter((n) => isFinite(n)),
          fc
            .float({ min: -180, max: 180, noNaN: true })
            .filter((n) => isFinite(n)),
          // Generate random valid weather data
          fc.record({
            locationName: fc.string({ minLength: 1 }),
            temperature: fc
              .float({ min: -50, max: 60, noNaN: true })
              .filter((n) => isFinite(n)),
            humidity: fc
              .float({ min: 0, max: 100, noNaN: true })
              .filter((n) => isFinite(n)),
            condition: fc.string({ minLength: 1 }),
            icon: fc.string({ minLength: 1 }),
          }),
          async (lat, lon, weatherData) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            // Mock the weather service to return the generated weather data
            mockWeatherService.getWeatherByCoordinates = jest
              .fn()
              .mockResolvedValue(weatherData);

            // Setup request with generated coordinates
            mockRequest.query = {
              lat: lat.toString(),
              lon: lon.toString(),
            };

            // Call the controller
            await weatherController.getWeather(
              mockRequest as Request,
              mockResponse as Response,
            );

            // Verify successful response (status 200)
            expect(statusMock).toHaveBeenCalledWith(200);

            // Get the response data
            const responseData = jsonMock.mock.calls[0][0];

            // Verify response structure
            expect(responseData.success).toBe(true);
            expect(responseData.data).toBeDefined();

            // Verify all required fields are present
            const data = responseData.data;
            expect(data).toHaveProperty("locationName");
            expect(data).toHaveProperty("temperature");
            expect(data).toHaveProperty("humidity");
            expect(data).toHaveProperty("condition");
            expect(data).toHaveProperty("icon");

            // Verify field types and constraints
            expect(typeof data.locationName).toBe("string");
            expect(data.locationName.length).toBeGreaterThan(0);

            expect(typeof data.temperature).toBe("number");
            expect(isNaN(data.temperature)).toBe(false);

            expect(typeof data.humidity).toBe("number");
            expect(isNaN(data.humidity)).toBe(false);
            expect(data.humidity).toBeGreaterThanOrEqual(0);
            expect(data.humidity).toBeLessThanOrEqual(100);

            expect(typeof data.condition).toBe("string");
            expect(data.condition.length).toBeGreaterThan(0);

            expect(typeof data.icon).toBe("string");
            expect(data.icon.length).toBeGreaterThan(0);

            return true;
          },
        ),
        { numRuns: 20 },
      );
    });
  });
});
